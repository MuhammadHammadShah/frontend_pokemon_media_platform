import os
import base64
import urllib.parse

import requests
import streamlit as st


# ============================================================
# Configuration
# ============================================================

# Production:
# Streamlit Cloud -> Settings -> Secrets
#
# Add:
# API_URL = "https://backend-pokemon-social-media-platform.fastapicloud.dev"
#
# Local development:
# If API_URL is not present in Streamlit secrets or environment
# variables, fall back to localhost.

try:
    API_URL = st.secrets["API_URL"]
except (KeyError, FileNotFoundError):
    API_URL = os.getenv(
        "API_URL",
        "http://localhost:8000",
    )

API_URL = API_URL.rstrip("/")


# ============================================================
# Streamlit Configuration
# ============================================================

st.set_page_config(
    page_title="Simple Social",
    page_icon="🚀",
    layout="wide",
)


# ============================================================
# Session State
# ============================================================

if "token" not in st.session_state:
    st.session_state.token = None

if "user" not in st.session_state:
    st.session_state.user = None


# ============================================================
# API Helpers
# ============================================================

def get_headers() -> dict[str, str]:
    """Return authorization headers for authenticated requests."""

    if st.session_state.token:
        return {
            "Authorization": f"Bearer {st.session_state.token}"
        }

    return {}


def api_url(path: str) -> str:
    """Build a URL for the backend API."""

    return f"{API_URL}/{path.lstrip('/')}"


# ============================================================
# Authentication
# ============================================================

def login_page() -> None:

    st.title("🚀 Welcome to Simple Social")

    email = st.text_input(
        "Email",
        placeholder="Enter your email",
    )

    password = st.text_input(
        "Password",
        type="password",
        placeholder="Enter your password",
    )

    if email and password:

        col1, col2 = st.columns(2)

        # ----------------------------------------------------
        # Login
        # ----------------------------------------------------

        with col1:

            if st.button(
                "Login",
                type="primary",
                use_container_width=True,
            ):

                try:

                    response = requests.post(
                        api_url("/auth/jwt/login"),
                        data={
                            "username": email,
                            "password": password,
                        },
                        timeout=30,
                    )

                    if response.status_code == 200:

                        token_data = response.json()

                        st.session_state.token = (
                            token_data["access_token"]
                        )

                        # Get current user
                        user_response = requests.get(
                            api_url("/users/me"),
                            headers=get_headers(),
                            timeout=30,
                        )

                        if user_response.status_code == 200:

                            st.session_state.user = (
                                user_response.json()
                            )

                            st.rerun()

                        else:

                            st.error(
                                "Login succeeded, but "
                                "failed to retrieve user information."
                            )

                    else:

                        try:
                            error_detail = (
                                response.json()
                                .get(
                                    "detail",
                                    "Invalid email or password.",
                                )
                            )

                        except ValueError:

                            error_detail = (
                                "Invalid email or password."
                            )

                        st.error(error_detail)

                except requests.RequestException as exc:

                    st.error(
                        f"Could not connect to backend:\n\n{exc}"
                    )

        # ----------------------------------------------------
        # Signup
        # ----------------------------------------------------

        with col2:

            if st.button(
                "Sign Up",
                type="secondary",
                use_container_width=True,
            ):

                try:

                    response = requests.post(
                        api_url("/auth/register"),
                        json={
                            "email": email,
                            "password": password,
                        },
                        timeout=30,
                    )

                    if response.status_code == 201:

                        st.success(
                            "Account created! "
                            "You can now log in."
                        )

                    else:

                        try:
                            error_detail = (
                                response.json()
                                .get(
                                    "detail",
                                    "Registration failed.",
                                )
                            )

                        except ValueError:

                            error_detail = (
                                "Registration failed."
                            )

                        st.error(error_detail)

                except requests.RequestException as exc:

                    st.error(
                        f"Could not connect to backend:\n\n{exc}"
                    )

    else:

        st.info(
            "Enter your email and password above."
        )


# ============================================================
# Upload
# ============================================================

def upload_page() -> None:

    st.title("📸 Share Something")

    uploaded_file = st.file_uploader(
        "Choose media",
        type=[
            "png",
            "jpg",
            "jpeg",
            "mp4",
            "avi",
            "mov",
            "mkv",
            "webm",
        ],
    )

    caption = st.text_area(
        "Caption",
        placeholder="What's on your mind?",
    )

    if uploaded_file and st.button(
        "Share",
        type="primary",
    ):

        with st.spinner("Uploading..."):

            try:

                files = {
                    "file": (
                        uploaded_file.name,
                        uploaded_file.getvalue(),
                        uploaded_file.type,
                    )
                }

                data = {
                    "caption": caption,
                }

                response = requests.post(
                    api_url("/upload"),
                    files=files,
                    data=data,
                    headers=get_headers(),
                    timeout=120,
                )

                if response.status_code == 200:

                    st.success("Posted!")

                    st.rerun()

                else:

                    try:
                        error_detail = response.json().get(
                            "detail",
                            "Upload failed.",
                        )

                    except ValueError:

                        error_detail = "Upload failed."

                    st.error(error_detail)

            except requests.RequestException as exc:

                st.error(
                    f"Could not connect to backend:\n\n{exc}"
                )


