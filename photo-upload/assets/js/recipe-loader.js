/**
 * Обработчик события загрузки DOM
 * Загружает и отображает рецепт из localStorage
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Получаем сохраненный рецепт из localStorage
        const recipe = JSON.parse(localStorage.getItem('currentRecipe'));
        
        // Если рецепта нет в localStorage, используем моковый рецепт для тестирования
        const recipeToRender = recipe;
        
        // Отображаем рецепт на странице
        renderRecipe(recipeToRender);
        
    } catch (error) {
        console.error('Ошибка загрузки рецепта:', error);
        
        // Показываем сообщение об ошибке (текст по умолчанию слева)
        document.getElementById('recipe-content').innerHTML = `
            <div class="alert alert-danger text-start">
                ${error.message || 'Не удалось загрузить рецепт'}
                <a href="/ingredients_page.html" class="alert-link">Вернуться к поиску</a>
            </div>
        `;
    }
});

/**
 * Возвращает моковый рецепт для тестирования
 */
function getMockRecipe() {
    return {
        name: "Спагетти Карбонара",
        image: "https://example.com/pasta.jpg",
        ingredients: [
            "Спагетти - 400 г",
            "Панчетта или бекон - 150 г",
            "Яйца - 3 шт",
            "Пармезан - 50 г",
            "Чеснок - 2 зубчика",
            "Соль, перец по вкусу"
        ],
        receipt: `1. Поставьте воду для спагетти, добавьте соль когда закипит.
        
2. Нарежьте панчетту или бекон небольшими кусочками. Обжарьте на среднем огне до хрустящей корочки.
        
3. В миске взбейте яйца, добавьте тертый пармезан, соль и перец.
        
4. Когда спагетти будут готовы (al dente), сохраните 1/2 стакана воды от варки, затем слейте воду.
        
5. Быстро смешайте горячие спагетти с яичной смесью, добавляя немного воды от варки для создания соуса.
        
6. Добавьте обжаренную панчетту и подавайте сразу же, посыпав дополнительным пармезаном.`
    };
}

/**
 * Рендерит рецепт на странице
 * @param {Object} recipe - Объект рецепта с полями:
 *   - name: название рецепта
 *   - image: URL изображения (опционально)
 *   - ingredients: массив ингредиентов
 *   - receipt: текст рецепта с шагами
 */
function renderRecipe(recipe) {
    const content = document.getElementById('recipe-content');
    
    // Генерируем HTML для рецепта (все элементы выровнены по левому краю)
    content.innerHTML = `
        <article class="recipe-article text-start">
            <!-- Заголовок рецепта -->
            <h1 class="mb-4">${recipe.name}</h1>
            
            <!-- Изображение рецепта (если есть) -->
            ${recipe.image ? `
                <div class="recipe-image mb-4">
                    <img src="${recipe.image}" alt="${recipe.name}" 
                         class="img-fluid rounded shadow">
                </div>
            ` : ''}
            
            <!-- Секция с ингредиентами -->
            <section class="ingredients-section mb-5">
                <h2 class="h4 mb-3">Ингредиенты</h2>
                <ul class="list-unstyled">
                    ${recipe.ingredients.map(i => 
                        `<li class="py-1">${i}</li>`
                    ).join('')}
                </ul>
            </section>
            
            <!-- Секция с инструкциями приготовления -->
            <section class="instructions-section">
                <h2 class="h4 mb-3">Способ приготовления</h2>
                <div class="steps-container">
                    ${recipe.receipt.split('\n')
                        .map(step => step.trim() 
                            ? `<p class="py-1">${step}</p>` 
                            : ''
                        ).join('')}
                </div>
            </section>
        </article>
    `;
}
