from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from typing import List, Dict
import os
import uuid
from datetime import datetime
from pathlib import Path

# Инициализация FastAPI приложения
app = FastAPI()

# Конфигурация CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://localhost:3000"],  # Разрешенные домены
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],  # Разрешенные HTTP методы
    allow_headers=["*"],  # Разрешенные заголовки
)

# Конфигурация приложения
MAX_FILE_SIZE = 5 * 1024 * 1024  # Максимальный размер файла (5MB)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}  # Разрешенные расширения файлов

# Создаем папку для загрузок, если её нет
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Монтируем статические файлы
app.mount("/assets", StaticFiles(directory="assets/"), name="assets")
app.mount("/images", StaticFiles(directory="assets/images/"), name="images")

# Вспомогательные функции
def allowed_file(filename: str) -> bool:
    """Проверяет, имеет ли файл разрешенное расширение"""
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS

# Маршруты API
@app.get("/", response_class=HTMLResponse)
async def get_root():
    """Возвращает стартовую страницу"""
    return FileResponse("start_page.html")

@app.get("/start_page.html", response_class=HTMLResponse)
async def get_root():
    """Альтернативный маршрут для стартовой страницы"""
    return FileResponse("start_page.html")

@app.get("/load_photo_page.html", response_class=HTMLResponse)
async def get_load_photo_page():
    """Возвращает страницу загрузки фото"""
    return FileResponse("load_photo_page.html")

@app.get("/ingredients_page.html", response_class=HTMLResponse)
async def get_ingredients_page():
    """Возвращает страницу с ингредиентами"""
    return FileResponse("ingredients_page.html")

@app.get("/recipe.html", response_class=HTMLResponse)
async def get_recipe_page():
    """Возвращает страницу с рецептом"""
    return FileResponse("recipe.html")

@app.post("/upload")
async def upload_file(image: UploadFile = File(...)):
    """
    Обрабатывает загрузку файла на сервер
    Проверяет:
    - наличие имени файла
    - разрешенное расширение
    - размер файла
    Генерирует уникальное имя и сохраняет файл
    """
    try:
        # Валидация файла
        if not image.filename or not allowed_file(image.filename):
            raise HTTPException(400, detail="Only image files are allowed (JPEG, JPG, PNG, WEBP)")

        # Проверка размера файла
        contents = await image.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(400, detail=f"File too large. Max size is {MAX_FILE_SIZE/1024/1024}MB")

        # Генерация уникального имени файла
        ext = Path(image.filename).suffix
        filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        # Сохранение файла
        with open(file_path, "wb") as buffer:
            buffer.write(contents)

        # Возвращаем клиенту путь к файлу
        return JSONResponse(content={
            "success": True,
            "message": "Photo uploaded successfully!",
            "filePath": f"/uploads/{filename}"
        })
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@app.post("/submit")
async def submit_ingredients(request: Request):
    """
    Обрабатывает отправку данных ингредиентов
    Логирует полученные данные и возвращает их обратно
    """
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

@app.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    """
    Возвращает загруженный файл по имени
    Проверяет существование файла перед отправкой
    """
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(404, detail="File not found")
    return FileResponse(file_path)

if __name__ == "__main__":
    # Запуск сервера Uvicorn
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
