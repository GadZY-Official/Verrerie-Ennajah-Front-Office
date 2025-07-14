(function () {
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

        if (filteredProducts.length === 0) {
            productsContainer.innerHTML = '<div>Aucun produit trouvé.</div>';
            return;
        }

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

    // Initialize after data fetch
    async function initialize() {
        const loader = document.getElementById('loader');
        const mainContent = document.getElementById('mainContent');

        try {
            const fetcherScript = document.getElementById('fetcher-script');
            const scriptElements = Array.from(document.querySelectorAll('script'));
            const deferredScripts = [];

            // STEP 1: Collect and remove all scripts except this one
            scriptElements.forEach(script => {
                if (script === fetcherScript) return;

                const attrs = {};
                for (const attr of script.attributes) {
                    attrs[attr.name] = attr.value;
                }

                deferredScripts.push({
                    parent: script.parentNode,
                    nextSibling: script.nextSibling,
                    attributes: attrs,
                    content: script.src ? null : script.textContent.trim()
                });

                script.remove();
            });
            const response = await fetch(`${api}/products.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            products = await response.json();

            // STEP 3: Sort - JSON scripts first, then others (both in reverse order)
            const jsonScripts = [];
            const otherScripts = [];

            for (let i = deferredScripts.length - 1; i >= 0; i--) {
                const s = deferredScripts[i];
                const type = s.attributes['type'] || 'text/javascript';
                if (type === 'application/json') jsonScripts.push(s);
                else otherScripts.push(s);
            }

            // STEP 4: Reinsert all scripts with original attributes
            const insertScripts = scriptList => {
                scriptList.forEach(({ parent, nextSibling, attributes, content }) => {
                    const newScript = document.createElement('script');
                    for (const [key, value] of Object.entries(attributes)) {
                        newScript.setAttribute(key, value);
                    }
                    if (content) newScript.textContent = content;
                    if (nextSibling) parent.insertBefore(newScript, nextSibling);
                    else parent.appendChild(newScript);
                });
            };

            insertScripts(jsonScripts);    // JSON scripts first
            insertScripts(otherScripts);   // Then other scripts

            // Hide loader and show main content
            if (loader) loader.style.display = 'none';
            if (mainContent) mainContent.style.display = 'block';

            // Now load deferred scripts
            document.querySelectorAll('script[type="text/fetch-deferred"]:not(.before-fetch)').forEach(script => {
                const newScript = document.createElement('script');
                newScript.src = script.src;
                newScript.type = 'text/javascript';
                document.body.appendChild(newScript);
            });

            // Initial render based on query param or default to 'all'
            renderProducts(defaultCategory.filter, defaultCategory.button, defaultCategory.displayName);

            // Event listeners for category buttons
            allCatButton.addEventListener('click', () => renderProducts('all', allCatButton, 'Tous les produits'));
            verreCatButton.addEventListener('click', () => renderProducts('Verre', verreCatButton, 'Verre'));
            miroirsCatButton.addEventListener('click', () => renderProducts('Miroirs', miroirsCatButton, 'Miroirs'));
            cadresCatButton.addEventListener('click', () => renderProducts('Cadres', cadresCatButton, 'Cadres'));
        } catch (error) {
            console.error('Error fetching products:', error);
            if (loader) loader.style.display = 'none';
            if (mainContent) mainContent.style.display = 'block';
            if (productsContainer) {
                productsContainer.innerHTML = '<div>Erreur lors du chargement des produits.</div>';
            }
        }
    }

    // Start initialization on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initialize);
})();