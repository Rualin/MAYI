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
document.getElementById('recipeBtn').addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('#ingredientsContainer .form-check-input:checked');
    const selectedIngredients = Array.from(checkboxes).map(checkbox => checkbox.value);

    if (selectedIngredients.length === 0) {
        alert('Пожалуйста, выберите хотя бы один ингредиент');
        return;
    }

    // Временная заглушка для демонстрации
    
    
    // код отправки на сервер
    const ingredientsData = {
        selectedIngredients: selectedIngredients,
        timestamp: new Date().toISOString()
    };

    const serverUrl = 'http://localhost:3000/api/submit';
    
    fetch(serverUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ingredientsData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка сервера');
        }
        return response.json();
    })
    .then(data => {
        console.log('Успешно отправлено:', data);
        alert('Ваши ингредиенты успешно отправлены!');
        // displayRecipes(data.recipes); // Предполагаем, что сервер возвращает рецепты
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке данных');
    });

    showMockRecipes(selectedIngredients);
});

// Функция для отображения тестовых рецептов (заглушка)
function showMockRecipes(selectedIngredients) {
    const mockRecipes = [
        {
            name: "Салат из помидоров и огурцов",
            url: "recipe1.html",
            ingredients: ["помидоры", "огурцы", "лук", "масло оливковое", "соль"]
        },
        {
            name: "Омлет с овощами",
            url: "recipe2.html",
            ingredients: ["яйца", "помидоры", "лук", "перец болгарский", "соль", "масло растительное"]
        },
        {
            name: "Овощной суп",
            url: "recipe3.html",
            ingredients: ["картофель", "морковь", "лук", "капуста", "помидоры", "зелень", "соль"]
        }
    ];

    displayRecipes(mockRecipes);
}

// Функция отображения рецептов
function displayRecipes(recipes) {
    const recipesContainer = document.getElementById('recipesContainer');
    const recipesSection = document.getElementById('recipesSection');
    
    recipesContainer.innerHTML = '';
    
    if (recipes.length === 0) {
        recipesContainer.innerHTML = '<div class="col-12 text-center">Рецепты не найдены</div>';
        recipesSection.style.display = 'block';
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