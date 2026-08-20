# ⚡ PokéSocial — Pokémon Media & Social Platform (Monorepo)

A dedicated, full-stack Pokémon social media application featuring live **PokéAPI integration**, **Pokéball reactions**, **interactive comments**, **Kanto Gym Badges**, and **TCG holographic cards**.

---

## 📁 Monorepo Structure

```text
pokemon_media_platform/
├── backend/
│   ├── app/
│   │   ├── app.py           # FastAPI application (feed, upload, reactions, comments, profiles)
│   │   ├── db.py            # SQLAlchemy async database models (User, Post, Reaction, Comment, TrainerProfile)
│   │   ├── images.py        # ImageKit upload & local storage fallback
│   │   ├── schemas.py       # Pydantic request & response models
│   │   └── users.py         # fastapi-users JWT authentication
│   ├── main.py              # Uvicorn entry point (:8000)
│   ├── requirements.txt     # Backend dependencies
│   └── .env.example         # Environment template
│
├── frontend/
│   ├── frontend.py          # Streamlit UI with PokéAPI integration & custom CSS theme
│   ├── requirements.txt     # Frontend dependencies
│   └── .env.example         # Frontend environment template
│
└── README.md
```

---

## 🚀 Key Features

* **PokéAPI Integration (100% Free & Live)**:
  * Autocomplete search for 1,000+ Pokémon.
  * Live Pokédex preview with official artwork, animated pixel sprites, height/weight, and retro 8-bit cry audio.
* **Pokéball Reactions Bar**:
  * React with 🔴 Pokéball, 🔵 Great Ball, 🟡 Ultra Ball, 🟣 Master Ball, or 🔥 Fire.
* **Interactive Comments Drawer**:
  * Real-time commenting on posts with trainer names and timestamps.
* **Trainer Passport & Kanto Gym Badges**:
  * Dynamic Trainer Level and unlockable badges (Boulder, Cascade, Thunder, Volcano, Rainbow, Earth).
  * Partner/Starter Pokémon companion selector.
* **Category & Type Filters**:
  * Filter posts by Elemental Type (Fire, Water, Grass, Electric, Psychic, etc.) or Category (TCG Cards, Fan Art, Battle Clips).
* **TCG Holographic Shimmer**:
  * Custom 3D holographic foil styling for Pokémon card posts.

---

## 🛠️ Getting Started

### 1. Start the Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python main.py
```
> The API will be available at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.

### 2. Start the Frontend (Streamlit)

In a separate terminal:
```bash
cd frontend
pip install -r requirements.txt
streamlit run frontend.py
```
> The web application will launch at `http://localhost:8501`.

---

## ⚙️ Environment Variables (Optional)

If you want to enable cloud media storage via **ImageKit.io**, configure `backend/.env`:

```env
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_URL=https://ik.imagekit.io/your_id
```
*(If omitted, media files will be saved locally inside `backend/uploads/` automatically.)*
