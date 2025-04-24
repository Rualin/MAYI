import psycopg2
from config.config import db_config

def get_db_connection():
    return psycopg2.connect(**db_config)
