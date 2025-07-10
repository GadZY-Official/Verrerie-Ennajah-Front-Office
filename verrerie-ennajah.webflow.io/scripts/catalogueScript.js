document.addEventListener('DOMContentLoaded', function() {
    const api = 'https://ademtebourbi.github.io/VerrerieEnnajah-Data';
    const productsContainer = document.getElementById('productsContainer');
    const categoryName = document.getElementById('categoryName');
    const allCatButton = document.getElementById('allCat');
    const verreCatButton = document.getElementById('verreCat');
    const miroirsCatButton = document.getElementById('miroirsCat');
    const cadresCatButton = document.getElementById('cadresCat');
    const buttons = [allCatButton, verreCatButton, miroirsCatButton, cadresCatButton];
    let products = [];

    // Map query param values to category and button
    const categoryMap = {
        'all': { filter: 'all', button: allCatButton, displayName: 'Tous les produits' },
        'verre': { filter: 'Verre', button: verreCatButton, displayName: 'Verre' },
        'miroirs': { filter: 'Miroirs', button: miroirsCatButton, displayName: 'Miroirs' },
        'cadres': { filter: 'Cadres', button: cadresCatButton, displayName: 'Cadres' }
    };

    // Get query parameter 'cat'
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('cat')?.toLowerCase();
    const defaultCategory = categoryMap[initialCategory] || categoryMap['all'];

    // Set default "w--current" class and category name
    defaultCategory.button.classList.add('w--current');
    categoryName.textContent = defaultCategory.displayName;

    // Function to format price with space every 3 digits and 3 decimal places
    function formatPrice(price) {
        const priceParts = price.toFixed(3).split('.');
        return `${priceParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}.${priceParts[1]}`;
    }

    // Function to set active button
    function setActiveButton(activeButton) {
        buttons.forEach(button => button.classList.remove('w--current'));
        activeButton.classList.add('w--current');
    }

    // Function to render products based on category filter
    function renderProducts(categoryFilter, activeButton, categoryDisplayName) {
        setActiveButton(activeButton);
        categoryName.textContent = categoryDisplayName; // Update h3 text
        productsContainer.innerHTML = ''; // Clear current products
        const filteredProducts = categoryFilter === 'all' 
            ? products 
            : products.filter(product => product.category === categoryFilter);

        filteredProducts.forEach(product => {
            const dimensions = product.defaultDimensions[0];
            const zDimension = dimensions.z ? `×${dimensions.z}mm` : '';
            const formattedPrice = formatPrice(dimensions.price);

            const productCard = `
                <div role="listitem" class="product-card-wrapper w-dyn-item">
                    <a href="product.html?id=${product.id}" class="product-card w-inline-block">
                        <div class="product-card-image-wrapper">
                            <img src="${product.images[0]}" alt="${product.name}" sizes="100vw">
                        </div>
                        <h6 class="product-card-heading">${product.name}</h6>
                        <div class="text-block-4">${dimensions.x}cm×${dimensions.y}cm${zDimension}</div>
                        <div class="product-card-price">${formattedPrice} DT</div>
                    </a>
                </div>
            `;
            productsContainer.insertAdjacentHTML('beforeend', productCard);
        });
    }

    // Fetch products and set up event listeners
    fetch(`${api}/products.json`)
        .then(response => response.json())
        .then(data => {
            products = data; // Store products
            // Initial render based on query param or default to 'all'
            renderProducts(defaultCategory.filter, defaultCategory.button, defaultCategory.displayName);

            // Event listeners for category buttons
            allCatButton.addEventListener('click', () => renderProducts('all', allCatButton, 'Tous les produits'));
            verreCatButton.addEventListener('click', () => renderProducts('Verre', verreCatButton, 'Verre'));
            miroirsCatButton.addEventListener('click', () => renderProducts('Miroirs', miroirsCatButton, 'Miroirs'));
            cadresCatButton.addEventListener('click', () => renderProducts('Cadres', cadresCatButton, 'Cadres'));
        })
        .catch(error => console.error('Error fetching products:', error));
});