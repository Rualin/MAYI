
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

    // Данные для отправки
    const ingredientsData = {
        selectedIngredients: selectedIngredients,
        timestamp: new Date().toISOString()
    };

    // URL вашего сервера (замените на реальный)
    const serverUrl = 'http://localhost:3000/api/submit';
    
    // Отправка данных на сервер
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
        // Здесь можно добавить обработку ответа от сервера
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке данных');
    });
});