# Инструкция для запуска

#### 1. Создание базы данных

##### 1.1. Используя файл из db, нужно создать базу данных в postgres
```
sudo -u postgres psql
```
```
CREATE DATABASE mydatabase;
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE mydatabase TO myuser;
```
```
psql -U myuser -d mydatabase -f db/dump-upp-202504231613.sql
```
##### 1.2. После этого нужно внести данные в config/config.py

#### 2. Скачивание нужных библиотек
```
python -m venv food_env
pip install -r requirements.txt
```

#### 3. Локальное тестирование

##### 3.1. Запустить backend (порт 8000)
```
cd backend/src
uvicorn app:app
```
##### 3.2. Запустить frontend (порт 3000)
```
cd frontend
uvicorn main:app --port 3000
```
##### 3.3. Открыть http://localhost:3000/
