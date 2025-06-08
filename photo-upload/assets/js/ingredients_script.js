// Получаем элементы DOM для секции рецептов
const recipesSection = document.getElementById('recipes-section');
const recipesContainer = document.getElementById('recipes-container');

// Загрузка списка ингредиентов при открытии страницы
document.addEventListener('DOMContentLoaded', function() {
    // URL RAW-файла на GitHub (замените на ваш реальный URL)
    const githubRawUrl = 'https://raw.githubusercontent.com/Rualin/MAYI/refs/heads/site/photo-upload/ingredients_list.txt';
    
    // Загружаем список ингредиентов с GitHub
    fetch(githubRawUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Не удалось загрузить список ингредиентов');
            }
            return response.text();
        })
        .then(text => {
            // Обрабатываем полученный текст: разбиваем на строки, обрезаем пробелы, удаляем пустые строки
            const ingredients = text.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            // Рендерим ингредиенты на странице
            renderIngredients(ingredients);
            // Активируем кнопку поиска рецептов
            document.getElementById('recipeBtn').disabled = false;
        })
        .catch(error => {
            console.error('Ошибка загрузки:', error);
            alert('Ошибка загрузки списка ингредиентов');
        });
});

/**
 * Функция отрисовки чекбоксов ингредиентов
 * @param {Array} ingredients - Массив строк с названиями ингредиентов
 */
function renderIngredients(ingredients) {
    const container = document.getElementById('ingredientsContainer');
    container.innerHTML = ''; // Очищаем контейнер

    // Создаем чекбокс для каждого ингредиента
    ingredients.forEach(ingredient => {
        // Создаем ID, заменяя пробелы на дефисы и приводя к нижнему регистру
        const id = 'ingredient-' + ingredient.replace(/\s+/g, '-').toLowerCase();
        
        const div = document.createElement('div');
        div.className = 'form-check';
        
        // Добавляем HTML для чекбокса и подписи
        div.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${ingredient}" id="${id}">
            <label class="form-check-label" for="${id}">${ingredient}</label>
        `;
        
        container.appendChild(div);
    });
}

// Обработчик кнопки поиска рецептов
document.getElementById('recipeBtn').addEventListener('click', async function() {
    // Сохраняем оригинальный текст кнопки и меняем на индикатор загрузки
    const originalText = this.innerHTML;
    this.disabled = true;
    this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Поиск...';

    try {
        // Получаем выбранные ингредиенты
        const checkboxes = document.querySelectorAll('#ingredientsContainer .form-check-input:checked');
        const selectedIngredients = Array.from(checkboxes).map(checkbox => checkbox.value);

        // Проверяем, что выбран хотя бы один ингредиент
        if (selectedIngredients.length === 0) {
            throw new Error('Пожалуйста, выберите хотя бы один ингредиент');
        }

        // Формируем данные для отправки на сервер
        const ingredientsData = {
            ingredients: selectedIngredients,
            timestamp: new Date().toISOString()
        };

        // URL сервера для отправки запроса
        const serverUrl = 'http://127.0.0.1:8000/api/submit';
        
        // Отправляем POST-запрос на сервер
        const response = await fetch(serverUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ingredientsData)
        });

        // Проверяем статус ответа
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Ошибка HTTP: ${response.status}`);
        }

        // Парсим ответ сервера
        const data = await response.json();
        
        // Проверяем наличие ошибки в ответе
        if (data.error) {
            throw new Error(data.error);
        }

        // Проверяем успешность и наличие рецептов
        if (!data.success) {
            throw new Error('Не удалось найти рецепты');
        }

        // Показываем рецепты (в данном случае моковые данные)
        showMockRecipes(data);
        
    } catch (error) {
        console.error('Ошибка при поиске:', error);
        alert(error.message);
    } finally {
        // Восстанавливаем оригинальное состояние кнопки
        this.innerHTML = originalText;
        this.disabled = false;
    }
});

/**
 * Функция для отображения тестовых рецептов (заглушка)
 * @param {Object} selectedIngredients - Объект с выбранными ингредиентами
 */
