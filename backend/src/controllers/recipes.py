from utils.db_connection import get_db_connection
import psycopg2


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
        results = cursor.fetchall()

        if results:
            print(f"{'ID':<5} {'Название':<30} {'Рецепт':<50} {'Категория 1 ID':<15} {'Категория 2 ID':<15} {'Время приготовления':<20} {'Ингредиенты':<50}")
            print("=" * 120)
            for row in results:
                print(f"{'ID':} {row[0]:}\n\n{'Название':} {row[1]:}\n\n{'Рецепт':} {row[2]:}\n\n{'Категория 1 ID':} {row[3]:}\n\n{'Категория 2 ID':} {row[4]:}\n\n{'Время приготовления':} {row[5]:}\n\n{'Ингредиенты':} {', '.join(row[6]) if row[6] else 'Нет ингредиентов':}\n\n")
        else:
            print("Нет блюд с указанными именами.")

    except psycopg2.Error as e:
        print("Ошибка при работе с базой данных:", e)
    finally:
        
        if cursor:
            cursor.close()
        if conn:
            conn.close()



def fetch_dishes_by_ingredients(ingredients):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        
        query = f"""
        SELECT DISTINCT d.id, d.name, d.receipt
        FROM dishes d
        JOIN dish_ingredients di ON d.id = di.dish_id
        JOIN ingredients i ON di.ingredient_id = i.id
        WHERE i.name IN ({','.join(['%s'] * len(ingredients))});
        """

        # Выполнение запроса
        cursor.execute(query, ingredients)

        
        results = cursor.fetchall()

        
        if results:
            print(f"{'ID':} {'Название':} {'Рецепт':} {'Категория 1 ID':} {'Категория 2 ID':} {'Время приготовления':}")
            print("=" * 120)
            for row in results:
                print(f"\n{'ID':} {row[0]:}\n{'Название':} {row[1]:}\n\n{'Рецепт':} {row[2]:}\n\n{'Категория 1 ID':} {row[3]:}\n{'Категория 2 ID':} {row[4]:}\n\n{'Время приготовления':} {row[5]:}\n\n\n")

        else:
            print("Нет блюд с указанными ингредиентами.")

    except psycopg2.Error as e:
        print("Ошибка при работе с базой данных:", e)
    finally:
        
        if cursor:
            cursor.close()
        if conn:
            conn.close()


