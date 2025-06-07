from ultralytics import YOLO
from PIL import Image
import requests

# Загрузка модели (вынесено в отдельную функцию для переиспользования)
def load_model():
    WEIGHTS_PATH = "best.pt"
    URL = "https://raw.githubusercontent.com/Rualin/MAYI/model/best.pt"
    
    try:
        model = YOLO(WEIGHTS_PATH)
    except:
        # Скачиваем веса, если локально нет
        r = requests.get(URL)
        with open(WEIGHTS_PATH, "wb") as f:
            f.write(r.content)
        model = YOLO(WEIGHTS_PATH)
    
    return model

# Глобальная инициализация модели
model = load_model()

def predict_ingredients(img, threshold=0.6):
    # Предсказание
    results = model.predict(img, verbose=False)
    
    # Собираем уникальные ингредиенты
    ingredients = set()
    
    for result in results:
        # Обрабатываем каждый обнаруженный объект
        for box in result.boxes:
            if box.conf > threshold:  # Проверяем уверенность
                class_id = int(box.cls)  # ID класса
                ingredient_name = result.names[class_id]  # Название класса
                ingredients.add(ingredient_name)
    
    return sorted(ingredients)  # Возвращаем отсортированный список
