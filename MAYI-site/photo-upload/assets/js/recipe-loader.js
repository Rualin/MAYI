/**
 * Обработчик события загрузки DOM
 * Загружает и отображает рецепт из localStorage
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Получаем сохраненный рецепт из localStorage
        const recipe = JSON.parse(localStorage.getItem('currentRecipe'));
        
        // Проверяем наличие рецепта
        if (!recipe) {
            throw new Error('Рецепт не найден');
        }

        // Отображаем рецепт на странице
        renderRecipe(recipe);
        
    } catch (error) {
        console.error('Ошибка загрузки рецепта:', error);
        
        // Показываем сообщение об ошибке
        document.getElementById('recipe-content').innerHTML = `
            <div class="alert alert-danger">
                ${error.message || 'Не удалось загрузить рецепт'}
                <a href="/ingredients_page.html" class="alert-link">Вернуться к поиску</a>
            </div>
        `;
    }
});

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
    
    // Генерируем HTML для рецепта
    content.innerHTML = `
        <article class="recipe-article">
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