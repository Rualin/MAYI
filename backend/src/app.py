from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from controllers.recipes import fetch_dishes_by_ingredients
from controllers.predict import predict_data
from PIL import Image
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/dishes/by-ingredients/")
async def get_dishes_by_ingredients(ingredients: str = Query(...)):
    try:
        ingredients_list = [i.strip() for i in ingredients.split(',') if i.strip()]
        
        if not ingredients_list:
            raise HTTPException(status_code=400, detail="No ingredients provided")
        
        dishes = fetch_dishes_by_ingredients(ingredients_list)
        
        return {
            "success": True,
            "dishes": [
                {
                    "id": dish[0],
                    "name": dish[1],
                    "receipt": dish[2]
                } 
                for dish in dishes
            ]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Читаем изображение
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Сохраняем временно для предсказания
        image.save("temp_upload.jpg")
        
        # Получаем предсказание (нужно модифицировать predict.py)
        ingredients = predict_data("temp_upload.jpg")  # Должен возвращать список ингредиентов
        
        # Получаем рецепты по ингредиентам
        dishes = fetch_dishes_by_ingredients(ingredients)
        
        return {
            "success": True,
            "recipes": [
                {
                    "id": dish[0],
                    "name": dish[1],
                    "receipt": dish[2],
                    "url": f"/recipe/{dish[0]}"
                } 
                for dish in dishes
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
