from dotenv import load_dotenv
from imagekitio import ImageKit
import os
import shutil

load_dotenv()

IMAGEKIT_PRIVATE_KEY = os.getenv("IMAGEKIT_PRIVATE_KEY")
IMAGEKIT_PUBLIC_KEY = os.getenv("IMAGEKIT_PUBLIC_KEY")
IMAGEKIT_URL = os.getenv("IMAGEKIT_URL")

# Initialize ImageKit client if keys are present
imagekit = None
if IMAGEKIT_PRIVATE_KEY and IMAGEKIT_PUBLIC_KEY and IMAGEKIT_URL:
    try:
        imagekit = ImageKit(
            private_key=IMAGEKIT_PRIVATE_KEY,
            public_key=IMAGEKIT_PUBLIC_KEY,
            url_endpoint=IMAGEKIT_URL
        )
    except Exception as e:
        print(f"Warning: ImageKit initialization failed: {e}")
        imagekit = None
else:
    print("Notice: ImageKit environment variables not fully set. Local fallback enabled.")


def upload_media_file(file_obj, filename: str, content_type: str) -> dict:
    """
    Uploads a file to ImageKit or stores it in local uploads directory as fallback.
    Returns a dict with 'url' and 'name'.
    """
    if imagekit:
        upload_result = imagekit.files.upload(
            file=file_obj,
            file_name=filename,
            use_unique_file_name=True,
            tags=["pokemon-media-platform"]
        )
        return {
            "url": upload_result.url,
            "name": upload_result.name
        }
    else:
        # Local storage fallback
        os.makedirs("uploads", exist_ok=True)
        local_path = os.path.join("uploads", filename)
        with open(local_path, "wb") as f:
            shutil.copyfileobj(file_obj, f)
        
        # Return a relative URL that can be served via FastAPI StaticFiles
        return {
            "url": f"/uploads/{filename}",
            "name": filename
        }
