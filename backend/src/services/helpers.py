from utils.db_connection import get_db_connection

def load_recipes(): # Не используется, так как рецепты ищем с помощью sql
    connection = get_db_connection()
    crsr = connection.cursor()
    crsr.execute("SELECT * FROM emp")
    recipes = crsr.fetchall()
    return recipes

def get_request_info(filename): # Не используется, так как рецепты ищем с помощью sql
    file = filename.open()
    ingredients, category, calorific = file
    return ingredients, category, calorific


