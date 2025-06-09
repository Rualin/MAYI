import psycopg2

def fetch_dishes(ingredients):
    try:
        # Установка соединения с базой данных PostgreSQL
        conn = psycopg2.connect(
            host="localhost",  
            database="upp",    
            user="postgres",    
            password="postgres" 
        )
        cursor = conn.cursor()  # Создание курсора для выполнения запросов

        # SQL-запрос для получения уникальных блюд по указанным ингредиентам
        query = f"""
        SELECT DISTINCT d.id, d.name, d.receipt, d.category1_id, d.category2_id, d.time
        FROM dishes d
        JOIN dish_ingredients di ON d.id = di.dish_id  # Соединение таблицы блюд с таблицей ингредиентов
        JOIN ingredients i ON di.ingredient_id = i.id   # Соединение с таблицей ингредиентов
        WHERE i.name IN ({','.join(['%s'] * len(ingredients))});  # Фильтрация по именам ингредиентов
        """

        # Выполнение запроса с параметрами ingredients
        cursor.execute(query, ingredients)

        # Получение всех результатов запроса
        results = cursor.fetchall()

        # Проверка наличия результатов и вывод информации о каждом блюде
        if results:
            print(f"{'ID':<5} {'Название':<30} {'Рецепт':<50} {'Категория 1 ID':<15} {'Категория 2 ID':<15} {'Время приготовления':<20}")
            print("=" * 120)
            for row in results:
                # Форматированный вывод данных о каждом блюде
                print(f"\n{'ID':} {row[0]:}\n{'Название':} {row[1]:}\n\n{'Рецепт':} {row[2]:}\n\n{'Категория 1 ID':} {row[3]:}\n{'Категория 2 ID':} {row[4]:}\n\n{'Время приготовления':} {row[5]:}\n\n\n")
        else:
            print("Нет блюд с указанными ингредиентами.")  # Сообщение, если нет найденных блюд

    except psycopg2.Error as e:
        # Обработка ошибок при работе с базой данных
        print("Ошибка при работе с базой данных:", e)
    finally:
        # Закрытие курсора и соединения с базой данных в любом случае
        if cursor:
            cursor.close()
        if conn:
            conn.close()

ingredients_list = ['яйца']
fetch_dishes(ingredients_list)  # Вызов функции для получения информации о блюдах с указанными ингредиентами
