# Импорт необходимых модулей
from fastapi import FastAPI, HTTPException, Query, UploadFile, File  # File для работы с загружаемыми файлами
from fastapi.middleware.cors import CORSMiddleware  # Для обработки CORS
from typing import List  # Для аннотации типов
from controllers.recipes import fetch_dishes_by_ingredients  # Наш контроллер для поиска рецептов
from controllers.predict import predict_ingredients  # Модель для предсказания ингредиентов
from PIL import Image  # Для работы с изображениями
import uvicorn  # ASGI сервер
import io  # Для работы с потоками байтов
from pydantic import BaseModel  # Для создания моделей запросов


# Создание экземпляра FastAPI приложения
app = FastAPI()

# Настройка CORS middleware для разрешения запросов с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Разрешенные домены
    allow_credentials=True,
    allow_methods=["*"],  # Разрешенные HTTP методы
    allow_headers=["*", "Content-Type"],  # Разрешенные заголовки
)

# Модель Pydantic для валидации входящего запроса с ингредиентами
class IngredientsRequest(BaseModel):
    selectedIngredients: List[str]  # Список выбранных ингредиентов
    timestamp: str  # Временная метка (может использоваться для логирования)

# Эндпоинт для получения рецептов по выбранным ингредиентам
@app.post("/submit")
async def get_dishes_by_ingredients(request: IngredientsRequest):
    try:
        # Получаем список ингредиентов из запроса
        ingredients_list = request.selectedIngredients
        
        # Проверяем, что список ингредиентов не пустой
        if not ingredients_list:
            raise HTTPException(status_code=400, detail="No ingredients provided")
        print(f"Received ingredients: {ingredients_list}")  # Логирование полученных ингредиентов
 
        # Получаем рецепты по ингредиентам
        dishes = fetch_dishes_by_ingredients(ingredients_list)
        
        print(f"Found dishes: {dishes}")  # Логирование найденных рецептов

        # Формируем ответ в нужном формате
        return {
            "success": True,
            "dishes": [
                {
                    "id": dish[0],  # ID рецепта
                    "name": dish[1],  # Название рецепта
                    "receipt": dish[2],  # Текст рецепта
                    "url": f"/recipe/{dish[0]}",  # URL для просмотра рецепта
                    "ingredients": ingredients_list  # Использованные ингредиенты
                } 
                for dish in dishes  # Генератор списка для каждого найденного рецепта
            ]
        }
    except Exception as e:
        # Обработка ошибок с возвратом 500 статуса
        raise HTTPException(status_code=500, detail=str(e))


# Эндпоинт для загрузки изображения и поиска рецептов по нему
@app.post("/upload")
async def upload_image(image: UploadFile = File(...)):
    print("\n=== Начало обработки запроса ===")  # Логирование начала обработки
    try:
        # Чтение содержимого загруженного файла
        contents = await image.read()
        print(f"Размер файла: {len(contents)} байт")  # Логирование размера файла
        
        # Открытие изображения с помощью PIL
        img = Image.open(io.BytesIO(contents))
        print("Изображение успешно открыто")  # Логирование успешного открытия
        
        # Получение предсказанных ингредиентов (на английском)
        ingredients_en = predict_ingredients(img)
        print(f"Найдены ингредиенты: {ingredients_en}")  # Логирование найденных ингредиентов

        # Временный список ингредиентов на русском (заглушка)
        ingredients = ['яйцо', 'молоко']
        # Закомментированный код для перевода ингредиентов с английского на русский
        #for ingredient in ingredients_en:
        #    translator = Translator(from_lang="en", to_lang="ru")
        #    ingredients += [(translator.translate(ingredient))]

        print(f"Найдены ингредиенты: {ingredients}")  # Логирование переведенных ингредиентов
        
        # Поиск рецептов по ингредиентам
        dishes = fetch_dishes_by_ingredients(ingredients)
        print(f"Найдены рецепты: {dishes}")  # Логирование найденных рецептов

        # Формирование ответа
        return {
            "success": True,
            "recipes": [
                {
                    "id": dish[0],  # ID рецепта
                    "name": dish[1],  # Название рецепта
                    "receipt": dish[2],  # Текст рецепта
                    "url": f"/recipe/{dish[0]}",  # URL для просмотра рецепта
                    "ingredients": ingredients  # Использованные ингредиенты
                } 
                for dish in dishes  # Генератор списка для каждого найденного рецепта
            ] if dishes else []  # Возвращаем пустой массив, если рецептов нет
        }

    except Exception as e:
        # Логирование и обработка ошибок
        print(f"ОШИБКА: {str(e)}")  # Логирование ошибки
        raise HTTPException(status_code=500, detail=str(e))

# Запуск сервера при непосредственном выполнении файла
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