# ============================================================
# ImageKit Helpers
# ============================================================

def encode_text_for_overlay(text: str) -> str:

    if not text:
        return ""

    base64_text = base64.b64encode(
        text.encode("utf-8")
    ).decode("utf-8")

    return urllib.parse.quote(base64_text)


def create_transformed_url(
    original_url: str,
    transformation_params: str,
    caption: str | None = None,
) -> str:

    if caption:

        encoded_caption = (
            encode_text_for_overlay(caption)
        )

        transformation_params = (
            f"l-text,ie-{encoded_caption},"
            f"ly-N20,lx-20,fs-100,"
            f"co-white,bg-000000A0,l-end"
        )

    if not transformation_params:
        return original_url

    parts = original_url.split("/")

    if len(parts) < 5:
        return original_url

    file_path = "/".join(parts[4:])

    base_url = "/".join(parts[:4])

    return (
        f"{base_url}/tr:{transformation_params}"
        f"/{file_path}"
    )


# ============================================================
# Feed
# ============================================================

def feed_page() -> None:

    st.title("🏠 Feed")

    try:

        response = requests.get(
            api_url("/feed"),
            headers=get_headers(),
            timeout=30,
        )

        if response.status_code != 200:

            try:
                error_detail = response.json().get(
                    "detail",
                    "Failed to load feed.",
                )

            except ValueError:

                error_detail = "Failed to load feed."

            st.error(error_detail)

            return

        posts = response.json().get(
            "posts",
            [],
        )

        if not posts:

            st.info(
                "No posts yet! "
                "Be the first to share something."
            )

            return

        for post in posts:

            st.markdown("---")

            # ------------------------------------------------
            # Post Header
            # ------------------------------------------------

            col1, col2 = st.columns([4, 1])

            with col1:

                st.markdown(
                    f"**{post['email']}** "
                    f"• {post['created_at'][:10]}"
                )

            # ------------------------------------------------
            # Delete
            # ------------------------------------------------

            with col2:

                if post.get("is_owner", False):

                    if st.button(
                        "🗑️",
                        key=f"delete_{post['id']}",
                        help="Delete post",
                    ):

                        try:

                            delete_response = (
                                requests.delete(
                                    api_url(
                                        f"/posts/{post['id']}"
                                    ),
                                    headers=get_headers(),
                                    timeout=30,
                                )
                            )

                            if (
                                delete_response.status_code
                                == 200
                            ):

                                st.success(
                                    "Post deleted!"
                                )

                                st.rerun()

                            else:

                                try:
                                    error_detail = (
                                        delete_response
                                        .json()
                                        .get(
                                            "detail",
                                            "Failed to delete post.",
                                        )
                                    )

                                except ValueError:

                                    error_detail = (
                                        "Failed to delete post."
                                    )

                                st.error(error_detail)

                        except requests.RequestException as exc:

                            st.error(
                                "Could not connect "
                                f"to backend:\n\n{exc}"
                            )

            # ------------------------------------------------
            # Media
            # ------------------------------------------------

            caption = post.get(
                "caption",
                "",
            )

            if post["file_type"] == "image":

                uniform_url = (
                    create_transformed_url(
                        post["url"],
                        "",
                        caption,
                    )
                )

                st.image(
                    uniform_url,
                    width=300,
                )

            else:

                uniform_video_url = (
                    create_transformed_url(
                        post["url"],
                        "w-400,h-200,"
                        "cm-pad_resize,"
                        "bg-blurred",
                    )
                )

                st.video(
                    uniform_video_url,
                    width=300,
                )

                if caption:
                    st.caption(caption)

    except Exception as e:
        pass

# ============================================================
# Main Application
# ============================================================

if st.session_state.user is None:

    login_page()

else:

    st.sidebar.title(
        f"👋 Hi {st.session_state.user['email']}!"
    )

    if st.sidebar.button("Logout"):

        st.session_state.user = None
        st.session_state.token = None

        st.rerun()

    st.sidebar.markdown("---")

    page = st.sidebar.radio(
        "Navigate:",
        [
            "🏠 Feed",
            "📸 Upload",
        ],
    )

    if page == "🏠 Feed":

        feed_page()

    else:

        upload_page()