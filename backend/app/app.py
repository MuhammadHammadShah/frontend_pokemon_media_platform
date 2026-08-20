from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from contextlib import asynccontextmanager
import shutil
import uuid
import os
import tempfile
from typing import Optional, List, Dict
from datetime import datetime

from app.schemas import (
    UserCreate, UserRead, UserUpdate,
    PostResponse, CommentCreate, CommentRead,
    ReactionCreate, ReactionRead,
    TrainerProfileRead, TrainerProfileUpdate
)
from app.db import (
    Post, User, Reaction, Comment, TrainerProfile,
    create_db_and_tables, get_async_session
)
from app.images import upload_media_file
from app.users import auth_backend, fastapi_users, current_active_user


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    os.makedirs("uploads", exist_ok=True)
    yield


app = FastAPI(
    title="Pokémon Social Media Platform API",
    description="Backend API for Pokémon media platform with posts, reactions, comments, and trainer profiles.",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for cross-origin frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads for fallback static file serving
if not os.path.exists("uploads"):
    os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# -------------------------------------------------------------
# Auth Routers
# -------------------------------------------------------------
app.include_router(fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"])
app.include_router(fastapi_users.get_register_router(UserRead, UserCreate), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_reset_password_router(), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_verify_router(UserRead), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_users_router(UserRead, UserUpdate), prefix="/users", tags=["users"])


# -------------------------------------------------------------
# Trainer Profile Endpoints
# -------------------------------------------------------------

@app.get("/trainers/me", response_model=TrainerProfileRead, tags=["trainers"])
async def get_my_trainer_profile(
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
):
    result = await session.execute(select(TrainerProfile).where(TrainerProfile.user_id == user.id))
    profile = result.scalars().first()
    if not profile:
        profile = TrainerProfile(
            user_id=user.id,
            trainer_name=user.email.split("@")[0],
            starter_pokemon="Pikachu",
            favorite_pokemon="Pikachu",
            bio="Pokémon Trainer ready for battle!"
        )
        session.add(profile)
        await session.commit()
        await session.refresh(profile)
    return profile


@app.patch("/trainers/me", response_model=TrainerProfileRead, tags=["trainers"])
async def update_my_trainer_profile(
    update_data: TrainerProfileUpdate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
):
    result = await session.execute(select(TrainerProfile).where(TrainerProfile.user_id == user.id))
    profile = result.scalars().first()
    if not profile:
        profile = TrainerProfile(user_id=user.id)
        session.add(profile)

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    await session.commit()
    await session.refresh(profile)
    return profile


@app.get("/trainers/{user_id}", tags=["trainers"])
async def get_trainer_details(
    user_id: str,
    session: AsyncSession = Depends(get_async_session)
):
    try:
        target_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid User UUID format")

    user_res = await session.execute(select(User).where(User.id == target_uuid))
    target_user = user_res.scalars().first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Trainer not found")

    profile_res = await session.execute(select(TrainerProfile).where(TrainerProfile.user_id == target_uuid))
    profile = profile_res.scalars().first()

    posts_res = await session.execute(select(Post).where(Post.user_id == target_uuid).order_by(Post.created_at.desc()))
    posts = posts_res.scalars().all()

    # Calculate Gym Badges based on accomplishments
    badges = []
    if len(posts) >= 1:
        badges.append({"name": "Boulder Badge", "icon": "🪨", "desc": "Posted your first Pokémon capture"})
    if any(p.pokemon_type1 == "Water" or p.pokemon_type2 == "Water" for p in posts):
        badges.append({"name": "Cascade Badge", "icon": "🌊", "desc": "Shared a Water-type Pokémon"})
    if any(p.pokemon_type1 == "Electric" or p.pokemon_type2 == "Electric" for p in posts):
        badges.append({"name": "Thunder Badge", "icon": "⚡", "desc": "Shared an Electric-type Pokémon"})
    if any(p.pokemon_type1 == "Fire" or p.pokemon_type2 == "Fire" for p in posts):
        badges.append({"name": "Volcano Badge", "icon": "🔥", "desc": "Shared a Fire-type Pokémon"})
    if len(posts) >= 5:
        badges.append({"name": "Rainbow Badge", "icon": "🌈", "desc": "Published 5+ Pokémon media items"})
    if len(posts) >= 10:
        badges.append({"name": "Earth Badge", "icon": "🌍", "desc": "Master Trainer with 10+ posts"})

    trainer_level = 1 + (len(posts) * 2) + len(badges)

    return {
        "user_id": str(target_user.id),
        "email": target_user.email,
        "trainer_name": profile.trainer_name if profile else target_user.email.split("@")[0],
        "starter_pokemon": profile.starter_pokemon if profile else "Pikachu",
        "favorite_pokemon": profile.favorite_pokemon if profile else "Pikachu",
        "bio": profile.bio if profile else "",
        "avatar_url": profile.avatar_url if profile else None,
        "level": trainer_level,
        "badges": badges,
        "total_posts": len(posts)
    }


# -------------------------------------------------------------
# Post Upload & Media Handling
# -------------------------------------------------------------

@app.post("/upload", tags=["posts"])
async def upload_file(
    file: UploadFile = File(...),
    caption: str = Form(""),
    pokemon_name: Optional[str] = Form(None),
    pokemon_dex_id: Optional[int] = Form(None),
    pokemon_type1: Optional[str] = Form(None),
    pokemon_type2: Optional[str] = Form(None),
    category: Optional[str] = Form("General"),
    rarity: Optional[str] = Form(None),
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
):
    temp_file_path = None
    try:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file_path = temp_file.name
            shutil.copyfileobj(file.file, temp_file)

        with open(temp_file_path, "rb") as f:
            upload_result = upload_media_file(f, file.filename, file.content_type or "")

        file_type = "video" if (file.content_type and file.content_type.startswith("video/")) else "image"

        post = Post(
            user_id=user.id,
            caption=caption,
            url=upload_result["url"],
            file_type=file_type,
            file_name=upload_result["name"],
            pokemon_name=pokemon_name,
            pokemon_dex_id=pokemon_dex_id,
            pokemon_type1=pokemon_type1,
            pokemon_type2=pokemon_type2,
            category=category or "General",
            rarity=rarity
        )
        session.add(post)
        await session.commit()
        await session.refresh(post)
        return post

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Prevent disk leak: close file and remove temp file
        if file.file:
            file.file.close()
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception:
                pass


# -------------------------------------------------------------
# Feed & Post Listing
# -------------------------------------------------------------

@app.get("/feed", tags=["posts"])
async def get_feed(
    category: Optional[str] = Query(None, description="Filter by category: TCG Card, Fan Art, Battle Clip, General"),
    pokemon_type: Optional[str] = Query(None, description="Filter by Pokemon type: Fire, Water, Electric, etc."),
    search: Optional[str] = Query(None, description="Search term across captions and Pokemon names"),
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
):
    query = select(Post).order_by(Post.created_at.desc())

    if category and category.lower() != "all":
        query = query.where(func.lower(Post.category) == category.lower())

    if pokemon_type and pokemon_type.lower() != "all":
        query = query.where(
            (func.lower(Post.pokemon_type1) == pokemon_type.lower()) |
            (func.lower(Post.pokemon_type2) == pokemon_type.lower())
        )

    if search:
        search_pattern = f"%{search.lower()}%"
        query = query.where(
            func.lower(Post.caption).like(search_pattern) |
            func.lower(Post.pokemon_name).like(search_pattern)
        )

    result = await session.execute(query)
    posts = result.scalars().all()

    # Pre-fetch users, profiles, reactions, and comments
    user_res = await session.execute(select(User))
    users = user_res.scalars().all()
    user_map = {u.id: u.email for u in users}

    profile_res = await session.execute(select(TrainerProfile))
    profiles = profile_res.scalars().all()
    profile_map = {p.user_id: p for p in profiles}

    post_ids = [p.id for p in posts]
    reactions_map: Dict[uuid.UUID, Dict[str, int]] = {pid: {} for pid in post_ids}
    user_reaction_map: Dict[uuid.UUID, Optional[str]] = {pid: None for pid in post_ids}

    if post_ids:
        react_res = await session.execute(select(Reaction).where(Reaction.post_id.in_(post_ids)))
        all_reactions = react_res.scalars().all()
        for r in all_reactions:
            reactions_map[r.post_id][r.reaction_type] = reactions_map[r.post_id].get(r.reaction_type, 0) + 1
            if r.user_id == user.id:
                user_reaction_map[r.post_id] = r.reaction_type

        comment_res = await session.execute(
            select(Comment).where(Comment.post_id.in_(post_ids)).order_by(Comment.created_at.asc())
        )
        all_comments = comment_res.scalars().all()
        comments_by_post: Dict[uuid.UUID, List[CommentRead]] = {pid: [] for pid in post_ids}
        for c in all_comments:
            c_profile = profile_map.get(c.user_id)
            comments_by_post[c.post_id].append(
                CommentRead(
                    id=str(c.id),
                    post_id=str(c.post_id),
                    user_id=str(c.user_id),
                    user_email=user_map.get(c.user_id, "Trainer"),
                    trainer_name=c_profile.trainer_name if c_profile else user_map.get(c.user_id, "Trainer").split("@")[0],
                    content=c.content,
                    created_at=c.created_at.isoformat()
                )
            )
    else:
        comments_by_post = {}

    posts_data = []
    for post in posts:
        post_profile = profile_map.get(post.user_id)
        post_reactions = reactions_map.get(post.id, {})
        total_reactions = sum(post_reactions.values())
        post_comments = comments_by_post.get(post.id, [])

        posts_data.append(
            PostResponse(
                id=str(post.id),
                user_id=str(post.user_id),
                email=user_map.get(post.user_id, "Unknown Trainer"),
                trainer_name=post_profile.trainer_name if post_profile else user_map.get(post.user_id, "Trainer").split("@")[0],
                starter_pokemon=post_profile.starter_pokemon if post_profile else "Pikachu",
                caption=post.caption or "",
                url=post.url,
                file_type=post.file_type,
                file_name=post.file_name,
                created_at=post.created_at.isoformat(),
                is_owner=(post.user_id == user.id),
                pokemon_name=post.pokemon_name,
                pokemon_dex_id=post.pokemon_dex_id,
                pokemon_type1=post.pokemon_type1,
                pokemon_type2=post.pokemon_type2,
                category=post.category or "General",
                rarity=post.rarity,
                reactions=post_reactions,
                user_reaction=user_reaction_map.get(post.id),
                total_reactions=total_reactions,
                comments_count=len(post_comments),
                recent_comments=post_comments
            ).model_dump()
        )

    return {"posts": posts_data}


# -------------------------------------------------------------
# Reactions (Pokéballs & Elemental Likes)
# -------------------------------------------------------------

@app.post("/posts/{post_id}/react", tags=["reactions"])
async def react_to_post(
    post_id: str,
    reaction_data: ReactionCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
):
    try:
        post_uuid = uuid.UUID(post_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Post UUID")

    post_res = await session.execute(select(Post).where(Post.id == post_uuid))
    post = post_res.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing_res = await session.execute(
        select(Reaction).where(and_(Reaction.post_id == post_uuid, Reaction.user_id == user.id))
    )
    existing_reaction = existing_res.scalars().first()

    if existing_reaction:
        if existing_reaction.reaction_type == reaction_data.reaction_type:
            # Toggle off if same reaction clicked
            await session.delete(existing_reaction)
            await session.commit()
            return {"action": "removed", "reaction_type": reaction_data.reaction_type}
        else:
            # Update to new reaction
            existing_reaction.reaction_type = reaction_data.reaction_type
            await session.commit()
            return {"action": "updated", "reaction_type": reaction_data.reaction_type}
    else:
        new_reaction = Reaction(
            post_id=post_uuid,
            user_id=user.id,
            reaction_type=reaction_data.reaction_type
        )
        session.add(new_reaction)
        await session.commit()
        return {"action": "added", "reaction_type": reaction_data.reaction_type}


@app.delete("/posts/{post_id}/react", tags=["reactions"])
async def remove_reaction(
    post_id: str,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
):
    try:
        post_uuid = uuid.UUID(post_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Post UUID")

    result = await session.execute(
        select(Reaction).where(and_(Reaction.post_id == post_uuid, Reaction.user_id == user.id))
    )
    reaction = result.scalars().first()
    if not reaction:
        raise HTTPException(status_code=404, detail="Reaction not found")

    await session.delete(reaction)
    await session.commit()
    return {"success": True, "message": "Reaction removed"}


# -------------------------------------------------------------
# Comments Endpoints
# -------------------------------------------------------------

@app.post("/posts/{post_id}/comments", response_model=CommentRead, tags=["comments"])
async def add_comment(
    post_id: str,
    comment_data: CommentCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
):
    try:
        post_uuid = uuid.UUID(post_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Post UUID")

    post_res = await session.execute(select(Post).where(Post.id == post_uuid))
    post = post_res.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = Comment(
        post_id=post_uuid,
        user_id=user.id,
        content=comment_data.content.strip()
    )
    session.add(comment)
    await session.commit()
    await session.refresh(comment)

    profile_res = await session.execute(select(TrainerProfile).where(TrainerProfile.user_id == user.id))
    profile = profile_res.scalars().first()

    return CommentRead(
        id=str(comment.id),
        post_id=str(comment.post_id),
        user_id=str(comment.user_id),
        user_email=user.email,
        trainer_name=profile.trainer_name if profile else user.email.split("@")[0],
        content=comment.content,
        created_at=comment.created_at.isoformat()
    )


@app.get("/posts/{post_id}/comments", response_model=List[CommentRead], tags=["comments"])
async def get_post_comments(
    post_id: str,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
):
    try:
        post_uuid = uuid.UUID(post_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Post UUID")

    result = await session.execute(
        select(Comment).where(Comment.post_id == post_uuid).order_by(Comment.created_at.asc())
    )
    comments = result.scalars().all()

    user_res = await session.execute(select(User))
    users = user_res.scalars().all()
    user_map = {u.id: u.email for u in users}

    profile_res = await session.execute(select(TrainerProfile))
    profiles = profile_res.scalars().all()
    profile_map = {p.user_id: p for p in profiles}

    return [
        CommentRead(
            id=str(c.id),
            post_id=str(c.post_id),
            user_id=str(c.user_id),
            user_email=user_map.get(c.user_id, "Trainer"),
            trainer_name=profile_map[c.user_id].trainer_name if c.user_id in profile_map else user_map.get(c.user_id, "Trainer").split("@")[0],
            content=c.content,
            created_at=c.created_at.isoformat()
        )
        for c in comments
    ]


@app.delete("/comments/{comment_id}", tags=["comments"])
async def delete_comment(
    comment_id: str,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
):
    try:
        comment_uuid = uuid.UUID(comment_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Comment UUID")

    result = await session.execute(select(Comment).where(Comment.id == comment_uuid))
    comment = result.scalars().first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own comments")

    await session.delete(comment)
    await session.commit()
    return {"success": True, "message": "Comment deleted successfully"}


# -------------------------------------------------------------
# Post Deletion
# -------------------------------------------------------------

@app.delete("/posts/{post_id}", tags=["posts"])
async def delete_post(
    post_id: str,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
):
    try:
        post_uuid = uuid.UUID(post_id)
        result = await session.execute(select(Post).where(Post.id == post_uuid))
        post = result.scalars().first()

        if not post:
            raise HTTPException(status_code=404, detail="Post not Found")
        if post.user_id != user.id:
            raise HTTPException(status_code=403, detail="You don't have permission to delete this Post.")

        await session.delete(post)
        await session.commit()

        return {
            "success": True,
            "message": "Post deleted Successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
