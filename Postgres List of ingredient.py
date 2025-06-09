import psycopg2

def list_of_base():
    try:
        # Установка соединения с базой данных
        conn = psycopg2.connect(
            host="localhost",
            database="upp",
            user="postgres",
            password="postgres"
        )
        cursor = conn.cursor()

        # Запрос на получение блюд и их ингредиентов
        query = "SELECT name FROM ingredients"
        cursor.execute(query)
        results = cursor.fetchall()

        
        with open('ingredients_list.txt', 'w', encoding='utf-8') as file:
            for row in results:
                file.write(row[0] + '\n')  

    except psycopg2.Error as e:
        print("Ошибка при работе с базой данных:", e)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

list_of_base()

