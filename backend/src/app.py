from fastapi import FastAPI, HTTPException, Query, UploadFile, File  # Added File here
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from controllers.recipes import fetch_dishes_by_ingredients
from controllers.predict import predict_ingredients
from PIL import Image
import uvicorn
import io
from googletrans import Translator
from pydantic import BaseModel

translator = Translator()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Content-Type"],  # Добавьте Content-Type
)

class IngredientsRequest(BaseModel):
    selectedIngredients: List[str]
    timestamp: str

@app.post("/submit")
async def get_dishes_by_ingredients(request: IngredientsRequest):
    try:
        ingredients_list = request.selectedIngredients
        
        if not ingredients_list:
            raise HTTPException(status_code=400, detail="No ingredients provided")
        print(f"Received ingredients: {ingredients_list}")  # перед вызовом fetch_dishes_by_ingredients
 
        dishes = fetch_dishes_by_ingredients(ingredients_list)
        
        print(f"Found dishes: {dishes}")  # после вызова fetch_dishes_by_ingredients

        return {
            "success": True,
            "dishes": [
                {
                    "id": dish[0],
                    "name": dish[1],
                    "receipt": dish[2],
                    "url": f"/recipe/{dish[0]}",
                    "ingredients": ingredients_list
                } 
                for dish in dishes
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/upload")
async def upload_image(image: UploadFile = File(...)):
    print("\n=== Начало обработки запроса ===")  # Логирование
    try:
        contents = await image.read()
        print(f"Размер файла: {len(contents)} байт")  # Логирование
        
        img = Image.open(io.BytesIO(contents))
        print("Изображение успешно открыто")  # Логирование
        
        ingredients_en = predict_ingredients(img)
        print(f"Найдены ингредиенты: {ingredients_en}")  # Логирование

        ingredients = ["яйца"]
        #for ingredient in ingredients_en:
        #    translator = Translator(from_lang="en", to_lang="ru")
        #    ingredients += [(translator.translate(ingredient))]

        print(f"Найдены ингредиенты: {ingredients}")  # Логирование
        
        dishes = fetch_dishes_by_ingredients(ingredients)
        print(f"Найдены рецепты: {dishes}")  # Логирование


        return {
            "success": True,
            "recipes": [
                {
                    "id": dish[0],
                    "name": dish[1],
                    "receipt": dish[2],
                    "url": f"/recipe/{dish[0]}",
                    "ingredients": ingredients
                } 
                for dish in dishes
            ] if dishes else []  # Явно возвращаем пустой массив, если dishes пусто
        }

    except Exception as e:
        print(f"ОШИБКА: {str(e)}")  # Логирование
        raise HTTPException(status_code=500, detail=str(e))
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
