import json

from ultralytics import YOLO
# from PIL import Image
import requests

import translate as tran

# urls to download weights and names of weights
COMMON_WEIGHTS_PATH = "best.pt"
COMMON_URL = "https://raw.githubusercontent.com/Rualin/MAYI/model/best.pt"
# MEAT_WEIGHTS_PATH = "meat.pt"
# MEAT_URL = "https://raw.githubusercontent.com/Rualin/MAYI/model/meat.pt"

# Загрузка модели (вынесено в отдельную функцию для переиспользования)
def load_model(weights_path: str, url: str):
    '''
    Function that downloads weights and initialize model by them
    '''
    try:
        # Пытаемся использовать локальные веса
        model = YOLO(weights_path)
    except:
        # Скачиваем веса, если локально нет
        r = requests.get(url)
        with open(weights_path, "wb") as f:
            f.write(r.content)
        model = YOLO(weights_path)
    return model

# Глобальная инициализация модели
common_model = load_model(COMMON_WEIGHTS_PATH, COMMON_URL)
# meat_model = load_model(MEAT_WEIGHTS_PATH, MEAT_URL)

def predict_ingredients(img, threshold=0.6):
    '''
    Function that predicts ingredients on image.
    Returns ingredients in json format
    '''
    # Предсказание
    common_results = common_model.predict(img, verbose=False)[0]
    common_pred = common_results.to_json()
    common_json = json.loads(common_pred)

    # Собираем уникальные ингредиенты
    ingredients = set()
    for dic in common_json:
        if dic["confidence"] > threshold:
            ingredients.add(dic["name"])

    ingredients = list(ingredients)
    ingredients = tran.translation(ingredients)
    res_dict = dict()
    res_dict["selectedIngredients"] = ingredients
    
    return res_dict


# if __name__ == "__main__":
#     img = Image.open("backend\\src\\controllers\\test_image.jpg")
#     res = predict_ingredients(img)
#     print(res)