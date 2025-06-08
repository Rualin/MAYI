document.addEventListener('DOMContentLoaded', () => {
    try {
        // Получаем рецепт из localStorage
        const recipe = JSON.parse(localStorage.getItem('currentRecipe'));
        
        if (!recipe) {
            throw new Error('Рецепт не найден');
        }

        // Отображаем рецепт
        renderRecipe(recipe);
        
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('recipe-content').innerHTML = `
            <div class="alert alert-danger">
                ${error.message || 'Не удалось загрузить рецепт'}
                <a href="/ingredients_page.html" class="alert-link">Вернуться к поиску</a>
            </div>
        `;
    }
});

function renderRecipe(recipe) {
    const content = document.getElementById('recipe-content');
    
    // Генерируем HTML для рецепта
    content.innerHTML = `
        <article class="recipe-article">
            <h1 class="mb-4">${recipe.name}</h1>
            
            ${recipe.image ? `
                <div class="recipe-image mb-4">
                    <img src="${recipe.image}" alt="${recipe.name}" class="img-fluid rounded shadow">
                </div>
            ` : ''}
            
            <section class="ingredients-section mb-5">
                <h2 class="h4 mb-3">Ингредиенты</h2>
                <ul class="list-unstyled">
                    ${recipe.ingredients.map(i => `<li class="py-1">${i}</li>`).join('')}
                </ul>
            </section>
            
            <section class="instructions-section">
                <h2 class="h4 mb-3">Способ приготовления</h2>
                <div class="steps-container">
                    ${recipe.receipt.split('\n').map(step => 
                        step.trim() ? `<p class="py-1">${step}</p>` : ''
                    ).join('')}
                </div>
            </section>
        </article>
    `;
}