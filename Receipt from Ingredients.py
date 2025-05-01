import psycopg2

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

        
        query = f"""
        SELECT DISTINCT d.id, d.name, d.receipt, d.category1_id, d.category2_id, d.time
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


ingredients_list = ['яйца']
fetch_dishes(ingredients_list)
