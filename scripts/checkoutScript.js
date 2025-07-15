(function () {
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
        'Tunis': ['Tunis', 'La Marsa', 'Carthage', 'Sidi Bou Said', 'Le Kram', 'Bab Souika', 'Ezzouhour', 'El Menzah', 'El Omrane', 'Djebel Djelloud', 'Sidi Hassine'],
        'Ariana': ['Ariana', 'Ettadhamen', 'Raoued', 'La Soukra', 'Sukrah', 'Mnihla'],
        'Ben Arous': ['Ben Arous', 'Ezzahra', 'Mourouj', 'Hammam Lif', 'Fouchana', 'Hammam Chott', 'Mohamedia', 'Mornag', 'Mégrine'],
        'Manouba': ['Manouba', 'Douar Hicher', 'Den Den', 'Djedeida', 'Mornaguia'],
        'Nabeul': ['Nabeul', 'Hammamet', 'Korba', 'Kelibia', 'Dar Chaabane', 'El Maâmoura', 'El Mida', 'Enfidha', 'Hammam Ghezèze', 'Menzel Bouzelfa', 'Grombalia'],
        'Bizerte': ['Bizerte', 'Menzel Bourguiba', 'Ras Jebel', 'Mateur', 'Menzel Abderrahmane', 'Metline'],
        'Béja': ['Béja', 'Testour', 'Téboursouk', 'Majaz al-Bab'],
        'Jendouba': ['Jendouba', 'Aïn Draham', 'Fernana', 'Tabarka', 'Beni M\'Tir', 'Bou Salem', 'Ghardimaou', 'Fériana'],
        'Kef': ['Kef', 'Dahmani', 'Nebeur', 'Tajerouine'],
        'Siliana': ['Siliana', 'Makthar', 'Gaafour', 'Kesra', 'Bargou', 'Bou Arada'],
        'Sousse': ['Sousse', 'Hammam Sousse', 'Akouda', 'Enfidha', 'Hergla', 'Bouficha', 'M\'saken', 'Kondar', 'Zaouiet Ksibet Thrayet'],
        'Monastir': ['Monastir', 'Skanes', 'Jemmal', 'Ksar Hellal', 'Ksibet el-Médiouni', 'Moknine', 'Amiret El Fhoul', 'Amiret Hajjaj', 'Amiret Touazra'],
        'Mahdia': ['Mahdia', 'Chebba', 'El Jem', 'Essouassi', 'Melloulèche'],
        'Sfax': ['Sfax', 'Sakiet Ezzit', 'Jebiniana', 'Menzel Chaker', 'Chihia', 'Bir Ali Ben Khalifa', 'Agareb'],
        'Kairouan': ['Kairouan', 'Sbikha', 'Haffouz', 'Chebika', 'Bou Hajla', 'Hajeb El Ayoun'],
        'Kasserine': ['Kasserine', 'Sbeitla', 'Fériana', 'Foussana'],
        'Sidi Bouzid': ['Sidi Bouzid', 'Menzel Bouzaiene', 'Regueb', 'Meknassi'],
        'Gabès': ['Gabès', 'Matmata', 'El Hamma', 'Ghannouch', 'Chenini Nahal', 'Mérouna'],
        'Medenine': ['Medenine', 'Djerba Houmt Souk', 'Djerba Midoun', 'Djerba Ajim', 'Ben Gardane', 'Zarzis'],
        'Tataouine': ['Tataouine', 'Bir Lahmar', 'Remada', 'Ghomrassen', 'Dhiba'],
        'Gafsa': ['Gafsa', 'Metlaoui', 'Redeyef', 'Moularès'],
        'Tozeur': ['Tozeur', 'Degache', 'Nefta', 'Tamerza'],
        'Kebili': ['Kebili', 'Douz', 'Souk Lahad', 'El Golâa'],
        'Zaghouan': ['Zaghouan', 'El Fahs', 'Bir Mcherga', 'Nadhour'],
        'Bizerte': ['Bizerte', 'Menzel Bourguiba', 'Ras Jebel', 'Mateur', 'Menzel Abderrahmane', 'Metline']
    };


    // URLs for fetching governorates and cities
    const statesUrl = 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/states.json';
    const citiesUrl = 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/cities.json';
    const loader = document.getElementById('loader');
    const mainContent = document.getElementById('mainContent');

    // Fetch governorates and cities from GitHub
    async function fetchTunisiaData() {
        try {
            const statesResponse = await fetch(statesUrl);
            if (!statesResponse.ok) {
                throw new Error(`HTTP error fetching states! Status: ${statesResponse.status}`);
            }
            const states = await statesResponse.json();
            const tunisiaGovernorates = states
                .filter(state => state.country_code === 'TN')
                .map(state => state.name)
                .sort();

            const citiesResponse = await fetch(citiesUrl);
            if (!citiesResponse.ok) {
                throw new Error(`HTTP error fetching cities! Status: ${citiesResponse.status}`);
            }
            const cities = await citiesResponse.json();

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

    // Function to clear cart without resetting cartList display
    function clearCart() {
        localStorage.removeItem(CART_KEY);
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
            loader.style.display = 'none';
            mainContent.style.display = 'block';
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
            return false;
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

        const cart = getCartFromStorage();
        let hasVerre = false;
        for (const item of cart) {
            const productDetails = await fetchProductDetails(item.productId);
            if (productDetails && productDetails.category.toLowerCase() === 'verre') {
                hasVerre = true;
                break;
            }
        }

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
            cartList.innerHTML = '<div>Aucun article dans le panier.</div>';
            return;
        }

        let hasInvalidDimensions = false;
        const itemsHTML = await Promise.all(cart.map(async item => {
            const productDetails = await fetchProductDetails(item.productId);
            const name = productDetails ? productDetails.name : 'Produit Inconnu';
            const image = productDetails ? productDetails.image : '';
            const zDimension = item.dimensions.z ? `×${item.dimensions.z}mm` : '';
            const itemTotal = item.dimensions.price * item.qty;

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
                errorText.textContent = 'Erreur';
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            console.warn('Error div (.div-block-2) not found, suppressing error display');
        }
    }

    // Hide error message
    function hideError() {
        const errorDiv = document.querySelector('.div-block-2');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    // Send email via FormSubmit using AJAX with French key-value pairs
    async function sendEmailViaFormSubmit(formData) {
        try {
            const emailData = {
                _subject: 'Nouvelle Commande - Verrerie Ennajah',
                _captcha: false,
                'Nom Complet': formData.basicInfo.name || '',
                'E-mail': formData.basicInfo.email || '',
                'Numéro de téléphone': formData.basicInfo.phone || '',
                'Numéro de carte d\'identité': formData.basicInfo.nid || '',
                'Adresse': `${formData.basicInfo.address_country || ''}, ${formData.basicInfo.address_state || ''}, ${formData.basicInfo.address_city || ''}, ${formData.basicInfo.address_zip || ''}`,
                'Mode de livraison': formData.getMethod.livraison ? 'Livraison' : 'Retrait en magasin'
            };

            if (formData.getMethod.livraison && formData.livraisonInfo) {
                emailData['Adresse de livraison'] = formData.livraisonInfo.address_line1 || '';
                emailData['Gouvernorat de livraison'] = formData.livraisonInfo.address_country || '';
                emailData['Ville de livraison'] = formData.livraisonInfo.address_state || '';
                emailData['Code postal de livraison'] = formData.livraisonInfo.address_zip || '';
            }

            let cartItems = '';
            for (const [index, item] of formData.cart.entries()) {
                const productDetails = await fetchProductDetails(item.productId);
                const name = productDetails ? productDetails.name : 'Produit Inconnu';
                const zDimension = item.dimensions.z ? `×${item.dimensions.z}mm` : '';
                const itemTotal = item.dimensions.price * item.qty;
                cartItems += `Article ${index + 1}: ${name}, Dimensions: ${item.dimensions.x}cm×${item.dimensions.y}cm${zDimension}, Quantité: ${item.qty}, Prix Total: ${formatPrice(itemTotal)} DT\n`;
            }
            emailData['Articles'] = cartItems || 'Aucun article';

            emailData['Total Panier'] = `${formatPrice(formData.totals.cartTotal)} DT`;
            emailData['Frais de Livraison'] = `${formatPrice(formData.totals.deliveryFee)} DT`;
            emailData['Total Commande'] = `${formatPrice(formData.totals.total)} DT`;

            const response = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_EMAIL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(emailData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error sending email! Status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success !== 'true') {
                throw new Error('FormSubmit failed to send email');
            }

            return true;
        } catch (error) {
            console.error('Error sending email via FormSubmit:', error.message);
            return false;
        }
    }

    // Update div#cont with commande summary
    function updateSummaryContent(formData) {
        const contDiv = document.getElementById('cont');
        if (!contDiv) {
            console.warn('Element with id="cont" not found');
            return;
        }

        const livraison = formData.getMethod.livraison && formData.livraisonInfo;
        contDiv.innerHTML = `
            <div class="w-commerce-commercecheckoutcustomerinfosummarywrapper order-block">
                <div class="div-block300">
                    <div class="w-layout-hflex flex-block-200">
                        <img src="../cdn.prod.website-files.com/686a5e194dc025de174612e0/68700125ffe9df6f4c774a8f_tick123.png" loading="lazy" alt="" class="image-333">
                        <div class="text-block-54">Votre commande a été effectuée avec succès.</div>
                    </div>
                </div>
                <div class="w-commerce-commercecheckoutsummaryblockheader order-block-header">
                    <h4 class="order-block-heading">Informations client</h4>
                </div>
                <fieldset class="w-commerce-commercecheckoutblockcontent order-block-content">
                    <div class="w-commerce-commercecheckoutrow">
                        <div class="w-commerce-commercecheckoutcolumn">
                            <div class="w-commerce-commercecheckoutsummaryitem">
                                <label class="w-commerce-commercecheckoutsummarylabel field-label-2">Nom complet</label>
                                <div class="text-block-40">${formData.basicInfo.name || ''}</div>
                            </div>
                            <div class="w-commerce-commercecheckoutsummaryitem">
                                <label class="w-commerce-commercecheckoutsummarylabel field-label-3">E-mail</label>
                                <div class="text-block-41">${formData.basicInfo.email || ''}</div>
                            </div>
                            <div class="w-commerce-commercecheckoutsummaryitem">
                                <label class="w-commerce-commercecheckoutsummarylabel field-label-4">Numéro de téléphone</label>
                                <div class="text-block-42">${formData.basicInfo.phone || ''}</div>
                            </div>
                            ${formData.basicInfo.nid ? `<div class="w-commerce-commercecheckoutsummaryitem">
                                <label class="w-commerce-commercecheckoutsummarylabel field-label-5">Numéro de carte d'identité</label>
                                <div class="text-block-43">${formData.basicInfo.nid || ''}</div>
                            </div>` : ''}
                            <div class="w-commerce-commercecheckoutsummaryitem">
                                <label class="w-commerce-commercecheckoutsummarylabel field-label-6">Pays</label>
                                <div class="text-block-39">${formData.basicInfo.pays || 'Tunisie'}</div>
                            </div>
                            <div class="w-commerce-commercecheckoutsummaryitem">
                                <label class="w-commerce-commercecheckoutsummarylabel field-label">État/Province</label>
                                <div class="text-block-38">${formData.basicInfo.address_country || ''}</div>
                            </div>
                            ${formData.basicInfo.address_state ? `<div class="w-commerce-commercecheckoutsummaryitem">
                                <label class="w-commerce-commercecheckoutsummarylabel field-label-7">Ville</label>
                                <div class="text-block-44">${formData.basicInfo.address_state || ''}</div>
                            </div>` : ''}
                            ${formData.basicInfo.address_zip ? `<div class="w-commerce-commercecheckoutsummaryitem">
                                <label class="w-commerce-commercecheckoutsummarylabel field-label-8">Code postal</label>
                                <div class="text-block-45">${formData.basicInfo.address_zip || ''}</div>
                            </div>` : ''}
                        </div>
                        <div class="w-commerce-commercecheckoutcolumn">
                            <div data-wf-bindings="%5B%5D" data-wf-conditions="%7B%22condition%22%3A%7B%22fields%22%3A%7B%22requiresShipping%22%3A%7B%22eq%22%3A%22true%22%2C%22type%22%3A%22Bool%22%7D%7D%7D%2C%22dataPath%22%3A%22database.commerceOrder%22%7D" class="w-commerce-commercecheckoutsummaryitem" style="display: ${livraison ? 'block' : 'none'}">
                                <label class="w-commerce-commercecheckoutsummarylabel field-label-9">Adresse de livraison</label>
                                <div class="text-block-46">${formData.livraisonInfo?.address_line1 || ''}</div>
                                <div class="text-block-47">${formData.livraisonInfo?.address_line2 || ''}</div>
                                <div class="text-block-48">${formData.livraisonInfo?.address_country || ''}</div>
                                <div class="text-block-49">${formData.livraisonInfo?.address_state || ''}</div>
                                <div class="w-commerce-commercecheckoutsummaryflexboxdiv">
                                    <div class="w-commerce-commercecheckoutsummarytextspacingondiv text-block-50">${formData.livraisonInfo?.address_zip || ''}</div>
                                </div>
                                <div class="text-block-51">${formData.livraisonInfo?.pays_liv || 'Tunisie'}</div>
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>
        `;
    }

    // Validate and collect form data
    async function collectFormData() {
        const basicInfoForm = document.getElementById('basicInfo');
        const getMethodForm = document.getElementById('GetMethod');
        const livForm = document.getElementById('liv_form');
        const livraisonCheckbox = document.getElementById('livraison');
        const data = {};

        hideError();

        if (!basicInfoForm || !basicInfoForm.checkValidity()) {
            showError('Veuillez remplir tous les champs obligatoires dans les informations client.');
            basicInfoForm?.reportValidity();
            return null;
        }
        const formData = new FormData(basicInfoForm);
        data.basicInfo = Object.fromEntries(formData);

        if (!getMethodForm || !getMethodForm.checkValidity()) {
            showError('Veuillez sélectionner un mode de livraison.');
            getMethodForm?.reportValidity();
            return null;
        }
        const formDataGetMethod = new FormData(getMethodForm);
        data.getMethod = Object.fromEntries(formDataGetMethod);
        data.getMethod.retrait = document.getElementById('retrait')?.checked || false;
        data.getMethod.livraison = livraisonCheckbox?.checked || false;

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

        data.cart = getCartFromStorage();
        if (data.cart.length === 0) {
            showError('Votre panier est vide.');
            return null;
        }

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
        const { tunisiaGovernorates, tunisiaCitiesByGovernorate } = await fetchTunisiaData();

        const pays = document.getElementById('pays');
        const paysLiv = document.getElementById('pays_liv');
        if (pays) pays.value = 'Tunisie';
        else console.warn('Element with id="pays" not found');
        if (paysLiv) paysLiv.value = 'Tunisie';
        else console.warn('Element with id="pays_liv" not found');

        await populateGovernorates(tunisiaGovernorates);
        await populateCities('etat', 'address_state', tunisiaCitiesByGovernorate);
        await populateCities('etat_liv', 'address_state_liv', tunisiaCitiesByGovernorate);

        await generateCartItemsHTML();
        await updateDeliveryForm();
        await updateTotalPrices();

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

        const submitButton = document.getElementById('passerCommande');
        if (submitButton) {
            const handleSubmit = async (e) => {
                e.preventDefault();
                const formData = await collectFormData();
                if (formData) {
                    const emailSent = await sendEmailViaFormSubmit(formData);
                    if (emailSent) {
                        console.log('Form Data:', JSON.stringify(formData, null, 2));
                        hideError();

                        // Hide forms
                        const forms = [document.getElementById('basicInfo'), document.getElementById('GetMethod'), document.getElementById('liv_form')];
                        forms.forEach(form => {
                            if (form) form.style.display = 'none';
                            else console.warn(`Form ${form?.id} not found`);
                        });

                        // Update summary content
                        updateSummaryContent(formData);

                        // Clear cart
                        clearCart();

                        // Update button text and parent href
                        submitButton.textContent = 'Continuer vos achats';
                        const parentLink = submitButton.closest('a');
                        if (parentLink) {
                            parentLink.href = 'catalogue.html';
                        } else {
                            console.warn('Parent <a> for passerCommande button not found');
                        }

                        // Remove submit event listener to prevent re-triggering
                        submitButton.removeEventListener('click', handleSubmit);
                    } else {
                        showError('Erreur lors de l\'envoi de la commande par e-mail.');
                    }
                }
            };
            submitButton.addEventListener('click', handleSubmit);
        } else {
            console.warn('Button with id="passerCommande" not found');
        }
    }

    document.addEventListener('DOMContentLoaded', initialize);
})();