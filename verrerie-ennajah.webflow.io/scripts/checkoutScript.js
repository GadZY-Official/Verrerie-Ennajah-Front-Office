(function() {
    const api = 'https://ademtebourbi.github.io/VerrerieEnnajah-Data';
    const CART_KEY = 'cart';
    const DELIVERY_FEE = 8.000; // Delivery fee in DT
    const FORMSUBMIT_EMAIL = 'ste.verrerie.ennajahe@gmail.com';

    // Fallback Tunisian governorates
    const fallbackTunisiaGovernorates = [
        'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte',
        'Béja', 'Jendouba', 'Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia',
        'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès', 'Medenine',
        'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'
    ];

    // Fallback Tunisian cities by governorate
    const fallbackTunisiaCitiesByGovernorate = {
        'Tunis': ['Tunis', 'La Marsa', 'Carthage', 'Sidi Bou Said', 'Le Kram'],
        'Ariana': ['Ariana', 'Raoued', 'Sidi Thabet', 'La Soukra'],
        'Ben Arous': ['Ben Arous', 'Hammam Lif', 'Mourouj', 'Ezzahra'],
        'Manouba': ['Manouba', 'Den Den', 'Douar Hicher', 'Oued Ellil'],
        'Nabeul': ['Nabeul', 'Hammamet', 'Dar Chaabane', 'Kelibia'],
        'Zaghouan': ['Zaghouan', 'El Fahs', 'Bir Mcherga'],
        'Bizerte': ['Bizerte', 'Menzel Bourguiba', 'Ras Jebel', 'Ghar El Melh'],
        'Béja': ['Béja', 'Testour', 'Nefza', 'Teboursouk'],
        'Jendouba': ['Jendouba', 'Ain Draham', 'Fernana', 'Tabarka'],
        'Kef': ['Kef', 'Dahmani', 'Sakiet Sidi Youssef', 'Nebeur'],
        'Siliana': ['Siliana', 'Makthar', 'Gaafour', 'Bou Arada'],
        'Sousse': ['Sousse', 'Hammam Sousse', 'Akouda', 'Msaken'],
        'Monastir': ['Monastir', 'Skanes', 'Ksar Hellal', 'Jemmal'],
        'Mahdia': ['Mahdia', 'Chebba', 'El Jem', 'Rejiche'],
        'Sfax': ['Sfax', 'Sakiet Ezzit', 'Thyna', 'Gremda'],
        'Kairouan': ['Kairouan', 'Haffouz', 'Sbikha', 'Oueslatia'],
        'Kasserine': ['Kasserine', 'Sbeitla', 'Feriana', 'Thala'],
        'Sidi Bouzid': ['Sidi Bouzid', 'Menzel Bouzaiane', 'Regueb', 'Mezzouna'],
        'Gabès': ['Gabès', 'Matmata', 'El Hamma', 'Mareth'],
        'Medenine': ['Medenine', 'Zarzis', 'Ben Gardane', 'Djerba'],
        'Tataouine': ['Tataouine', 'Remada', 'Bir Lahmar', 'Ghomrassen'],
        'Gafsa': ['Gafsa', 'Metlaoui', 'Redeyef', 'El Ksar'],
        'Tozeur': ['Tozeur', 'Degache', 'Nefta', 'Tamerza'],
        'Kebili': ['Kebili', 'Douz', 'Souk Lahad', 'El Golâa']
    };

    // URLs for fetching governorates and cities
    const statesUrl = 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/states.json';
    const citiesUrl = 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/cities.json';

    // Fetch governorates and cities from GitHub
    async function fetchTunisiaData() {
        try {
            // Fetch states (governorates)
            const statesResponse = await fetch(statesUrl);
            if (!statesResponse.ok) {
                throw new Error(`HTTP error fetching states! Status: ${statesResponse.status}`);
            }
            const states = await statesResponse.json();
            const tunisiaGovernorates = states
                .filter(state => state.country_code === 'TN')
                .map(state => state.name)
                .sort();

            // Fetch cities
            const citiesResponse = await fetch(citiesUrl);
            if (!citiesResponse.ok) {
                throw new Error(`HTTP error fetching cities! Status: ${citiesResponse.status}`);
            }
            const cities = await citiesResponse.json();

            // Map cities to governorates
            const tunisiaCitiesByGovernorate = {};
            tunisiaGovernorates.forEach(gov => {
                tunisiaCitiesByGovernorate[gov] = cities
                    .filter(city => city.country_code === 'TN' && city.state_name === gov)
                    .map(city => city.name)
                    .sort();
            });

            return { tunisiaGovernorates, tunisiaCitiesByGovernorate };
        } catch (error) {
            console.warn('Error fetching Tunisia data from GitHub:', error.message);
            return {
                tunisiaGovernorates: fallbackTunisiaGovernorates,
                tunisiaCitiesByGovernorate: fallbackTunisiaCitiesByGovernorate
            };
        }
    }

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
                defaultDimensions: product.defaultDimensions || [],
                availableZ: product.availableZ || [],
                category: product.category || ''
            } : null;
        } catch (error) {
            console.error('Error fetching product details:', error.message);
            return null;
        }
    }

    // Check if item dimensions exist in defaultDimensions
    function areDimensionsValid(itemDimensions, defaultDimensions) {
        if (!defaultDimensions || defaultDimensions.length === 0) {
            return false; // No default dimensions, treat as invalid (custom)
        }
        return defaultDimensions.some(defaultDim =>
            defaultDim.x === itemDimensions.x &&
            defaultDim.y === itemDimensions.y &&
            (defaultDim.z === itemDimensions.z || (!defaultDim.z && !itemDimensions.z))
        );
    }

    // Populate Tunisian governorates in select elements
    async function populateGovernorates(tunisiaGovernorates) {
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

    // Populate cities based on selected governorate
    async function populateCities(selectId, citySelectId, tunisiaCitiesByGovernorate) {
        const governorateSelect = document.getElementById(selectId);
        const citySelect = document.getElementById(citySelectId);
        if (!governorateSelect || !citySelect) {
            console.warn(`Governorate select (${selectId}) or city select (${citySelectId}) not found`);
            return;
        }

        function updateCities() {
            const governorate = governorateSelect.value;
            citySelect.innerHTML = '<option value="">Sélectionner une ville</option>';
            if (governorate && tunisiaCitiesByGovernorate[governorate]) {
                citySelect.innerHTML += tunisiaCitiesByGovernorate[governorate]
                    .map(city => `<option value="${city}">${city}</option>`).join('');
            }
        }

        updateCities();
        governorateSelect.addEventListener('change', updateCities);
    }

    // Update delivery form visibility and requirements
    async function updateDeliveryForm() {
        const livraisonCheckbox = document.getElementById('livraison');
        const retraitCheckbox = document.getElementById('retrait');
        const livForm = document.getElementById('liv_form');
        const deliveryMode = document.getElementById('deliveryMode');
        const livraisonCont = document.getElementById('livraison_cont');
        if (!livraisonCheckbox || !retraitCheckbox || !livForm || !deliveryMode || !livraisonCont) {
            console.warn('Livraison checkbox, retrait checkbox, liv_form, deliveryMode, or livraison_cont not found');
            return;
        }

        // Check if any product has category "verre"
        const cart = getCartFromStorage();
        let hasVerre = false;
        for (const item of cart) {
            const productDetails = await fetchProductDetails(item.productId);
            if (productDetails && productDetails.category.toLowerCase() === 'verre') {
                hasVerre = true;
                break;
            }
        }

        // Disable livraison and check retrait if any product is "verre"
        if (hasVerre) {
            livraisonCheckbox.disabled = true;
            livraisonCheckbox.checked = false;
            retraitCheckbox.checked = true;
            livraisonCont.style.display = 'none';
        } else {
            livraisonCheckbox.disabled = false;
            livraisonCont.style.display = 'flex';
        }

        const isLivraison = livraisonCheckbox.checked;
        livForm.style.display = isLivraison ? 'block' : 'none';
        deliveryMode.style.display = isLivraison ? 'block' : 'none';
        const inputs = livForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.id !== "pays_liv") {
                input.disabled = !isLivraison;
                input.required = isLivraison;
            }
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

    // Show error message and scroll to top
    function showError(message) {
        const errorDiv = document.querySelector('.div-block-2');
        if (errorDiv) {
            errorDiv.style.display = 'flex';
            const errorText = errorDiv.querySelector('.text-block-54');
            if (errorText) {
                errorText.textContent = message || 'Erreur';
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            console.warn('Error div (.div-block-2) not found');
        }
    }

    // Hide error message
    function hideError() {
        const errorDiv = document.querySelector('.div-block-2');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    // Send email via FormSubmit
    async function sendEmailViaFormSubmit(formData) {
        try {
            // Create HTML content for the email
            let emailContent = `
                <h2>Nouvelle Commande</h2>
                <h3>Informations Client</h3>
                <table border="1" style="border-collapse: collapse; width: 100%;">
                    <tr><th>Nom</th><td>${formData.basicInfo.name || 'N/A'}</td></tr>
                    <tr><th>E-mail</th><td>${formData.basicInfo.email || 'N/A'}</td></tr>
                    <tr><th>Téléphone</th><td>${formData.basicInfo.phone || 'N/A'}</td></tr>
                    ${formData.basicInfo.nid ? `<tr><th>Numéro de carte d'identité</th><td>${formData.basicInfo.nid}</td></tr>` : ''}
                    <tr><th>Adresse</th><td>${formData.basicInfo.address_country || 'N/A'}, ${formData.basicInfo.address_state || 'N/A'}, ${formData.basicInfo.address_zip || 'N/A'}</td></tr>
                </table>
                <h3>Mode de Livraison</h3>
                <p>${formData.getMethod.livraison ? 'Livraison' : 'Retrait en magasin'}</p>
            `;

            if (formData.getMethod.livraison && formData.livraisonInfo) {
                emailContent += `
                    <h3>Adresse de Livraison</h3>
                    <table border="1" style="border-collapse: collapse; width: 100%;">
                        <tr><th>Adresse</th><td>${formData.livraisonInfo.address_line1 || 'N/A'}</td></tr>
                        <tr><th>Gouvernorat</th><td>${formData.livraisonInfo.address_country || 'N/A'}</td></tr>
                        <tr><th>Ville</th><td>${formData.livraisonInfo.address_state || 'N/A'}</td></tr>
                        <tr><th>Code postal</th><td>${formData.livraisonInfo.address_zip || 'N/A'}</td></tr>
                    </table>
                `;
            }

            emailContent += `<h3>Articles</h3><table border="1" style="border-collapse: collapse; width: 100%;">
                <tr><th>Produit</th><th>Dimensions</th><th>Quantité</th><th>Prix Total</th></tr>`;

            for (const item of formData.cart) {
                const productDetails = await fetchProductDetails(item.productId);
                const name = productDetails ? productDetails.name : 'Unknown Product';
                const zDimension = item.dimensions.z ? `×${item.dimensions.z}mm` : '';
                const itemTotal = item.dimensions.price * item.qty;
                emailContent += `
                    <tr>
                        <td>${name}</td>
                        <td>${item.dimensions.x}cm×${item.dimensions.y}cm${zDimension}</td>
                        <td>${item.qty}</td>
                        <td>${formatPrice(itemTotal)} DT</td>
                    </tr>
                `;
            }

            emailContent += `</table>
                <h3>Totaux</h3>
                <table border="1" style="border-collapse: collapse; width: 100%;">
                    <tr><th>Total Panier</th><td>${formatPrice(formData.totals.cartTotal)} DT</td></tr>
                    <tr><th>Frais de Livraison</th><td>${formatPrice(formData.totals.deliveryFee)} DT</td></tr>
                    <tr><th>Total Commande</th><td>${formatPrice(formData.totals.total)} DT</td></tr>
                </table>
            `;

            // Create a hidden form for FormSubmit
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `https://formsubmit.co/${FORMSUBMIT_EMAIL}`;
            form.style.display = 'none';

            // Add hidden inputs
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = '_subject';
            input.value = 'Nouvelle Commande - Verrerie Ennajah';
            form.appendChild(input);

            const emailBody = document.createElement('input');
            emailBody.type = 'hidden';
            emailBody.name = 'email_body';
            emailBody.value = emailContent;
            form.appendChild(emailBody);

            // Optional: Add FormSubmit options (e.g., no CAPTCHA)
            const noCaptcha = document.createElement('input');
            noCaptcha.type = 'hidden';
            noCaptcha.name = '_captcha';
            noCaptcha.value = 'false';
            form.appendChild(noCaptcha);

            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);

            return true;
        } catch (error) {
            console.error('Error sending email via FormSubmit:', error.message);
            return false;
        }
    }

    // Validate and collect form data
    async function collectFormData() {
        const basicInfoForm = document.getElementById('basicInfo');
        const getMethodForm = document.getElementById('GetMethod');
        const livForm = document.getElementById('liv_form');
        const livraisonCheckbox = document.getElementById('livraison');
        const data = {};

        // Hide error initially
        hideError();

        // Validate basicInfo form
        if (!basicInfoForm || !basicInfoForm.checkValidity()) {
            showError('Veuillez remplir tous les champs obligatoires dans les informations client.');
            basicInfoForm?.reportValidity();
            return null;
        }
        const formData = new FormData(basicInfoForm);
        data.basicInfo = Object.fromEntries(formData);

        // Validate GetMethod form
        if (!getMethodForm || !getMethodForm.checkValidity()) {
            showError('Veuillez sélectionner un mode de livraison.');
            getMethodForm?.reportValidity();
            return null;
        }
        const formDataGetMethod = new FormData(getMethodForm);
        data.getMethod = Object.fromEntries(formDataGetMethod);
        data.getMethod.retrait = document.getElementById('retrait')?.checked || false;
        data.getMethod.livraison = livraisonCheckbox?.checked || false;

        // Validate liv_form if livraison is selected
        if (livraisonCheckbox?.checked) {
            if (!livForm || !livForm.checkValidity()) {
                showError('Veuillez remplir tous les champs obligatoires dans l\'adresse de livraison.');
                livForm?.reportValidity();
                return null;
            }
            const formDataLiv = new FormData(livForm);
            data.livraisonInfo = Object.fromEntries(formDataLiv);
            if (!data.livraisonInfo.address_country || !data.livraisonInfo.address_state) {
                showError('État/Province et Ville sont obligatoires pour la livraison.');
                return null;
            }
        }

        // Include cart items
        data.cart = getCartFromStorage();
        if (data.cart.length === 0) {
            showError('Votre panier est vide.');
            return null;
        }

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
        // Fetch Tunisia governorates and cities
        const { tunisiaGovernorates, tunisiaCitiesByGovernorate } = await fetchTunisiaData();

        // Set country fields
        const pays = document.getElementById('pays');
        const paysLiv = document.getElementById('pays_liv');
        if (pays) pays.value = 'Tunisie';
        else console.warn('Element with id="pays" not found');
        if (paysLiv) paysLiv.value = 'Tunisie';
        else console.warn('Element with id="pays_liv" not found');

        // Populate governorates and cities
        await populateGovernorates(tunisiaGovernorates);
        await populateCities('etat', 'address_state', tunisiaCitiesByGovernorate);
        await populateCities('etat_liv', 'address_state_liv', tunisiaCitiesByGovernorate);

        // Generate cart items and check dimensions
        await generateCartItemsHTML();

        // Update delivery form and totals
        await updateDeliveryForm();
        await updateTotalPrices();

        // Add event listeners for checkboxes
        const livraisonCheckbox = document.getElementById('livraison');
        const retraitCheckbox = document.getElementById('retrait');
        if (livraisonCheckbox) {
            livraisonCheckbox.addEventListener('change', async () => {
                await updateDeliveryForm();
                await updateTotalPrices();
            });
        }
        if (retraitCheckbox) {
            retraitCheckbox.addEventListener('change', async () => {
                await updateDeliveryForm();
                await updateTotalPrices();
            });
        }

        // Add event listener for submit button
        const submitButton = document.getElementById('passerCommande');
        if (submitButton) {
            submitButton.addEventListener('click', async (e) => {
                e.preventDefault();
                const formData = await collectFormData();
                if (formData) {
                    const emailSent = await sendEmailViaFormSubmit(formData);
                    if (emailSent) {
                        console.log('Form Data:', JSON.stringify(formData, null, 2));
                        hideError();
                        alert('Commande envoyée avec succès ! Un e-mail a été envoyé à l\'administrateur.');
                    } else {
                        showError('Erreur lors de l\'envoi de la commande par e-mail.');
                    }
                }
            });
        } else {
            console.warn('Button with id="passerCommande" not found');
        }
    }

    document.addEventListener('DOMContentLoaded', initialize);
})();