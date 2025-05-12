import psycopg2
import json
from decimal import Decimal
from json_convector import load_ingredients_from_file

def fetch_dishes(ingredients):
    try:
        # Установка соединения с базой данных
        conn = psycopg2.connect(
            host="localhost",
            database="upp",
            user="postgres",
            password="postgres"
        )
        cursor = conn.cursor()

        # Запрос для получения блюд
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
        WHERE i.name IS NULL OR i.name IN ({','.join(['%s'] * len(ingredients))});
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
                
                # Запрос для получения ингредиентов для текущего блюда
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

           
            with open('dishes.json', 'w', encoding='utf-8') as json_file:
                json.dump(dishes, json_file, ensure_ascii=False, indent=4)

            print(f"Записано {len(dishes)} блюд в файл 'dishes.json'.")
       

    except psycopg2.Error as e:
        print("Ошибка при работе с базой данных:", e)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Загрузка ингредиентов из файла и вызов функции
ingredients_list = load_ingredients_from_file('ingredients.json')
fetch_dishes(ingredients_list)







