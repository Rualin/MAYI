// Recipe elements
const recipesSection = document.getElementById('recipes-section');
const recipesContainer = document.getElementById('recipes-container');

// Загрузка списка ингредиентов при открытии страницы
document.addEventListener('DOMContentLoaded', function() {
    // URL RAW-файла на GitHub (замените на ваш реальный URL)
    const githubRawUrl = 'https://raw.githubusercontent.com/Rualin/MAYI/refs/heads/site/photo-upload/ingredients_list.txt';
    
    fetch(githubRawUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Не удалось загрузить список ингредиентов');
            }
            return response.text();
        })
        .then(text => {
            const ingredients = text.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            renderIngredients(ingredients);
            document.getElementById('recipeBtn').disabled = false;
        })
        .catch(error => {
            console.error('Ошибка загрузки:', error);
            alert('Ошибка загрузки списка ингредиентов');
        });
});

// Функция отрисовки чекбоксов
function renderIngredients(ingredients) {
    const container = document.getElementById('ingredientsContainer');
    container.innerHTML = '';

    ingredients.forEach(ingredient => {
        const id = 'ingredient-' + ingredient.replace(/\s+/g, '-').toLowerCase();
        
        const div = document.createElement('div');
        div.className = 'form-check';
        
        div.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${ingredient}" id="${id}">
            <label class="form-check-label" for="${id}">${ingredient}</label>
        `;
        
        container.appendChild(div);
    });
}

// Обработчик кнопки поиска
document.getElementById('recipeBtn').addEventListener('click', async function() {
    const originalText = this.innerHTML;
    this.disabled = true;
    this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Поиск...';

    try {
        const checkboxes = document.querySelectorAll('#ingredientsContainer .form-check-input:checked');
        const selectedIngredients = Array.from(checkboxes).map(checkbox => checkbox.value);

        if (selectedIngredients.length === 0) {
            throw new Error('Пожалуйста, выберите хотя бы один ингредиент');
        }

        const ingredientsData = {
            ingredients: selectedIngredients,
            timestamp: new Date().toISOString()
        };

        const serverUrl = 'http://127.0.0.1:8000/api/submit';
        
        const response = await fetch(serverUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ingredientsData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        // Проверяем успешность и наличие рецептов
        if (!data.success) {
            throw new Error('Не удалось найти рецепты');
        }

        // Передаем весь объект ответа в displayRecipes
        showMockRecipes(data);
        
    } catch (error) {
        console.error('Ошибка при поиске:', error);
        alert(error.message);
    } finally {
        this.innerHTML = originalText;
        this.disabled = false;
    }
});

// Функция для отображения тестовых рецептов (заглушка)
function showMockRecipes(selectedIngredients) {
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

// Функция для загрузки шаблона
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

// Функция для генерации страницы рецепта
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

// Функция отображения рецептов
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