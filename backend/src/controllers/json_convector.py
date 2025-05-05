import json

def load_ingredients_from_file(file_name):

    try:
        with open(file_name, 'r', encoding='utf-8') as file:
            ingredients_data = json.load(file)
        
        selected_ingredients = ingredients_data.get('selectedIngredients', [])
        return selected_ingredients
    
    except FileNotFoundError:
        print(f"Файл '{file_name}' не найден.")
        return []
