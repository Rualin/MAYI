// Элементы DOM для загрузки файлов
const fileInput = document.getElementById('fileInput');
const initialBtn = document.getElementById('initialBtn');
const actionButtons = document.getElementById('actionButtons');
const changeBtn = document.getElementById('changeBtn');
const submitBtn = document.getElementById('submitBtn');
const fileInfo = document.getElementById('fileInfo');

// Элементы DOM для отображения рецептов
const recipesSection = document.getElementById('recipes-section');
const recipesContainer = document.getElementById('recipes-container');

/**
 * Состояние приложения:
 * - photo: base64 изображения
 * - file: объект File
 * - recipes: массив рецептов
 * - recipesResponse: полный ответ сервера
 */
let currentState = {
    photo: null,
    file: null,
    recipes: [],
    recipesResponse: null
};

// Инициализация загрузки файла
initialBtn.addEventListener('click', () => fileInput.click());

/**
 * Обработчик изменения файла в input
 */
fileInput.addEventListener('change', function(e) {
    if (this.files.length > 0) {
        const file = this.files[0];
        currentState.file = file;

        // Валидация файла
        if (!validateFile(file)) {
            return;
        }

        const reader = new FileReader();
        
        // Обработка загрузки файла
        reader.onload = function(e) {
            currentState.photo = e.target.result;
            
            // Отображение информации о файле
            fileInfo.innerHTML = `
                <div>Выбран файл: <strong>${file.name}</strong></div>
                <div>Размер: ${(file.size / 1024).toFixed(2)} KB</div>
            `;
            
            // Переключение видимости кнопок
            initialBtn.classList.add('d-none');
            actionButtons.classList.remove('d-none');
            
            // Очистка предыдущих результатов
            recipesSection.style.display = 'none';
            recipesContainer.innerHTML = '';
            currentState.recipes = [];
        };
        
        reader.readAsDataURL(file);
    }
});

/**
 * Валидация файла
 * @param {File} file - Объект файла
 * @returns {boolean} true если файл валиден
 */
function validateFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
        alert('Пожалуйста, выберите файл изображения (JPEG, PNG или WebP)');
        fileInput.value = '';
        return false;
    }
    
    if (file.size > maxSize) {
        alert('Файл слишком большой. Максимальный размер: 5MB');
        fileInput.value = '';
        return false;
    }
    
    return true;
}

// Кнопка изменения файла
changeBtn.addEventListener('click', () => {
    fileInput.value = '';
    fileInput.click();
});

/**
 * Обработчик отправки файла на сервер
 */
submitBtn.addEventListener('click', async function() {
    if (!currentState.photo) {
        alert('Пожалуйста, выберите фото для загрузки.');
        return;
    }

    // Показ состояния загрузки
    const originalText = this.innerHTML;
    this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Обработка...';
    this.disabled = true;
    changeBtn.disabled = true;

    try {
        // Подготовка FormData для отправки
        const formData = new FormData();
        formData.append('image', currentState.file);
        
        // Отправка на сервер
        const response = await fetch('http://127.0.0.1:8000/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        // Сохранение ответа сервера
        currentState.recipesResponse = data;
        
        // Показ тестовых рецептов (заглушка)
        showMockRecipes();
        
        // Сохранение состояния
        saveState();
        
    } catch (error) {
        console.error('Ошибка при отправке:', error);
        alert(`Ошибка при обработке фото: ${error.message}`);
    } finally {
        // Восстановление состояния кнопки
        this.innerHTML = originalText;
        this.disabled = false;
        changeBtn.disabled = false;
    }
});

/**
 * Сохранение состояния в sessionStorage
 */
function saveState() {
    const stateToSave = {
        photo: currentState.photo,
        recipes: currentState.recipes,
        timestamp: new Date().getTime()
    };
    sessionStorage.setItem('recipeSearchState', JSON.stringify(stateToSave));
}

/**
 * Загрузка состояния из sessionStorage
 */
function loadState() {
    const savedState = sessionStorage.getItem('recipeSearchState');
    if (savedState) {
        const state = JSON.parse(savedState);
        
        // Проверка, что состояние не старше 1 часа
        const oneHour = 60 * 60 * 1000;
        if (new Date().getTime() - state.timestamp < oneHour) {
            currentState = state;
            
            if (currentState.recipes.length > 0) {
                displayRecipes(currentState.recipes);
            }
        } else {
            sessionStorage.removeItem('recipeSearchState');
        }
    }
}

// Обработчик возврата на страницу
window.addEventListener('pageshow', function(event) {
    if (event.persisted || performance.getEntriesByType("navigation")[0].type === 'back_forward') {
        loadState();
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверка возврата со страницы рецепта
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('from') && urlParams.get('from') === 'recipe') {
        loadState();
    }
});

/**
 * Загрузка шаблона страницы рецепта
 * @returns {Promise<string>} HTML шаблона
 */
async function loadTemplate() {
    try {
        const response = await fetch('recipe_template.html');
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
 * Генерация страницы рецепта
 * @param {Object} recipeData - Данные рецепта
 */
async function generateRecipePage(recipeData) {
    try {
        // Сохранение рецепта в localStorage
        localStorage.setItem('currentRecipe', JSON.stringify(recipeData));

        // Перенаправление на страницу рецепта
        window.location.href = `recipe.html?id=${recipeData.id}`;
    } catch (error) {
        console.error('Ошибка генерации страницы рецепта:', error);
        throw error;
    }
}

/**
 * Отображение тестовых рецептов (заглушка)
 */
function showMockRecipes() {
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

    displayRecipes(mockResponse);
}

/**
 * Отображение списка рецептов
 * @param {Object} response - Ответ сервера с рецептами
 */
function displayRecipes(response) {
    if (!recipesContainer) return;

    // Очистка контейнера
    recipesContainer.innerHTML = '';

    // Проверка наличия рецептов
    if (!response?.success || !response.recipes?.length) {
        recipesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-info">Рецепты не найдены</div>
                <p>Попробуйте изменить набор ингредиентов</p>
            </div>
        `;
        recipesSection.style.display = 'block';
        return;
    }

    // Создание карточек рецептов
    response.recipes.forEach(recipe => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';

        const card = document.createElement('div');
        card.className = 'card h-100 shadow-sm';
        card.style.cursor = 'pointer';
        card.onclick = () => generateRecipePage(recipe);

        // Генерация HTML для изображения
        const imgHtml = recipe.image
            ? `<img src="${recipe.image}" class="card-img-top" alt="${recipe.name}" style="height: 200px; object-fit: cover;">`
            : `<div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 200px;">
                  <i class="bi bi-image text-muted" style="font-size: 3rem;"></i>
               </div>`;

        // Генерация списка ингредиентов
        const ingredientsList = recipe.ingredients.slice(0, 3).map(ing =>
            `<span class="badge bg-secondary me-1 mb-1">${ing}</span>`
        ).join('');

        // Заполнение карточки
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

    // Показ секции с рецептами
    recipesSection.style.display = 'block';
}