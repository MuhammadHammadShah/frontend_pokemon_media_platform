from pydantic import BaseModel, Field
from fastapi_users import schemas
import uuid
from datetime import datetime
from typing import Optional, Dict, List


# -------------------------------------------------------------
# User Schemas
# -------------------------------------------------------------

class UserRead(schemas.BaseUser[uuid.UUID]):
    pass


class UserCreate(schemas.BaseUserCreate):
    pass


class UserUpdate(schemas.BaseUserUpdate):
    pass


# -------------------------------------------------------------
# Trainer Profile Schemas
# -------------------------------------------------------------

class TrainerProfileBase(BaseModel):
    trainer_name: Optional[str] = None
    starter_pokemon: Optional[str] = "Pikachu"
    favorite_pokemon: Optional[str] = "Pikachu"
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class TrainerProfileUpdate(TrainerProfileBase):
    pass


class TrainerProfileRead(TrainerProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------------------------------------------
# Reaction Schemas
# -------------------------------------------------------------

class ReactionCreate(BaseModel):
    reaction_type: str = Field(default="pokeball", description="pokeball, greatball, ultraball, masterball, fire, water, electric, grass")


class ReactionRead(BaseModel):
    id: uuid.UUID
    post_id: uuid.UUID
    user_id: uuid.UUID
    reaction_type: str
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------------------------------------------
# Comment Schemas
# -------------------------------------------------------------

class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


class CommentRead(BaseModel):
    id: str
    post_id: str
    user_id: str
    user_email: str
    trainer_name: Optional[str] = None
    content: str
    created_at: str


# -------------------------------------------------------------
# Post Schemas
# -------------------------------------------------------------

class PostCreate(BaseModel):
    caption: Optional[str] = ""
    pokemon_name: Optional[str] = None
    pokemon_dex_id: Optional[int] = None
    pokemon_type1: Optional[str] = None
    pokemon_type2: Optional[str] = None
    category: Optional[str] = "General"
    rarity: Optional[str] = None


class PostResponse(BaseModel):
    id: str
    user_id: str
    email: str
    trainer_name: Optional[str] = None
    starter_pokemon: Optional[str] = "Pikachu"
    caption: str
    url: str
    file_type: str
    file_name: str
    created_at: str
    is_owner: bool = False
    
    # Pokemon details
    pokemon_name: Optional[str] = None
    pokemon_dex_id: Optional[int] = None
    pokemon_type1: Optional[str] = None
    pokemon_type2: Optional[str] = None
    category: str = "General"
    rarity: Optional[str] = None

    # Social metrics
    reactions: Dict[str, int] = {}  # e.g. {"pokeball": 3, "fire": 1}
    user_reaction: Optional[str] = None  # Reaction of the current user, if any
    total_reactions: int = 0
    comments_count: int = 0
    recent_comments: List[CommentRead] = []
