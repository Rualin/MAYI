from utils.db_connection import get_db_connection
import psycopg2

# Поиск блюд, содержащих ЛЮБОЙ из указанных ингредиентов
def fetch_dishes_by_ingredients(ingredients):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()


        query = f"""
        SELECT DISTINCT d.id, d.name, d.receipt, d.category1_id, d.category2_id, d.time
        FROM dishes d
        JOIN dish_ingredients di ON d.id = di.dish_id
        JOIN ingredients i ON di.ingredient_id = i.id
        WHERE i.name = ANY(%s);
        """

        cursor.execute(query, (ingredients,))
        return cursor.fetchall()

    except psycopg2.Error as e:
        print("Database error:", e)
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Поиск блюд по названию
def fetch_dishes_by_name(dish_names):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = f"""
        SELECT d.id, d.name, d.receipt, d.category1_id, d.category2_id, d.time, 
               array_agg(i.name) AS ingredients
        FROM dishes d
        LEFT JOIN dish_ingredients di ON d.id = di.dish_id
        LEFT JOIN ingredients i ON di.ingredient_id = i.id
        WHERE d.name IN ({','.join(['%s'] * len(dish_names))})
        GROUP BY d.id;
        """



        cursor.execute(query, dish_names)
        return cursor.fetchall()
        
    except psycopg2.Error as e:
        print("Ошибка при работе с базой данных:", e)
        raise
    finally:
        
        if cursor:
            cursor.close()
        if conn:
            conn.close()
