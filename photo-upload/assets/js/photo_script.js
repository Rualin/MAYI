// File upload elements
const fileInput = document.getElementById('fileInput');
const initialBtn = document.getElementById('initialBtn');
const actionButtons = document.getElementById('actionButtons');
const changeBtn = document.getElementById('changeBtn');
const submitBtn = document.getElementById('submitBtn');
const fileInfo = document.getElementById('fileInfo');

// Recipe elements
const recipesSection = document.getElementById('recipes-section');
const recipesContainer = document.getElementById('recipes-container');

// Состояние приложения
let currentState = {
    photo: null,
    file: null,
    recipes: []
};

// Initial file upload setup
initialBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', function(e) {
    if (this.files.length > 0) {
        const file = this.files[0];
        currentState.file = file;

        if (!validateFile(file)){
            return;
        }

        const reader = new FileReader();
        
        reader.onload = function(e) {
            currentState.photo = e.target.result;
            
            // Show file info with preview
            fileInfo.innerHTML = `
                <div>Выбран файл: <strong>${file.name}</strong></div>
                <div>Размер: ${(file.size / 1024).toFixed(2)} KB</div>
            `;
            
            // Switch button visibility
            initialBtn.classList.add('d-none');
            actionButtons.classList.remove('d-none');
            
            // Clear previous results
            recipesSection.style.display = 'none';
            recipesContainer.innerHTML = '';
            currentState.recipes = [];
        };
        
        reader.readAsDataURL(file);
    }
});

// Валидация файла
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

// Change file button
changeBtn.addEventListener('click', () => {
    fileInput.value = '';
    fileInput.click();
});

// Submit file button
submitBtn.addEventListener('click', async function() {
    if (!currentState.photo) {
        alert('Пожалуйста, выберите фото для загрузки.');
        return;
    }

    // Показываем состояние загрузки
    const originalText = this.innerHTML;
    this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Обработка...';
    this.disabled = true;
    changeBtn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('image', currentState.file);
        
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

        // Сохраняем весь объект ответа, а не только recipes
        currentState.recipesResponse = data;
        
        // Передаем весь объект ответа в displayRecipes
        // displayRecipes(data);
        showMockRecipes();
        
        saveState();
        
    } catch (error) {
        console.error('Ошибка при отправке:', error);
        alert(`Ошибка при обработке фото: ${error.message}`);
    } finally {
        this.innerHTML = originalText;
        this.disabled = false;
        changeBtn.disabled = false;
    }
});

// Save state to sessionStorage
function saveState() {
    const stateToSave = {
        photo: currentState.photo,
        recipes: currentState.recipes,
        timestamp: new Date().getTime()
    };
    sessionStorage.setItem('recipeSearchState', JSON.stringify(stateToSave));
}

// Load state from sessionStorage
function loadState() {
    const savedState = sessionStorage.getItem('recipeSearchState');
    if (savedState) {
        const state = JSON.parse(savedState);
        
        // Check if state is not older than 1 hour
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

// Check for back navigation
window.addEventListener('pageshow', function(event) {
    if (event.persisted || performance.getEntriesByType("navigation")[0].type === 'back_forward') {
        loadState();
    }
});

// Initial load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're returning from a recipe page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('from') && urlParams.get('from') === 'recipe') {
        loadState();
    }
    
    // For testing only - remove in production
    // simulateFileProcessing().then(recipes => displayRecipes(recipes));
});

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

// Функция для генерации страницы рецепта
async function generateRecipePage(recipeData) {
    try {
        // Сохраняем рецепт в localStorage
        localStorage.setItem('currentRecipe', JSON.stringify(recipeData));

        // Перенаправляем пользователя на страницу рецепта
        window.location.href = `recipe.html?id=${recipeData.id}`;
    } catch (error) {
        console.error('Ошибка генерации страницы рецепта:', error);
        throw error;
    }
}

// Функция для отображения тестовых рецептов (заглушка)
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

function displayRecipes(response) {
    if (!recipesContainer) return;

    recipesContainer.innerHTML = '';

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

    response.recipes.forEach(recipe => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';

        const card = document.createElement('div');
        card.className = 'card h-100 shadow-sm';
        card.style.cursor = 'pointer';
        card.onclick = () => generateRecipePage(recipe);

        const imgHtml = recipe.image
            ? `<img src="${recipe.image}" class="card-img-top" alt="${recipe.name}" style="height: 200px; object-fit: cover;">`
            : `<div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 200px;">
                  <i class="bi bi-image text-muted" style="font-size: 3rem;"></i>
               </div>`;

        const ingredientsList = recipe.ingredients.slice(0, 3).map(ing =>
            `<span class="badge bg-secondary me-1 mb-1">${ing}</span>`
        ).join('');

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

    recipesSection.style.display = 'block';
}
