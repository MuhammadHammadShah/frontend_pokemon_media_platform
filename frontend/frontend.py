import os
import base64
import urllib.parse
from typing import Optional, Dict, List, Any
import requests
import streamlit as st

# ============================================================
# Configuration & API Setup
# ============================================================

try:
    API_URL = st.secrets["API_URL"]
except (KeyError, FileNotFoundError):
    API_URL = os.getenv("API_URL", "http://localhost:8000")

API_URL = API_URL.rstrip("/")

st.set_page_config(
    page_title="PokéSocial — Pokémon Media Platform",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================================
# Session State Initialization
# ============================================================

if "token" not in st.session_state:
    st.session_state.token = None

if "user" not in st.session_state:
    st.session_state.user = None

if "active_comment_post_id" not in st.session_state:
    st.session_state.active_comment_post_id = None

# ============================================================
# Custom Pokémon Theme Styling (CSS)
# ============================================================

POKEMON_TYPE_COLORS = {
    "Normal": "#A8A878",
    "Fire": "#F08030",
    "Water": "#6890F0",
    "Grass": "#78C850",
    "Electric": "#F8D030",
    "Ice": "#98D8D8",
    "Fighting": "#C03028",
    "Poison": "#A040A0",
    "Ground": "#E0C068",
    "Flying": "#A890F0",
    "Psychic": "#F85888",
    "Bug": "#A8B820",
    "Rock": "#B8A038",
    "Ghost": "#705898",
    "Dragon": "#7038F8",
    "Dark": "#705848",
    "Steel": "#B8B8D0",
    "Fairy": "#EE99AC"
}

CUSTOM_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Press+Start+2P&display=swap');

/* Main font */
html, body, [class*="css"] {
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* PokeBadge Styling */
.poke-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.78rem;
    font-weight: 700;
    color: white !important;
    text-shadow: 0 1px 2px rgba(0,0,0,0.6);
    margin-right: 4px;
    margin-bottom: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Trainer Card */
.trainer-card {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 2px solid #e2e8f030;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    backdrop-filter: blur(8px);
    color: #f8fafc;
}

/* Post Container */
.poke-post-card {
    background: #1e232d;
    border-radius: 14px;
    border: 1px solid #334155;
    padding: 18px;
    margin-bottom: 24px;
    transition: transform 0.2s ease, border-color 0.2s ease;
}
.poke-post-card:hover {
    border-color: #f59e0b;
}

/* Holographic Shimmer for TCG cards */
.holo-card {
    border: 2px solid #ec4899;
    box-shadow: 0 0 15px rgba(236, 72, 153, 0.4), inset 0 0 15px rgba(59, 130, 246, 0.3);
    background: linear-gradient(135deg, #1e1e2f 0%, #2b1f3d 100%);
}

/* Reaction Pill */
.reaction-pill {
    background: #0f172a;
    border: 1px solid #3b82f640;
    border-radius: 20px;
    padding: 4px 10px;
    font-size: 0.85rem;
    margin-right: 6px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

/* Badge Shelf */
.badge-shelf {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 0;
}
.badge-item {
    background: #0f172a;
    border: 1px solid #fbbf24;
    border-radius: 10px;
    padding: 8px 12px;
    text-align: center;
    min-width: 100px;
}
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


# ============================================================
# PokéAPI Helpers (Free & Cached)
# ============================================================

@st.cache_data(ttl=86400)
def get_all_pokemon_names() -> List[str]:
    """Fetches full list of Pokémon names from PokéAPI (cached for 24h)."""
    try:
        res = requests.get("https://pokeapi.co/api/v2/pokemon?limit=1025", timeout=10)
        if res.status_code == 200:
            data = res.json()
            return [p["name"].capitalize() for p in data.get("results", [])]
    except Exception:
        pass
    # Fallback popular starters
    return ["Pikachu", "Charizard", "Bulbasaur", "Squirtle", "Gengar", "Lucario", "Mewtwo", "Eevee", "Snorlax", "Rayquaza"]


@st.cache_data(ttl=86400)
def get_pokemon_details(name_or_id: str) -> Optional[Dict[str, Any]]:
    """Fetches details (sprites, official art, types, cry sound) for a Pokémon."""
    if not name_or_id:
        return None
    try:
        clean_name = str(name_or_id).lower().strip()
        res = requests.get(f"https://pokeapi.co/api/v2/pokemon/{clean_name}", timeout=8)
        if res.status_code == 200:
            data = res.json()
            types = [t["type"]["name"].capitalize() for t in data.get("types", [])]
            sprites = data.get("sprites", {})
            official_art = (
                sprites.get("other", {})
                .get("official-artwork", {})
                .get("front_default")
            )
            animated_sprite = (
                sprites.get("other", {})
                .get("showdown", {})
                .get("front_default")
                or sprites.get("front_default")
            )
            cry_audio = data.get("cries", {}).get("latest")

            return {
                "id": data.get("id"),
                "name": data.get("name").capitalize(),
                "height": data.get("height", 0) / 10.0,  # in meters
                "weight": data.get("weight", 0) / 10.0,  # in kg
                "types": types,
                "type1": types[0] if len(types) > 0 else "Normal",
                "type2": types[1] if len(types) > 1 else None,
                "official_art": official_art,
                "animated_sprite": animated_sprite,
                "cry_audio": cry_audio
            }
    except Exception:
        pass
    return None


def render_type_badge(type_name: str) -> str:
    """Generates colored HTML badge for a Pokémon type."""
    color = POKEMON_TYPE_COLORS.get(type_name, "#64748b")
    return f'<span class="poke-badge" style="background-color: {color};">{type_name.upper()}</span>'


# ============================================================
# API Helpers
# ============================================================

def get_headers() -> dict[str, str]:
    if st.session_state.token:
        return {"Authorization": f"Bearer {st.session_state.token}"}
    return {}


def api_url(path: str) -> str:
    return f"{API_URL}/{path.lstrip('/')}"


def encode_text_for_overlay(text: str) -> str:
    if not text:
        return ""
    base64_text = base64.b64encode(text.encode("utf-8")).decode("utf-8")
    return urllib.parse.quote(base64_text)


def create_transformed_url(original_url: str, transformation_params: str, caption: str | None = None) -> str:
    if not original_url.startswith("http"):
        # Local backend static URL
        return api_url(original_url)

    if caption:
        encoded_caption = encode_text_for_overlay(caption[:80])  # limit overlay length
        transformation_params = (
            f"l-text,ie-{encoded_caption},ly-N20,lx-20,fs-60,co-white,bg-000000A0,l-end"
        )

    if not transformation_params:
        return original_url

    parts = original_url.split("/")
    if len(parts) < 5 or "imagekit.io" not in original_url:
        return original_url

    file_path = "/".join(parts[4:])
    base_url = "/".join(parts[:4])
    return f"{base_url}/tr:{transformation_params}/{file_path}"


# ============================================================
# Authentication Pages (Login & Register)
# ============================================================

def login_page() -> None:
    st.markdown("<div align='center'>", unsafe_allow_html=True)
    st.title("⚡ PokéSocial")
    st.caption("The Next-Gen Pokémon Media & Social Community")
    st.markdown("</div>", unsafe_allow_html=True)

    col1, col2, col3 = st.columns([1, 2, 1])

    with col2:
        auth_mode = st.radio("Choose Mode", ["🔑 Login", "✨ Sign Up as Trainer"], horizontal=True, label_visibility="collapsed")
        
        email = st.text_input("Trainer Email", placeholder="ash.ketchum@pallettown.com")
        password = st.text_input("Password", type="password", placeholder="••••••••")

        if auth_mode == "🔑 Login":
            if st.button("🚀 Enter PokéSocial", type="primary", use_container_width=True):
                if not email or not password:
                    st.warning("Please enter your email and password.")
                    return
                try:
                    response = requests.post(
                        api_url("/auth/jwt/login"),
                        data={"username": email, "password": password},
                        timeout=30
                    )
                    if response.status_code == 200:
                        token_data = response.json()
                        st.session_state.token = token_data["access_token"]

                        user_response = requests.get(
                            api_url("/users/me"),
                            headers=get_headers(),
                            timeout=30
                        )
                        if user_response.status_code == 200:
                            st.session_state.user = user_response.json()
                            st.rerun()
                        else:
                            st.error("Failed to retrieve trainer account details.")
                    else:
                        st.error("Invalid Trainer credentials. Please check your email or password.")
                except Exception as exc:
                    st.error(f"Could not connect to backend server at {API_URL}: {exc}")

        else:  # Sign Up
            if st.button("🎯 Create Trainer Account", type="primary", use_container_width=True):
                if not email or not password:
                    st.warning("Please provide email and password.")
                    return
                try:
                    response = requests.post(
                        api_url("/auth/register"),
                        json={"email": email, "password": password},
                        timeout=30
                    )
                    if response.status_code == 201:
                        st.success("🎉 Account created! Logging you in...")
                        # Auto-login after registration
                        login_res = requests.post(
                            api_url("/auth/jwt/login"),
                            data={"username": email, "password": password},
                            timeout=30
                        )
                        if login_res.status_code == 200:
                            st.session_state.token = login_res.json()["access_token"]
                            user_res = requests.get(api_url("/users/me"), headers=get_headers())
                            st.session_state.user = user_res.json()
                            st.rerun()
                    else:
                        detail = response.json().get("detail", "Registration failed.")
                        st.error(detail)
                except Exception as exc:
                    st.error(f"Could not connect to backend server: {exc}")


# ============================================================
# Page 1: PokéFeed (Social Feed with Reactions & Comments)
# ============================================================

def feed_page() -> None:
    st.markdown("### 🏠 Trainer Feed")

    # Search & Filter Controls
    col_search, col_cat, col_type = st.columns([2, 1, 1])
    with col_search:
        search_query = st.text_input("🔍 Search PokéPosts or Pokémon", placeholder="e.g. Charizard, shiny, Holo, tournament...", label_visibility="collapsed")
    with col_cat:
        category_filter = st.selectbox("Category", ["All", "TCG Card", "Fan Art", "Battle Clip", "General"], label_visibility="collapsed")
    with col_type:
        type_options = ["All"] + list(POKEMON_TYPE_COLORS.keys())
        type_filter = st.selectbox("Type", type_options, label_visibility="collapsed")

    # Fetch Posts from Backend
    params = {}
    if search_query:
        params["search"] = search_query
    if category_filter and category_filter != "All":
        params["category"] = category_filter
    if type_filter and type_filter != "All":
        params["pokemon_type"] = type_filter

    try:
        response = requests.get(api_url("/feed"), headers=get_headers(), params=params, timeout=30)
        if response.status_code != 200:
            st.error("Failed to load feed from server.")
            return

        posts = response.json().get("posts", [])
        if not posts:
            st.info("⚡ No PokéPosts found matching your filters. Be the first to share something!")
            return

        for post in posts:
            post_id = post["id"]
            is_tcg = post.get("category") == "TCG Card"
            card_class = "poke-post-card holo-card" if is_tcg else "poke-post-card"

            # Post Card Wrapper
            st.markdown(f'<div class="{card_class}">', unsafe_allow_html=True)

            # Header: Trainer info + Date
            c_header, c_del = st.columns([4, 1])
            with c_header:
                starter_sprite = ""
                poke_info = get_pokemon_details(post.get("pokemon_name") or post.get("starter_pokemon") or "Pikachu")
                if poke_info and poke_info.get("animated_sprite"):
                    starter_sprite = f'<img src="{poke_info["animated_sprite"]}" width="32" style="vertical-align: middle; margin-right: 6px;">'
                
                type_badges_html = ""
                if post.get("pokemon_type1"):
                    type_badges_html += render_type_badge(post["pokemon_type1"])
                if post.get("pokemon_type2"):
                    type_badges_html += render_type_badge(post["pokemon_type2"])

                category_badge = f'<span class="poke-badge" style="background-color: #6366f1;">🏷️ {post.get("category", "General")}</span>'
                rarity_badge = f'<span class="poke-badge" style="background-color: #ec4899;">✨ {post.get("rarity")}</span>' if post.get("rarity") else ""

                st.markdown(
                    f"""
                    <div>
                        {starter_sprite} <strong>{post.get('trainer_name', post['email'])}</strong> 
                        <span style="color: #94a3b8; font-size: 0.85rem;">• {post['created_at'][:10]}</span>
                        <div style="margin-top: 4px;">
                            {type_badges_html} {category_badge} {rarity_badge}
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True
                )

            with c_del:
                if post.get("is_owner", False):
                    if st.button("🗑️", key=f"del_{post_id}", help="Release this post"):
                        del_res = requests.delete(api_url(f"/posts/{post_id}"), headers=get_headers(), timeout=30)
                        if del_res.status_code == 200:
                            st.success("Post released!")
                            st.rerun()

            # Media Rendering
            media_url = post["url"]
            if post["file_type"] == "image":
                rendered_url = create_transformed_url(media_url, "")
                st.image(rendered_url, use_container_width=True)
            else:
                rendered_url = create_transformed_url(media_url, "w-600,h-340,cm-pad_resize,bg-blurred")
                st.video(rendered_url)

            # Caption
            if post.get("caption"):
                st.markdown(f"<p style='font-size: 1.05rem; margin-top: 10px;'>{post['caption']}</p>", unsafe_allow_html=True)

            # ------------------------------------------------
            # Pokéball Reactions Bar
            # ------------------------------------------------
            st.markdown("<hr style='margin: 8px 0; border-color: #334155;'>", unsafe_allow_html=True)
            
            reactions_dict = post.get("reactions", {})
            user_reaction = post.get("user_reaction")
            
            r_col1, r_col2, r_col3, r_col4, r_col5, r_col6 = st.columns([1, 1, 1, 1, 1, 3])
            
            with r_col1:
                p_cnt = reactions_dict.get("pokeball", 0)
                p_btn_label = f"🔴 {p_cnt}" if p_cnt > 0 else "🔴 Catch"
                if st.button(p_btn_label, key=f"react_pb_{post_id}", help="Pokéball Like"):
                    requests.post(api_url(f"/posts/{post_id}/react"), json={"reaction_type": "pokeball"}, headers=get_headers())
                    st.rerun()

            with r_col2:
                g_cnt = reactions_dict.get("greatball", 0)
                g_btn_label = f"🔵 {g_cnt}" if g_cnt > 0 else "🔵 Great"
                if st.button(g_btn_label, key=f"react_gb_{post_id}", help="Great Ball"):
                    requests.post(api_url(f"/posts/{post_id}/react"), json={"reaction_type": "greatball"}, headers=get_headers())
                    st.rerun()

            with r_col3:
                u_cnt = reactions_dict.get("ultraball", 0)
                u_btn_label = f"🟡 {u_cnt}" if u_cnt > 0 else "🟡 Ultra"
                if st.button(u_btn_label, key=f"react_ub_{post_id}", help="Ultra Ball"):
                    requests.post(api_url(f"/posts/{post_id}/react"), json={"reaction_type": "ultraball"}, headers=get_headers())
                    st.rerun()

            with r_col4:
                m_cnt = reactions_dict.get("masterball", 0)
                m_btn_label = f"🟣 {m_cnt}" if m_cnt > 0 else "🟣 Master"
                if st.button(m_btn_label, key=f"react_mb_{post_id}", help="Master Ball"):
                    requests.post(api_url(f"/posts/{post_id}/react"), json={"reaction_type": "masterball"}, headers=get_headers())
                    st.rerun()

            with r_col5:
                f_cnt = reactions_dict.get("fire", 0)
                f_btn_label = f"🔥 {f_cnt}" if f_cnt > 0 else "🔥 Fire"
                if st.button(f_btn_label, key=f"react_fr_{post_id}", help="Fire Reaction"):
                    requests.post(api_url(f"/posts/{post_id}/react"), json={"reaction_type": "fire"}, headers=get_headers())
                    st.rerun()

            with r_col6:
                tot = post.get("total_reactions", 0)
                comments_count = post.get("comments_count", 0)
                st.markdown(
                    f"<div style='text-align: right; color: #94a3b8; padding-top: 8px; font-size: 0.9rem;'>"
                    f"⭐ <strong>{tot}</strong> Reactions &nbsp;|&nbsp; 💬 <strong>{comments_count}</strong> Comments"
                    f"</div>",
                    unsafe_allow_html=True
                )

            # ------------------------------------------------
            # Comments Section
            # ------------------------------------------------
            with st.expander(f"💬 Comments ({post.get('comments_count', 0)})", expanded=(st.session_state.active_comment_post_id == post_id)):
                recent_comments = post.get("recent_comments", [])
                if recent_comments:
                    for c in recent_comments:
                        st.markdown(
                            f"<div style='background: #0f172a; padding: 8px 12px; border-radius: 8px; margin-bottom: 6px; font-size: 0.9rem;'>"
                            f"<strong>{c.get('trainer_name', c['user_email'])}</strong>: {c['content']} "
                            f"<span style='color: #64748b; font-size: 0.75rem;'>({c['created_at'][:10]})</span>"
                            f"</div>",
                            unsafe_allow_html=True
                        )
                else:
                    st.caption("No comments yet. Start the conversation!")

                # Add Comment Box
                with st.form(key=f"comment_form_{post_id}", clear_on_submit=True):
                    c_text = st.text_input("Write a comment...", placeholder="Say something about this Pokémon capture...", label_visibility="collapsed")
                    if st.form_submit_button("💬 Post Comment"):
                        if c_text.strip():
                            requests.post(
                                api_url(f"/posts/{post_id}/comments"),
                                json={"content": c_text.strip()},
                                headers=get_headers(),
                                timeout=30
                            )
                            st.session_state.active_comment_post_id = post_id
                            st.rerun()

            st.markdown("</div>", unsafe_allow_html=True)

    except Exception as exc:
        st.error(f"Error fetching PokéFeed: {exc}")


# ============================================================
# Page 2: Upload PokéPost
# ============================================================

def upload_page() -> None:
    st.markdown("### 📸 Share a Pokémon Capture")

    col_form, col_preview = st.columns([3, 2])

    with col_form:
        uploaded_file = st.file_uploader(
            "Select Media File",
            type=["png", "jpg", "jpeg", "mp4", "avi", "mov", "webm"],
            help="Upload images or battle clip videos"
        )

        all_pokemon = get_all_pokemon_names()
        selected_pokemon = st.selectbox(
            "Featured Pokémon (PokéAPI Autocomplete)",
            options=["None"] + all_pokemon,
            index=0,
            help="Select the Pokémon featured in this media"
        )

        category = st.selectbox(
            "Category",
            ["General", "TCG Card", "Fan Art", "Battle Clip", "Meme"],
            help="Tag the category of this capture"
        )

        rarity = None
        if category == "TCG Card":
            rarity = st.selectbox(
                "Card Rarity",
                ["Common", "Uncommon", "Rare Holo", "Ultra Rare", "Secret Rare", "PSA 10 Gem Mint", "Illustration Rare"]
            )

        caption = st.text_area("Caption", placeholder="Tell other trainers about this pull, battle strategy, or artwork...")

        if uploaded_file and st.button("🚀 Publish PokéPost", type="primary", use_container_width=True):
            with st.spinner("Uploading and registering with Pokédex..."):
                try:
                    poke_data = get_pokemon_details(selected_pokemon) if selected_pokemon != "None" else None

                    files = {
                        "file": (
                            uploaded_file.name,
                            uploaded_file.getvalue(),
                            uploaded_file.type
                        )
                    }

                    data = {
                        "caption": caption,
                        "category": category,
                        "pokemon_name": selected_pokemon if selected_pokemon != "None" else "",
                        "pokemon_dex_id": str(poke_data["id"]) if poke_data else "",
                        "pokemon_type1": poke_data["type1"] if poke_data else "",
                        "pokemon_type2": poke_data["type2"] or "" if poke_data else "",
                        "rarity": rarity or ""
                    }

                    res = requests.post(
                        api_url("/upload"),
                        files=files,
                        data=data,
                        headers=get_headers(),
                        timeout=120
                    )

                    if res.status_code == 200:
                        st.success("🎉 PokéPost Published Successfully!")
                        st.rerun()
                    else:
                        st.error(res.json().get("detail", "Upload failed."))
                except Exception as exc:
                    st.error(f"Upload failed: {exc}")

    with col_preview:
        st.markdown("#### ⚡ Live Pokédex Preview")
        if selected_pokemon and selected_pokemon != "None":
            poke_details = get_pokemon_details(selected_pokemon)
            if poke_details:
                st.markdown(
                    f"""
                    <div class="trainer-card" style="text-align: center;">
                        <h3 style="color: #fbbf24; margin-bottom: 2px;">#{poke_details['id']:03d} {poke_details['name']}</h3>
                        <div style="margin-bottom: 12px;">
                            {render_type_badge(poke_details['type1'])}
                            {render_type_badge(poke_details['type2']) if poke_details['type2'] else ''}
                        </div>
                        <img src="{poke_details['official_art'] or poke_details['animated_sprite']}" width="180" style="filter: drop-shadow(0 0 12px rgba(251,191,36,0.3));">
                        <p style="margin-top: 10px; color: #94a3b8; font-size: 0.9rem;">
                            📏 <strong>Height:</strong> {poke_details['height']}m &nbsp;|&nbsp; ⚖️ <strong>Weight:</strong> {poke_details['weight']}kg
                        </p>
                    </div>
                    """,
                    unsafe_allow_html=True
                )
                if poke_details.get("cry_audio"):
                    st.audio(poke_details["cry_audio"])
        else:
            st.info("Select a Pokémon above to preview its live Pokédex card and stats!")


# ============================================================
# Page 3: Trainer Passport (Profile & Badges)
# ============================================================

def profile_page() -> None:
    st.markdown("### 🎖️ Trainer Passport")

    try:
        res = requests.get(api_url(f"/trainers/{st.session_state.user['id']}"), headers=get_headers(), timeout=30)
        if res.status_code == 200:
            trainer = res.json()
        else:
            trainer = {
                "trainer_name": st.session_state.user['email'].split("@")[0],
                "starter_pokemon": "Pikachu",
                "favorite_pokemon": "Pikachu",
                "bio": "Pokémon Trainer",
                "level": 1,
                "badges": [],
                "total_posts": 0
            }
    except Exception:
        trainer = {"trainer_name": "Trainer", "level": 1, "badges": [], "total_posts": 0, "starter_pokemon": "Pikachu"}

    poke_info = get_pokemon_details(trainer.get("starter_pokemon", "Pikachu"))
    art_url = poke_info["official_art"] if poke_info else ""

    col_card, col_edit = st.columns([3, 2])

    with col_card:
        badges_html = ""
        for b in trainer.get("badges", []):
            badges_html += f'<div class="badge-item"><div style="font-size: 1.8rem;">{b["icon"]}</div><strong style="font-size: 0.8rem;">{b["name"]}</strong><br><span style="font-size: 0.7rem; color: #94a3b8;">{b["desc"]}</span></div>'

        if not badges_html:
            badges_html = "<span style='color: #64748b; font-size: 0.9rem;'>No badges earned yet. Post Pokémon media to unlock your first Gym Badge!</span>"

        st.markdown(
            f"""
            <div class="trainer-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="background: #e11d48; color: white; padding: 2px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 700;">TRAINER ID: {st.session_state.user['id'][:8]}</span>
                        <h2 style="margin: 8px 0 2px 0; color: #f8fafc;">{trainer['trainer_name']}</h2>
                        <span style="color: #38bdf8; font-weight: 600;">⭐ Trainer Level: {trainer.get('level', 1)}</span>
                    </div>
                    <div>
                        <img src="{art_url}" width="90" style="filter: drop-shadow(0 0 10px rgba(56,189,248,0.4));">
                    </div>
                </div>
                <p style="margin-top: 12px; color: #cbd5e1; font-style: italic;">"{trainer.get('bio', 'Ready for adventure!')}"</p>
                <div style="margin-top: 16px;">
                    <h5 style="color: #fbbf24; margin-bottom: 8px;">🏆 Kanto Gym Badges ({len(trainer.get('badges', []))}/6)</h5>
                    <div class="badge-shelf">
                        {badges_html}
                    </div>
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with col_edit:
        st.markdown("#### ⚙️ Edit Trainer Settings")
        with st.form("trainer_update_form"):
            t_name = st.text_input("Trainer Name", value=trainer.get("trainer_name", ""))
            all_poke = get_all_pokemon_names()
            curr_starter = trainer.get("starter_pokemon", "Pikachu")
            starter_idx = all_poke.index(curr_starter) if curr_starter in all_poke else 0
            t_starter = st.selectbox("Partner / Starter Pokémon", all_poke, index=starter_idx)
            t_bio = st.text_area("Trainer Bio", value=trainer.get("bio", ""))

            if st.form_submit_button("💾 Save Profile Changes"):
                patch_res = requests.patch(
                    api_url("/trainers/me"),
                    json={"trainer_name": t_name, "starter_pokemon": t_starter, "bio": t_bio},
                    headers=get_headers(),
                    timeout=30
                )
                if patch_res.status_code == 200:
                    st.success("Trainer profile updated!")
                    st.rerun()
                else:
                    st.error("Failed to update profile.")


# ============================================================
# Main Navigation Controller
# ============================================================

if st.session_state.user is None:
    login_page()
else:
    # Sidebar
    st.sidebar.markdown(f"<h3 style='color: #fbbf24;'>⚡ PokéSocial</h3>", unsafe_allow_html=True)
    st.sidebar.caption(f"Trainer: **{st.session_state.user['email']}**")

    if st.sidebar.button("🚪 Logout", use_container_width=True):
        st.session_state.user = None
        st.session_state.token = None
        st.rerun()

    st.sidebar.markdown("---")

    nav_choice = st.sidebar.radio(
        "Navigation",
        ["🏠 PokéFeed", "📸 Share Capture", "🎖️ Trainer Passport"],
        label_visibility="collapsed"
    )

    st.sidebar.markdown("---")
    st.sidebar.markdown(
        """
        <div style='background: #0f172a; padding: 12px; border-radius: 8px; font-size: 0.8rem; color: #94a3b8;'>
            <strong style='color: #f8fafc;'>⚡ PokéSocial Features:</strong><br>
            • Live PokéAPI Integration<br>
            • Pokéball Reactions<br>
            • Kanto Gym Badges<br>
            • TCG Holographic Cards<br>
            • Interactive Comments
        </div>
        """,
        unsafe_allow_html=True
    )

    if nav_choice == "🏠 PokéFeed":
        feed_page()
    elif nav_choice == "📸 Share Capture":
        upload_page()
    else:
        profile_page()
