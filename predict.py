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

if __name__ == "__main__":
    args = parse_args()
    wp = args.weights_path
    ip = args.image_path
    verb = args.verbose
    model = YOLO(wp)
    img = get_image(ip)
    res = model.predict(img, verbose=verb)[0].show()
