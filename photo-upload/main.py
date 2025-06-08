from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from typing import List, Dict
import os
import uuid
from datetime import datetime
from pathlib import Path

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

# Configuration
# UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
# Создаем папку для загрузок, если её нет
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Монтируем статические файлы
# app.mount("/", StaticFiles(directory="."))
app.mount("/assets", StaticFiles(directory="assets/"), name="assets")
app.mount("/images", StaticFiles(directory="assets/images/"), name="images")
# app.mount("/upload", StaticFiles(directory=UPLOAD_DIR), name="upload")


# Create upload directory if it doesn't exist
Path(UPLOAD_DIR).mkdir(exist_ok=True)

# Serve static files
# app.mount("/static", StaticFiles(directory="../../"), name="static")

# Helper functions
def allowed_file(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS

# def analyze_image(image_path: str) -> List[Dict]:
#     """Mock image analysis function"""
#     return [
#         { 
#             "name": "Паста Карбонара", 
#             "url": "/recipe1.html",
#             "ingredients": [
#                 "Спагетти - 400 г",
#                 "Гуанчиале - 150 г",
#                 "Яичные желтки - 4 шт",
#                 "Пармезан - 50 г"
#             ],
#         },
#         { 
#             "name": "Салат Цезарь", 
#             "url": "/recipe2.html",
#             "ingredients": [
#                 "Куриное филе - 300 г",
#                 "Листья салата",
#                 "Пармезан",
#                 "Сухарики"
#             ]
#         },
#         {
#             "name": 'Тирамису', 
#             "url": 'recipe3.html',
#             "ingredients": [
#                 'Печенье Савоярди - 200 г',
#                 'Сыр маскарпоне - 500 г',
#                 'Яйца - 4 шт',
#                 'Сахар - 100 г',
#                 'Кофе эспрессо - 200 мл',
#                 'Какао-порошок',
#                 'Ликер Амаретто'
#             ]
#         }
#     ]

# Routes
@app.get("/", response_class=HTMLResponse)
async def get_root():
    return FileResponse("start_page.html")

@app.get("/start_page.html", response_class=HTMLResponse)
async def get_root():
    return FileResponse("start_page.html")

@app.get("/load_photo_page.html", response_class=HTMLResponse)
async def get_load_photo_page():
    return FileResponse("load_photo_page.html")

@app.get("/ingredients_page.html", response_class=HTMLResponse)
async def get_ingredients_page():
    return FileResponse("ingredients_page.html")

@app.get("/recipe.html", response_class=HTMLResponse)
async def get_recipe_page():
    return FileResponse("recipe.html")

@app.post("/upload")
async def upload_file(image: UploadFile = File(...)):
    try:
        # Validate file
        if not image.filename or not allowed_file(image.filename):
            raise HTTPException(400, detail="Only image files are allowed (JPEG, JPG, PNG, WEBP)")

        # Check file size
        contents = await image.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(400, detail=f"File too large. Max size is {MAX_FILE_SIZE/1024/1024}MB")

        # Generate unique filename
        ext = Path(image.filename).suffix
        filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(contents)

        # Return file path to the client
        return JSONResponse(content={
            "success": True,
            "message": "Photo uploaded successfully!",
            "filePath": f"/uploads/{filename}"
        })
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@app.post("/api/submit")
async def submit_ingredients(request: Request):
    try:
        data = await request.json()
        print("Received data:", data)

        return JSONResponse({
            "success": True,
            "message": "Data received successfully!",
            "data": data
        })
    except Exception as e:
        raise HTTPException(400, detail=str(e))

# Serve uploaded files
@app.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(404, detail="File not found")
    return FileResponse(file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)