function showMockRecipes(selectedIngredients) {
    // Моковые данные для демонстрации
    const mockResponse = {
        success: true,
        recipes: [
            {
                id: 1,
                name: "Салат из помидоров и огурцов",
                ingredients: ["помидоры", "огурцы", "лук", "масло оливковое", "соль"],
                receipt: "Инструкция по приготовлению..."
            },
            {
                id: 2,
                name: "Омлет с овощами",
                ingredients: ["яйца", "помидоры", "лук", "перец болгарский", "соль", "масло растительное"],
                receipt: "Инструкция по приготовлению..."
            }
        ]
    };

    // Отображаем рецепты
    displayRecipes(mockResponse);
}

/**
 * Функция для загрузки шаблона страницы рецепта
 * @returns {Promise<string>} HTML-шаблон
 */
async function loadTemplate() {
    try {
        const response = await fetch('template.html');
        if (!response.ok) {
            throw new Error('Не удалось загрузить шаблон');
        }
        return await response.text();
    } catch (error) {
        console.error('Ошибка загрузки шаблона:', error);
        throw error;
    }
}

/**
 * Функция для генерации страницы рецепта
 * @param {Object} recipeData - Данные рецепта
 */
async function generateRecipePage(recipeData) {
    try {
        // Сохраняем рецепт в localStorage
        localStorage.setItem('currentRecipe', JSON.stringify(recipeData));
        
        // Переходим на страницу рецепта
        window.location.href = `recipe.html?id=${recipeData.id}`;
    } catch (error) {
        console.error('Ошибка генерации страницы рецепта:', error);
        throw error;
    }
}

/**
 * Функция отображения рецептов
 * @param {Object} response - Ответ сервера с рецептами
 */
function displayRecipes(response) {
    // Проверяем наличие контейнера для рецептов
    if (!recipesContainer) return;
    
    // Очищаем контейнер
    recipesContainer.innerHTML = '';
    
    // Проверяем наличие рецептов в ответе
    if (!response?.success || !response.recipes?.length) {
        // Показываем сообщение, если рецептов нет
        recipesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-info">Рецепты не найдены</div>
                <p>Попробуйте изменить набор ингредиентов</p>
            </div>
        `;
        recipesSection.style.display = 'block';
        return;
    }

    // Создаем карточки для каждого рецепта
    response.recipes.forEach(recipe => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        
        const card = document.createElement('div');
        card.className = 'card h-100 shadow-sm';
        card.style.cursor = 'pointer';
        // Добавляем обработчик клика для перехода на страницу рецепта
        card.onclick = () => generateRecipePage(recipe);
        
        // Генерируем HTML для изображения (если есть) или placeholder
        const imgHtml = recipe.image 
            ? `<img src="${recipe.image}" class="card-img-top" alt="${recipe.name}" style="height: 200px; object-fit: cover;">`
            : `<div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 200px;">
                  <i class="bi bi-image text-muted" style="font-size: 3rem;"></i>
               </div>`;
        
        // Генерируем список ингредиентов (первые 3)
        const ingredientsList = recipe.ingredients.slice(0, 3).map(ing => 
            `<span class="badge bg-secondary me-1 mb-1">${ing}</span>`
        ).join('');
        
        // Заполняем карточку рецепта
        card.innerHTML = `
            ${imgHtml}
            <div class="card-body">
                <h5 class="card-title">${recipe.name}</h5>
                <div class="mb-2">${ingredientsList}</div>
                ${recipe.ingredients.length > 3 
                    ? `<small class="text-muted">+ ещё ${recipe.ingredients.length - 3} ингредиентов</small>` 
                    : ''}
            </div>
            <div class="card-footer bg-white border-top-0">
                <small class="text-primary">Нажмите для просмотра</small>
            </div>
        `;
        
        col.appendChild(card);
        recipesContainer.appendChild(col);
    });
    
    // Показываем секцию с рецептами
    recipesSection.style.display = 'block';
}