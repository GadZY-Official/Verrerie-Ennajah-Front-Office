(function () {
    const api = 'https://ademtebourbi.github.io/VerrerieEnnajah-Data';
    const productsContainer = document.getElementById('productsContainer');
    const categoryName = document.getElementById('categoryName');

    // Main category buttons
    const buttons = {
        all: document.getElementById('allCat'),
        verre: document.getElementById('verreCat'),
        miroirs: document.getElementById('miroirsCat'),
        cadres: document.getElementById('cadresCat')
    };

    // Verre subcategory buttons
    const verreSubCats = {
        all: document.getElementById('toutVerreCat'),
        simple: document.getElementById('vitrageSimpleCat'),
        double: document.getElementById('vitrageDoubleCat'),
        feuillete: document.getElementById('feuilletéCat'),
        trempe: document.getElementById('verreTrempéCat'),
        peinture: document.getElementById('peintureSurVerreCat'),
        aquarium: document.getElementById('aquariumCat')
    };

    const verreSubCatsContainer = document.getElementById('verre-subcats');
    let products = [];

    function formatPrice(price) {
        const parts = price.toFixed(3).split('.');
        return `${parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}.${parts[1]}`;
    }

    function setActiveButton(activeButton) {
        Object.values(buttons).forEach(btn => btn.classList.remove('w--current'));
        if (activeButton) activeButton.classList.add('w--current');
    }

    function setActiveSubCat(subCatButton) {
        if (!subCatButton) return;
        Object.values(verreSubCats).forEach(btn => btn.classList.remove('w--current'));
        subCatButton.classList.add('w--current');
    }

    function renderProducts(categoryFilter, activeButton, displayName, subCategory = null, subCatButton = null) {
        setActiveButton(activeButton);
        categoryName.textContent = displayName;

        if (categoryFilter === 'Verre') {
            verreSubCatsContainer.classList.add('visible');
            setActiveSubCat(subCatButton || verreSubCats.all);
        } else {
            verreSubCatsContainer.classList.remove('visible');
        }

        productsContainer.innerHTML = '';
        let filtered = products;

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(p => p.category === categoryFilter);
        }

        if (subCategory) {
            filtered = filtered.filter(p => p.subCategory === subCategory);
        }

        if (filtered.length === 0) {
            productsContainer.innerHTML = '<div>Aucun produit trouvé.</div>';
            return;
        }

        filtered.forEach(product => {
            const d = product.defaultDimensions[0];
            const z = d.z ? `×${d.z}mm` : '';
            const price = formatPrice(d.price);

            const html = `
                <div role="listitem" class="product-card-wrapper w-dyn-item">
                    <a href="product.html?id=${product.id}" class="product-card w-inline-block">
                        <div class="product-card-image-wrapper">
                            <img src="${product.images[0]}" alt="${product.name}" sizes="100vw">
                        </div>
                        <h6 class="product-card-heading">${product.name}</h6>
                        <div class="text-block-4">${d.x}cm×${d.y}cm${z}</div>
                        <div class="product-card-price">${price} DT</div>
                    </a>
                </div>
            `;
            productsContainer.insertAdjacentHTML('beforeend', html);
        });
    }

    async function initialize() {
        const loader = document.getElementById('loader');
        const mainContent = document.getElementById('mainContent');

        try {
            const response = await fetch(`${api}/products.json`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            products = await response.json();

            // Read query params: support main,sub using comma or dot
            const urlParams = new URLSearchParams(window.location.search);
            let catParam = urlParams.get('cat')?.toLowerCase() || 'all';
            let mainCategory = 'all';
            let subCategory = null;

            if (catParam.includes(',') || catParam.includes('.')) {
                const separator = catParam.includes(',') ? ',' : '.';
                const parts = catParam.split(separator).map(p => p.trim());
                mainCategory = parts[0];
                subCategory = parts[1] || null;
            } else {
                mainCategory = catParam;
            }

            switch (mainCategory) {
                case 'verre':
                    renderProducts(
                        'Verre',
                        buttons.verre,
                        subCategory ? `Verre: ${subCategory}` : 'Verre',
                        subCategory || null,
                        subCategory ? verreSubCats[subCategory.toLowerCase()] : verreSubCats.all
                    );
                    break;
                case 'miroirs':
                    renderProducts('Miroirs', buttons.miroirs, 'Miroirs');
                    break;
                case 'cadres':
                    renderProducts('Cadres', buttons.cadres, 'Cadres');
                    break;
                default:
                    renderProducts('all', buttons.all, 'Tous les produits');
            }

            // Main category listeners
            buttons.all.addEventListener('click', () => renderProducts('all', buttons.all, 'Tous les produits'));
            buttons.verre.addEventListener('click', () => renderProducts('Verre', buttons.verre, 'Verre'));
            buttons.miroirs.addEventListener('click', () => renderProducts('Miroirs', buttons.miroirs, 'Miroirs'));
            buttons.cadres.addEventListener('click', () => renderProducts('Cadres', buttons.cadres, 'Cadres'));

            // Verre subcategory listeners
            Object.entries(verreSubCats).forEach(([key, btn]) => {
                btn.addEventListener('click', () => {
                    renderProducts('Verre', buttons.verre, key === 'all' ? 'Verre' : `Verre: ${btn.textContent}`, key === 'all' ? null : capitalize(key), btn);
                });
            });

        } catch (err) {
            console.error('Error fetching products:', err);
            if (loader) loader.style.display = 'none';
            if (mainContent) mainContent.style.display = 'block';
            productsContainer.innerHTML = '<div>Erreur lors du chargement des produits.</div>';
        } finally {
            if (loader) loader.style.display = 'none';
            if (mainContent) mainContent.style.display = 'block';
        }
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    document.addEventListener('DOMContentLoaded', initialize);
})();
