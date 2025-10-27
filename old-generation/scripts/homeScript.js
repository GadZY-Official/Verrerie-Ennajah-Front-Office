(function () {
    const api = 'https://ademtebourbi.github.io/VerrerieEnnajah-Data';
    const verreContainer = document.getElementById('verreContainer');
    const miroirsContainer = document.getElementById('miroirsContainer');
    const cadresContainer = document.getElementById('cadresContainer');
    const loader = document.getElementById('loader');
    const mainContent = document.getElementById('mainContent');
    const verreCategory = document.getElementById('verre-cat')
    const miroirsCategory = document.getElementById('miroirs-cat')
    const cadresCategory = document.getElementById('cadres-cat')
    const verreSubCatContainer = document.getElementById('verre-subcat-container');
    const mediaQuery = window.matchMedia('(max-width: 991px)');

    function handleMediaChange(e) {
        const container1 = document.getElementById('Scroll-Section');
        const container2 = document.getElementById('home-categories');
        if (!verreSubCatContainer || !container1 || !container2) return;

        if (e.matches) {
            // Mobile view → move into home-categories as the second element
            if (container2.children.length >= 1) {
                container2.insertBefore(verreSubCatContainer, container2.children[1]);
            } else {
                container2.appendChild(verreSubCatContainer);
            }
        } else {
            // Desktop view → move back to Scroll-Section at the end
            container1.appendChild(verreSubCatContainer);
        }
    }

    // Run once at start
    handleMediaChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleMediaChange);

    verreCategory.addEventListener('click', () => {
        miroirsCategory.classList.remove('selected')
        cadresCategory.classList.remove('selected')
        verreCategory.classList.add('selected')
        verreSubCatContainer.classList.add('visible')
    })

    miroirsCategory.addEventListener('click', () => {
        verreCategory.classList.remove('selected')
        cadresCategory.classList.remove('selected')
        miroirsCategory.classList.add('selected')
        verreSubCatContainer.classList.remove('visible')
    })

    cadresCategory.addEventListener('click', () => {
        miroirsCategory.classList.remove('selected')
        verreCategory.classList.remove('selected')
        cadresCategory.classList.add('selected')
        verreSubCatContainer.classList.remove('visible')
    })

    // Function to format price with space every 3 digits and 3 decimal places
    function formatPrice(price) {
        const priceParts = price.toFixed(3).split('.');
        return `${priceParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}.${priceParts[1]}`;
    }

    fetch(`${api}/products.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}, StatusText: ${response.statusText}`);
            }
            return response.json();
        })
        .then(products => {
            if (!Array.isArray(products)) {
                throw new Error('Invalid data format: Expected an array of products');
            }

            // Filter up to 4 products per category
            const verreProducts = products.filter(p => p.category === 'Verre').slice(0, 4);
            const miroirsProducts = products.filter(p => p.category === 'Miroirs').slice(0, 4);
            const cadresProducts = products.filter(p => p.category === 'Cadres').slice(0, 4);

            // Function to render products to a container
            function renderProducts(container, products) {
                if (!container) return;
                container.innerHTML = ''; // Clear existing content
                products.forEach(product => {
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
                    container.insertAdjacentHTML('beforeend', productCard);
                });
            }

            // Render products to respective containers
            renderProducts(verreContainer, verreProducts);
            renderProducts(miroirsContainer, miroirsProducts);
            renderProducts(cadresContainer, cadresProducts);
            loader.style.display = 'none';
            mainContent.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching products:', error.message);
            [verreContainer, miroirsContainer, cadresContainer].forEach(container => {
                if (container) {
                    container.innerHTML = '<p>Error loading products: ' + error.message + '</p>';
                }
            });
        });
})();