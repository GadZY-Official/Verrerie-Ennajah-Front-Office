(function() {
    const api = 'https://ademtebourbi.github.io/VerrerieEnnajah-Data';
    const CART_KEY = 'cart';
    const DELIVERY_FEE = 8.000; // Delivery fee in DT

    // Tunisian governorates
    const tunisiaGovernorates = [
        'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte',
        'Béja', 'Jendouba', 'Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia',
        'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès', 'Medenine',
        'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'
    ];

    // Utility function to get cart from localStorage
    function getCartFromStorage() {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    }

    // Function to format price with space every 3 digits and 3 decimal places
    function formatPrice(price) {
        const priceParts = price.toFixed(3).split('.');
        return `${priceParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}.${priceParts[1]}`;
    }

    // Fetch product details from products.json
    async function fetchProductDetails(productId) {
        try {
            const response = await fetch(`${api}/products.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const products = await response.json();
            if (!Array.isArray(products)) {
                throw new Error('Invalid data format: Expected an array of products');
            }
            const product = products.find(p => p.id === productId);
            return product ? { 
                name: product.name, 
                image: product.images[0] || '', 
                defaultDimensions: product.defaultDimensions || []
            } : null;
        } catch (error) {
            console.error('Error fetching product details:', error.message);
            return null;
        }
    }

    // Check if item dimensions exist in defaultDimensions
    function areDimensionsValid(itemDimensions, defaultDimensions) {
        return defaultDimensions.some(defaultDim => 
            defaultDim.x === itemDimensions.x &&
            defaultDim.y === itemDimensions.y &&
            (defaultDim.z === itemDimensions.z || (!defaultDim.z && !itemDimensions.z))
        );
    }

    // Populate Tunisian governorates in select elements
    function populateGovernorates() {
        const selects = [document.getElementById('etat'), document.getElementById('etat_liv')];
        selects.forEach(select => {
            if (select) {
                select.innerHTML = '<option value="">Sélectionner un gouvernorat</option>' + 
                    tunisiaGovernorates.map(gov => `<option value="${gov}">${gov}</option>`).join('');
            } else {
                console.warn(`Select element with id="${select?.id}" not found`);
            }
        });
    }

    // Update delivery form visibility and requirements
    function updateDeliveryForm() {
        const livraisonCheckbox = document.getElementById('livraison');
        const livForm = document.getElementById('liv_form');
        if (!livraisonCheckbox || !livForm) {
            console.warn('Livraison checkbox or liv_form not found');
            return;
        }

        const isLivraison = livraisonCheckbox.checked;
        livForm.style.display = isLivraison ? 'block' : 'none';
        const inputs = livForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.required = isLivraison;
        });
    }

    // Update total prices
    async function updateTotalPrices() {
        const cart = getCartFromStorage();
        let cartTotal = 0;
        cart.forEach(item => {
            cartTotal += item.dimensions.price * item.qty;
        });

        const livraisonCheckbox = document.getElementById('livraison');
        const totalPrice = livraisonCheckbox && livraisonCheckbox.checked ? cartTotal + DELIVERY_FEE : cartTotal;

        const priceCartTotal = document.getElementById('priceCartTotal');
        const priceCommandeTotal = document.getElementById('priceCommandeTotal');
        if (priceCartTotal) {
            priceCartTotal.textContent = formatPrice(cartTotal) + ' DT';
        } else {
            console.warn('Element with id="priceCartTotal" not found');
        }
        if (priceCommandeTotal) {
            priceCommandeTotal.textContent = formatPrice(totalPrice) + ' DT';
        } else {
            console.warn('Element with id="priceCommandeTotal" not found');
        }
    }

    // Generate cart items HTML for checkout
    async function generateCartItemsHTML() {
        const cart = getCartFromStorage();
        const cartList = document.getElementById('cartList');
        if (!cartList) {
            console.error('Element with id="cartList" not found');
            return;
        }

        if (cart.length === 0) {
            cartList.innerHTML = '<div>No items found in cart.</div>';
            return;
        }

        let hasInvalidDimensions = false;
        const itemsHTML = await Promise.all(cart.map(async item => {
            const productDetails = await fetchProductDetails(item.productId);
            const name = productDetails ? productDetails.name : 'Unknown Product';
            const image = productDetails ? productDetails.image : '';
            const zDimension = item.dimensions.z ? `×${item.dimensions.z}mm` : '';
            const itemTotal = item.dimensions.price * item.qty;

            // Check dimensions validity
            if (productDetails && !areDimensionsValid(item.dimensions, productDetails.defaultDimensions)) {
                hasInvalidDimensions = true;
            }

            return `
                <div role="listitem" class="w-commerce-commercecheckoutorderitem">
                    <img src="${image}" alt="${name}" class="w-commerce-commercecartitemimage image" />
                    <div class="w-commerce-commercecheckoutorderitemdescriptionwrapper">
                        <div class="w-commerce-commerceboldtextblock text-block-12">${name}</div>
                        <div class="text-block-4">${item.dimensions.x}cm×${item.dimensions.y}cm${zDimension}</div>
                        <div class="w-commerce-commercecheckoutorderitemquantitywrapper">
                            <div class="text-block-8">Quantité : </div>
                            <div class="text-block-9">${item.qty}</div>
                        </div>
                    </div>
                    <div class="text-block-11">${formatPrice(itemTotal)} DT</div>
                </div>
            `;
        }));

        cartList.innerHTML = itemsHTML.join('');

        // Update nid_inp and nid_lab visibility
        const nidInput = document.getElementById('nid_inp');
        const nidLabel = document.getElementById('nid_lab');
        if (nidInput && nidLabel) {
            nidInput.style.display = hasInvalidDimensions ? 'block' : 'none';
            nidInput.required = hasInvalidDimensions;
            nidLabel.style.display = hasInvalidDimensions ? 'block' : 'none';
        } else {
            console.warn('NID input or label not found');
        }
    }

    // Validate and collect form data
    function collectFormData() {
        const basicInfoForm = document.getElementById('basicInfo');
        const getMethodForm = document.getElementById('GetMethod');
        const livForm = document.getElementById('liv_form');
        const livraisonCheckbox = document.getElementById('livraison');
        const data = {};

        // Validate basicInfo form
        if (basicInfoForm && basicInfoForm.checkValidity()) {
            const formData = new FormData(basicInfoForm);
            data.basicInfo = Object.fromEntries(formData);
        } else {
            console.warn('Basic info form is invalid or not found');
            return null;
        }

        // Validate GetMethod form
        if (getMethodForm && getMethodForm.checkValidity()) {
            const formData = new FormData(getMethodForm);
            data.getMethod = Object.fromEntries(formData);
            data.getMethod.retrait = document.getElementById('retrait')?.checked || false;
            data.getMethod.livraison = livraisonCheckbox?.checked || false;
        } else {
            console.warn('GetMethod form is invalid or not found');
            return null;
        }

        // Validate liv_form if livraison is selected
        if (livraisonCheckbox?.checked && livForm && livForm.checkValidity()) {
            const formData = new FormData(livForm);
            data.livraisonInfo = Object.fromEntries(formData);
        } else if (livraisonCheckbox?.checked) {
            console.warn('Livraison form is invalid or not found');
            return null;
        }

        // Include cart items
        data.cart = getCartFromStorage();

        // Include totals
        const cartTotal = data.cart.reduce((sum, item) => sum + item.dimensions.price * item.qty, 0);
        data.totals = {
            cartTotal: cartTotal,
            deliveryFee: livraisonCheckbox?.checked ? DELIVERY_FEE : 0,
            total: livraisonCheckbox?.checked ? cartTotal + DELIVERY_FEE : cartTotal
        };

        return data;
    }

    // Initialize on page load
    async function initialize() {
        // Set country fields
        const pays = document.getElementById('pays');
        const paysLiv = document.getElementById('pays_liv');
        if (pays) pays.textContent = 'Tunisie';
        else console.warn('Element with id="pays" not found');
        if (paysLiv) paysLiv.textContent = 'Tunisie';
        else console.warn('Element with id="pays_liv" not found');

        // Populate governorates
        populateGovernorates();

        // Generate cart items and check dimensions
        await generateCartItemsHTML();

        // Update delivery form and totals
        updateDeliveryForm();
        await updateTotalPrices();

        // Add event listeners for checkboxes
        const livraisonCheckbox = document.getElementById('livraison');
        const retraitCheckbox = document.getElementById('retrait');
        if (livraisonCheckbox) {
            livraisonCheckbox.addEventListener('change', () => {
                updateDeliveryForm();
                updateTotalPrices();
            });
        }
        if (retraitCheckbox) {
            retraitCheckbox.addEventListener('change', updateTotalPrices);
        }

        // Add event listener for submit button
        const submitButton = document.getElementById('passerCommande');
        if (submitButton) {
            submitButton.addEventListener('click', (e) => {
                e.preventDefault();
                const formData = collectFormData();
                if (formData) {
                    console.log('Form Data:', JSON.stringify(formData, null, 2));
                } else {
                    console.error('Form validation failed');
                }
            });
        } else {
            console.warn('Button with id="passerCommande" not found');
        }
    }

    document.addEventListener('DOMContentLoaded', initialize);
})();