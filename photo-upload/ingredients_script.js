// Предопределенный список ингредиентов (как будто загружен из TXT файла)
const ingredientsList = `
    соль
    сахар
    вода
    мука
    яйца
    молоко
    масло растительное
    картофель
    фарш свиной
    фарш куриный
    фарш говядина
    хлеб
    перец молотый
    панировочные сухари
    лук репчатый
    сливочное масло
    колбаса
    майонез
    хлопья овсяные
    творог
    манная крупа
    кефир
    сода
    морковь
    чеснок
    свинина
    говядина
    помидоры
    консервы рыбные
    свекла
    специи
    курица 
    курица окорок
    лавровый лист
    сыр твердый
    кукуруза консервированная
    пшено
    укроп
    лук репчатый сладкий
    тимьян
    бульон говяжий
    бульон куриный
    горох
    рис
    перец болгарский
    паприка
    лук зеленый
    филе куриное
    вермишель
    зелень 
    рис пропаренный
    приправа для плова
    томатная паста
    спагетти
    грудинка вареная
    сыр пармезан
    масло оливковое
    соус терияки
    сливки
    сосиски
    мука кукурузная
    разрыхлитель
    капуста 
    уксус
    желтки
    сметана
    сельдерей
    горчица
    колбаса вареная
    зеленый горошек
    соленые огурцы
    капуста квашеная
    макароны
    огурцы
    шоколад
    какао-порошок
    кофе  растворимый
    яблоко
`;

// Загрузка списка ингредиентов при открытии страницы
document.addEventListener('DOMContentLoaded', function() {
// Имитация загрузки с небольшой задержкой
    setTimeout(() => {
        const ingredients = ingredientsList.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        renderIngredients(ingredients);
        document.getElementById('recipeBtn').disabled = false;
    }, 500);
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

    const ingredientsData = {
        selectedIngredients: selectedIngredients,
        timestamp: new Date().toISOString()
    };

    const jsonString = JSON.stringify(ingredientsData, null, 2);
    downloadJSON(jsonString, 'ingredients.json');
});

// Функция скачивания JSON
function downloadJSON(jsonString, filename) {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}