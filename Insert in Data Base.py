import psycopg2

def fetch_dishes_by_name():
    try:
        # Установка соединения с базой данных
        conn = psycopg2.connect(
            host="localhost",
            database="upp",
            user="postgres",
            password="postgres"
        )
        cursor = conn.cursor()

        name1 = input("Введите название рецепта: ")
        query = "SELECT id FROM dishes WHERE lower(name) = %s"
        cursor.execute(query, (name1.lower(),))
        result_of_name_receipt = cursor.fetchone()

        if result_of_name_receipt is None:
            print("Рецепт не найден. Добавим новый рецепт.")
            receipt = input("Введите рецепт: ")

            category_1 = input("Напишите категорию блюда (закуска, суп, салат, горячее, десерт или NULL): ")
            while category_1 not in ['закуска', 'суп', 'салат', 'горячее', 'десерт', 'NULL']:
                category_1 = input("Неверная категория. Напишите категорию блюда: ")

            query = "SELECT id FROM category1 WHERE name = %s"
            cursor.execute(query, (category_1,))
            result_of_category1 = cursor.fetchone()

            category_2 = input("Напишите категорию блюда (завтрак, обед, ужин, перекус или NULL): ")
            while category_2 not in ['завтрак', 'обед', 'ужин', 'перекус', 'NULL']:
                category_2 = input("Неверная категория. Напишите категорию блюда: ")

            query = "SELECT id FROM category2 WHERE name = %s"
            cursor.execute(query, (category_2,))
            result_of_category2 = cursor.fetchone()

            time = input("Напишите время готовки: '>5 часов','4 - 5 часов', '2 - 3 часа', '3 - 4 часа', '1 - 2 часа', '<= 1 час' или 'NULL': ")
            while time not in ['>5 часов', '4 - 5 часов', '2 - 3 часа', '3 - 4 часа', '1 - 2 часа', '<= 1 час', 'NULL']:
                time = input("Неверное время. Напишите время готовки: ")

            query = "SELECT id FROM time WHERE name = %s"
            cursor.execute(query, (time,))
            result_of_time = cursor.fetchone()

            # Получаем максимальный id из таблицы dishes
            cursor.execute("SELECT MAX(id) FROM dishes")
            max_id_result = cursor.fetchone()
            new_dish_id = (max_id_result[0] + 1) if max_id_result[0] is not None else 1

            # Вставка нового рецепта в базу данных
            insert_dish_query = """
            INSERT INTO dishes (id, name, receipt, category1_id, category2_id, time)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(insert_dish_query, (
                new_dish_id,
                name1,
                receipt,
                result_of_category1[0] if result_of_category1 else None,
                result_of_category2[0] if result_of_category2 else None,
                result_of_time[0] if result_of_time else None
            ))
            print(f"Рецепт '{name1}' добавлен в базу данных с id {new_dish_id}.")

            # Запрос ингредиентов
            valid_units = [
                "штуки", "граммы", "килограммы", "миллилитры", "литры",
                "столовая ложка", "чайная ложка", "щепотка", "на глаз",
                "по вкусу", "банка", "зубчик", "стакан", "ломтик"
            ]
            
            while True:
                ingredient = input("Введите ингредиент (или 'стоп' для завершения): ")
                if ingredient.lower() == 'стоп':
                    break
                quantity = input(f"Введите количество для '{ingredient}': ")
                                # Запрос единицы измерения с проверкой на допустимые значения
                while True:
                    unit_name = input(f"Введите единицу измерения для '{ingredient}' (доступные: {', '.join(valid_units)}): ")
                    if unit_name.lower() in valid_units:
                        break
                    else:
                        print("Неверная единица измерения. Пожалуйста, выберите из доступных.")

                # Получаем ID ингредиента
                cursor.execute("SELECT id FROM ingredients WHERE lower(name) = %s", (ingredient.lower(),))
                ingredient_result = cursor.fetchone()
                
                if ingredient_result is None:
                    # Если ингредиента нет, добавляем его и получаем новый id
                    cursor.execute("SELECT MAX(id) FROM ingredients")
                    max_ingredient_id_result = cursor.fetchone()
                    new_ingredient_id = (max_ingredient_id_result[0] + 1) if max_ingredient_id_result[0] is not None else 1
                    
                    insert_ingredient_query = "INSERT INTO ingredients (id, name) VALUES (%s, %s)"
                    cursor.execute(insert_ingredient_query, (new_ingredient_id, ingredient))
                    ingredient_id = new_ingredient_id
                    print(f"Ингредиент '{ingredient}' добавлен с id {ingredient_id}.")
                else:
                    ingredient_id = ingredient_result[0]
                    print(f"Ингредиент '{ingredient}' уже существует с id {ingredient_id}.")

                # Получаем ID единицы измерения
                cursor.execute("SELECT id FROM units WHERE lower(name) = %s", (unit_name.lower(),))
                unit_result = cursor.fetchone()
                
                if unit_result is None:
                    # Если единицы измерения нет, добавляем ее и получаем новый id
                    cursor.execute("SELECT MAX(id) FROM units")
                    max_unit_id_result = cursor.fetchone()
                    new_unit_id = (max_unit_id_result[0] + 1) if max_unit_id_result[0] is not None else 1
                    
                    insert_unit_query = "INSERT INTO units (id, name) VALUES (%s, %s)"
                    cursor.execute(insert_unit_query, (new_unit_id, unit_name))
                    unit_id = new_unit_id
                    print(f"Единица измерения '{unit_name}' добавлена с id {unit_id}.")
                else:
                    unit_id = unit_result[0]
                    print(f"Единица измерения '{unit_name}' уже существует с id {unit_id}.")

                # Добавление записи в таблицу dish_ingredients
                insert_dish_ingredient_query = """
                INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity, unit_id)
                VALUES (%s, %s, %s, %s)
                """
                cursor.execute(insert_dish_ingredient_query, (new_dish_id, ingredient_id, quantity, unit_id))

        else:
            print(f"Рецепт '{name1}' уже существует в базе данных с id {result_of_name_receipt[0]}.")

        # Закрытие соединения
        conn.commit()
    except Exception as e:
        print(f"Произошла ошибка: {e}")
    finally:
        cursor.close()
        conn.close()

# Запуск функции
fetch_dishes_by_name()


