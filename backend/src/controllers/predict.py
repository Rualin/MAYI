import argparse
from ultralytics import YOLO
from PIL import Image


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("-wp", "--weights_path", type=str, default="best.pt")
    parser.add_argument("-ip", "--image_path", type=str, default="test_image.jpg")
    parser.add_argument("-v", "--verbose", type=bool, default=False, help="True if you want to see logs of model")
    return parser.parse_args()

def get_image(ip):
    img = Image.open(ip)
    return img

def predict_data(image_path):
    args = parse_args()
    model = YOLO(args.weights_path)
    img = get_image(image_path)
    results = model.predict(img, verbose=args.verbose)[0]
    
    # Извлекаем обнаруженные ингредиенты
    ingredients = []
    for box in results.boxes:
        class_id = int(box.cls)
        ingredients.append(results.names[class_id])
    
    return list(set(ingredients))  # Убираем дубликаты
