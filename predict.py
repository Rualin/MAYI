import requests
import json

from ultralytics import YOLO
from PIL import Image


WEIGHTS_PATH = "best.pt"
URL = "https://raw.githubusercontent.com/Rualin/MAYI/model/best.pt"

r = requests.get(URL)
with open(WEIGHTS_PATH, "wb") as f:
    f.write(r.content)

model = YOLO(WEIGHTS_PATH)

def get_image():
    img = Image.open("test_image.jpg")
    return img

def inference(img, threshold=0.6):
    pred = model.predict(img, verbose=False)[0]
    pred = pred.to_json()
    json_obj = json.loads(pred)
    # print(type(json_obj))
    # print(len(json_obj))
    res = []
    for dic in json_obj:
        if dic["confidence"] > threshold and dic["name"] not in res:
            res.append(dic["name"])
    res_dict = dict()
    res_dict["selectedIngredients"] = res
    return json.dumps(res_dict)


if __name__ == "__main__":
    print("This file must be a library!!!")
    # img = get_image()
    # res = inference(img)
    # print(res)
