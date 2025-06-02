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

    // Show loading state
    const originalText = this.innerHTML;
    this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Обработка...';
    this.disabled = true;
    changeBtn.disabled = true;

    try {
        // Создаем FormData для отправки
        const formData = new FormData();
        formData.append('image', currentState.file);
        
        // Отправляем на бэкенд
        const response = await fetch('http://localhost:8000/upload', {
            method: 'POST',
            body: formData,
            // headers не нужны - FormData автоматически устанавливает multipart/form-data
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        currentState.recipes = data.recipes || [];
        displayRecipes(currentState.recipes);
        saveState();
        
    } catch (error) {
        console.error('Ошибка при отправке:', error);
        alert(`Ошибка при обработке фото: ${error.message}`);
    } finally {
        this.innerHTML = originalText;
        this.disabled = false;
        changeBtn.disabled = false;
    }

    // try {
    //     const foundRecipes = await simulateFileProcessing(currentState.photo);
    //     currentState.recipes = foundRecipes;
    //     displayRecipes(foundRecipes);
    //     saveState();
    // } catch (error) {
    //     console.error('Error:', error);
    //     alert('Произошла ошибка при обработке фото.');
    // } finally {
    //     this.innerHTML = originalText;
    //     this.disabled = false;
    // }
});

// Display recipes function
function displayRecipes(recipes) {
    recipesContainer.innerHTML = '';
    
    if (recipes.length === 0) {
        recipesContainer.innerHTML = '<div class="col-12 text-center">Рецепты не найдены</div>';
        return;
    }

    recipes.forEach(recipe => {
        const col = document.createElement('div');
        col.className = 'col';
        
        const cardLink = document.createElement('a');
        cardLink.href = `${recipe.url}?from=search`;
        cardLink.className = 'recipe-link text-decoration-none';
        
        const card = document.createElement('div');
        card.className = 'card h-100 recipe-card';
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = recipe.name;
        
        const ingredientsTitle = document.createElement('h6');
        ingredientsTitle.textContent = 'Ингредиенты:';
        ingredientsTitle.className = 'mt-3';
        
        const ingredientsList = document.createElement('ul');
        ingredientsList.className = 'ingredients-list text-start';
        
        recipe.ingredients.slice(0, 5).forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = ingredient;
            ingredientsList.appendChild(li);
        });
        
        if (recipe.ingredients.length > 5) {
            const li = document.createElement('li');
            li.textContent = '...';
            ingredientsList.appendChild(li);
        }
        
        cardBody.appendChild(title);
        cardBody.appendChild(ingredientsTitle);
        cardBody.appendChild(ingredientsList);
        card.appendChild(cardBody);
        cardLink.appendChild(card);
        col.appendChild(cardLink);
        recipesContainer.appendChild(col);
    });
    
    recipesSection.style.display = 'block';
}

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

// Simulate server processing
function simulateFileProcessing(photoData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const foundRecipes = [
                { 
                    name: 'Паста Карбонара', 
                    url: 'recipe1.html',
                    ingredients: [
                        'Спагетти - 400 г',
                        'Гуанчиале - 150 г',
                        'Яичные желтки - 4 шт',
                        'Пармезан - 50 г',
                        'Черный перец',
                        'Соль'
                    ]
                },
                { 
                    name: 'Салат Цезарь', 
                    url: 'recipe2.html',
                    ingredients: [
                        'Куриное филе - 300 г',
                        'Листья салата',
                        'Пармезан',
                        'Сухарики',
                        'Соус Цезарь'
                    ]
                },
                { 
                    name: 'Тирамису', 
                    url: 'recipe3.html',
                    ingredients: [
                        'Печенье Савоярди - 200 г',
                        'Сыр маскарпоне - 500 г',
                        'Яйца - 4 шт',
                        'Сахар - 100 г',
                        'Кофе эспрессо - 200 мл',
                        'Какао-порошок',
                        'Ликер Амаретто'
                    ]
                }
            ];
            resolve(foundRecipes);
        }, 1500);
    });
}
