import psycopg2
from config.config import db_config

# Подключение к базе данных через db_config
# Файла config.py нет на гите, так как нужно вручную создавать базу данных,
# а потом в db_config записывать логин, пароль и т.д.
def get_db_connection():
    return psycopg2.connect(**db_config)
