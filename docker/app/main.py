import os
import json
import psycopg2
from decimal import Decimal
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI()

class IngredientsRequest(BaseModel):
    selectedIngredients: List[str]
    timestamp: str

def load_ingredients_from_file(file_path: str) -> List[str]:
    """Загрузить список ингредиентов из JSON файла."""
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
            return data.get("ingredients", [])
    except Exception as e:
        print(f"Ошибка при загрузке ингредиентов из файла: {e}")
        return []

def fetch_dishes(ingredients):
 
    conn = None
    cursor = None
    
    try:
        print(os.getenv('DB_HOST', 'localhost'));
        print(os.getenv('DB_NAME', 'upp'));
        print(os.getenv('DB_USER', 'postgres'));
        print(os.getenv('DB_PASSWORD', 'postgres));

        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'upp'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', 'postgres')
        )
        cursor = conn.cursor()


        placeholders = ','.join(['%s'] * len(ingredients))
        query_dishes = f"""
        SELECT DISTINCT d.id, d.name, d.receipt,
               c1.name AS category1_name, c2.name AS category2_name,
               t.name AS cooking_time
        FROM dishes d
        LEFT JOIN dish_ingredients di ON d.id = di.dish_id
        LEFT JOIN ingredients i ON di.ingredient_id = i.id
        LEFT JOIN category1 c1 ON d.category1_id = c1.id
        LEFT JOIN category2 c2 ON d.category2_id = c2.id
        LEFT JOIN time t ON d.time = t.id
        WHERE i.name IS NULL OR i.name IN ({placeholders});
        """

        cursor.execute(query_dishes, ingredients)
        dish_results = cursor.fetchall()

        dishes = []

        if dish_results:
            for row in dish_results:
                dish_id = row[0]
                dish = {
                    "Name": row[1],
                    "Recipe": row[2],
                    "Category 1": row[3],
                    "Category 2": row[4],
                    "Cooking Time": row[5],
                    "Ingredients": []
                }
                
                query_ingredients = """
                SELECT di.ingredient_id, i.name, di.quantity, u.name AS unit
                FROM dish_ingredients di
                LEFT JOIN ingredients i ON di.ingredient_id = i.id
                LEFT JOIN units u ON di.unit_id = u.id
                WHERE di.dish_id = %s;
                """
                
                cursor.execute(query_ingredients, (dish_id,))
                ingredient_results = cursor.fetchall()

                for ingredient_row in ingredient_results:
                    ingredient = {
                        "Ingredient ID": ingredient_row[0],
                        "Name": ingredient_row[1],
                        "Quantity": float(ingredient_row[2]) if isinstance(ingredient_row[2], Decimal) else ingredient_row[2],
                        "Unit": ingredient_row[3]
                    }
                    dish["Ingredients"].append(ingredient)

                dishes.append(dish)

        return dishes

    except psycopg2.Error as e:
        print("Ошибка при работе с базой данных:", e)
        raise HTTPException(status_code=500, detail=e)
    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()

@app.post("/dishes/", response_model=List[dict])
async def get_dishes(ingredients_request: IngredientsRequest):
    """Обработчик маршрута для получения блюд на основе выбранных ингредиентов."""
    dishes = fetch_dishes(ingredients_request.selectedIngredients)
    if not dishes:
        raise HTTPException(status_code=404, detail="No dishes found for the selected ingredients.")
    return dishes
