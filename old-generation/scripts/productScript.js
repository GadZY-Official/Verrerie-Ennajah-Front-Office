(async function () {
    const api = 'https://ademtebourbi.github.io/VerrerieEnnajah-Data';
    const elements = {
        productName: document.getElementById('productName'),
        productNameDir: document.getElementById('productNameDir'),
        productImage: document.getElementById('productImage'),
        dimensionPicker: document.getElementById('dimensionPicker'),
        customOptions: document.getElementById('customOptions'),
        zValues: document.getElementById('zValues'),
        desc: document.getElementById('desc'),
        youtubeVideo: document.getElementById('youtubeVideo'),
        youtubeVideoContainer: document.getElementById('youtubeVideoContainer'),
        associatedContent: document.getElementById('associatedContent'),
        price: document.getElementById('price'),
        xInput: document.getElementById('x'),
        yInput: document.getElementById('y'),
        qtyInput: document.getElementById('qty'),
        addToCartBtn: document.getElementById('addToCartBtn'),
        productImages: document.getElementById('productImages'),
        loader: document.getElementById('loader'),
        mainContent: document.getElementById('mainContent')
    };

    // Get query parameter 'id'
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Function to format price with space every 3 digits and 3 decimal places
    function formatPrice(price) {
        if (typeof price !== 'number' || isNaN(price)) return 'Prix invalide';
        const priceParts = price.toFixed(3).split('.');
        return `${priceParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}.${priceParts[1]} DT`;
    }

    // Pricing algorithms for each category/subcategory
    const pricingAlgorithms = {
        // Simple Vitrage and Verre Trempé
        simpleVitrage: (x, y, z, availableZ) => {
            const xmm = x / 100;
            const ymm = y / 100;
            const zData = availableZ.find(item => item.z === z);
            if (!zData) return 'Épaisseur invalide';
            const zPrice = zData.price;

            if (z !== 3) {
                if ((x >= 5 && x < 300 && y >= 5 && y < 200) || (y >= 5 && y < 300 && x >= 5 && x < 200)) {
                    return (xmm + 0.03) * (ymm + 0.03) * zPrice;
                } else if ((x >= 300 && x <= 325 && y >= 200 && y <= 225) || (y >= 300 && y <= 325 && x >= 200 && x <= 225)) {
                    return 3.25 * 2.25 * zPrice;
                } else if (x >= 200 && x <= 225 && y >= 5 && y < 300) {
                    return 2.25 * (ymm + 0.03) * zPrice;
                } else if (y >= 200 && y <= 225 && x >= 5 && x < 300) {
                    return (xmm + 0.03) * 2.25 * zPrice;
                } else if (y >= 300 && y <= 325 && x >= 5 && x < 200) {
                    return 3.25 * (xmm + 0.03) * zPrice;
                } else if (x >= 300 && x <= 325 && y >= 5 && y < 200) {
                    return 3.25 * (ymm + 0.03) * zPrice;
                }
            } else {
                if ((x >= 5 && x < 200 && y >= 5 && y < 150) || (y >= 5 && y < 200 && x >= 5 && x < 150)) {
                    return (xmm + 0.03) * (ymm + 0.03) * zPrice;
                } else if ((x >= 200 && x <= 225 && y >= 150 && y <= 160) || (y >= 200 && y <= 225 && x >= 150 && x <= 160)) {
                    return 2.25 * 1.60 * zPrice;
                } else if (x >= 150 && x <= 160 && y >= 5 && y < 200) {
                    return (ymm + 0.03) * 1.60 * zPrice;
                } else if (y >= 150 && y <= 160 && x >= 5 && x < 200) {
                    return (xmm + 0.03) * 1.60 * zPrice;
                } else if (y >= 200 && y <= 225 && x >= 5 && x < 150) {
                    return 2.25 * (xmm + 0.03) * zPrice;
                } else if (x >= 200 && x <= 225 && y >= 5 && y < 150) {
                    return 2.25 * (ymm + 0.03) * zPrice;
                }
            }
            return 'Dimensions non valides';
        },

        // Peinture sur Verre (same as Simple Vitrage)
        peintureSurVerre: (x, y, z, availableZ) => pricingAlgorithms.simpleVitrage(x, y, z, availableZ),

        // Double Vitrage
        doubleVitrage: (x, y, verre1Type, verre1Z, verre2Type, verre2Z, swiggleThickness, product) => {
            const xmm = x / 100;
            const ymm = y / 100;
            const verre1 = product.availableTypesVerre1.find(v => v.id === verre1Type);
            const verre2 = product.availableTypesVerre2.find(v => v.id === verre2Type);
            const swiggle = product.swiggleThicknesses.find(s => s.thickness === swiggleThickness);

            if (!verre1 || !verre2 || !swiggle) return 'Sélections invalides';
            const verre1Price = verre1.thicknesses.find(t => t.z === verre1Z)?.price;
            const verre2Price = verre2.thicknesses.find(t => t.z === verre2Z)?.price;
            const swigglePrice = swiggle.price;

            if (!verre1Price || !verre2Price) return 'Épaisseurs invalides';

            const prixVerre1 = xmm * ymm * verre1Price;
            const prixVerre2 = xmm * ymm * verre2Price;
            const prixSwiggle = (xmm + ymm) * 2 * swigglePrice;
            return prixVerre1 + prixVerre2 + prixSwiggle;
        },

        // Verre Feuilleté
        verreFeuilleté: (x, y, verre1Type, verre1Z, verre2Type, verre2Z, prixFilm) => {
            const xmm = x / 100;
            const ymm = y / 100;
            const verre1Price = verre1Type.thicknesses.find(t => t.z === verre1Z)?.price;
            const verre2Price = verre2Type.thicknesses.find(t => t.z === verre2Z)?.price;

            if (!verre1Price || !verre2Price) return 'Épaisseurs invalides';

            const prixVerre1 = xmm * ymm * verre1Price;
            const prixVerre2 = xmm * ymm * verre2Price;
            const prixFilme = xmm * ymm * prixFilm;
            return prixVerre1 + prixVerre2 + prixFilme;
        },

        // Aquarium and Miroirs Décoratifs (fixed price)
        fixedPrice: (dimensionIndex, dimensions) => {
            return dimensions[dimensionIndex]?.price || 'Dimension invalide';
        },

        // Miroirs Rétroviseurs
        miroirsRétroviseurs: (x, y, product) => {
            if (product.allowCustom) {
                if (x >= 4 && x <= 12 && y >= 4 && y <= 12) {
                    return product.prixMoto || 'Prix moto non défini';
                } else if (x > 12 && x <= 24 && y >= 8 && y <= 18) {
                    return product.prixVoiture || 'Prix voiture non défini';
                } else if (x > 24 && x <= 36 && y >= 14 && y <= 18) {
                    return product.prixCamion || 'Prix camion non défini';
                }
                return 'Dimensions non valides';
            }
            return pricingAlgorithms.fixedPrice(dimensionIndex, product.dimensions);
        },

        // Cadres
        cadres: (x, y, avecVerre, product) => {
            const xmm = x / 100;
            const ymm = y / 100;
            const km = product.k / 100;
            if (x < 10 || y < 10 || x > 225 || y > 160) return 'Dimensions non valides';

            const prixContreplaqué = xmm * ymm * product.prixContreplaqué;
            const x1 = xmm + (km * 2);
            const y1 = ymm + (km * 2);
            const prixBaguette = (x1 + y1) * 2 * product.prixBaguette;
            const prixVerre = avecVerre ? pricingAlgorithms.simpleVitrage(x, y, 3, [{ z: 3, price: product.prixVerre }]) : 0;

            return typeof prixVerre === 'number' ? prixContreplaqué + prixBaguette + prixVerre : prixVerre;
        }
    };

    // Delay execution
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Handle missing product ID
    if (!productId) {
        Object.assign(elements, {
            productName: 'No product ID provided',
            productNameDir: 'No product ID provided',
            productImages: '{}',
            dimensionPicker: '<option value="">No product ID provided</option>',
            customOptions: { style: { display: 'none' } },
            zValues: '<option value="">No product ID provided</option>',
            desc: 'Aucune description disponible',
            youtubeVideoContainer: { style: { display: 'none' } },
            associatedContent: '',
            price: 'Aucun prix disponible'
        });
        document.dispatchEvent(new Event('productDataReady'));
        return;
    }

    // Collect and defer scripts
    const fetcherScript = document.getElementById('fetcher-script');
    const deferredScripts = Array.from(document.querySelectorAll('script'))
        .filter(script => script !== fetcherScript)
        .map(script => {
            const attrs = {};
            for (const attr of script.attributes) attrs[attr.name] = attr.value;
            const data = { parent: script.parentNode, nextSibling: script.nextSibling, attributes: attrs, content: script.src ? null : script.textContent.trim() };
            script.remove();
            return data;
        });

    try {
        const response = await fetch(`${api}/products.json`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const products = await response.json();

        if (!Array.isArray(products)) throw new Error('Invalid data format: Expected an array of products');
        const product = products.find(p => p.id.toString() == productId);
        console.log(product)
        if (!product) throw new Error('Product not found');

        // Sort scripts
        const jsonScripts = deferredScripts.filter(s => s.attributes['type'] === 'application/json').reverse();
        const otherScripts = deferredScripts.filter(s => s.attributes['type'] !== 'application/json').reverse();

        // Insert scripts
        const insertScripts = async (scriptList) => {
            await delay(500);
            scriptList.forEach(({ parent, nextSibling, attributes, content }) => {
                const newScript = document.createElement('script');
                Object.entries(attributes).forEach(([key, value]) => newScript.setAttribute(key, value));
                if (content) newScript.textContent = content;
                nextSibling ? parent.insertBefore(newScript, nextSibling) : parent.appendChild(newScript);
            });
            await delay(500);
        };

        await insertScripts(jsonScripts);

        // Set product images
        const imageItems = product.images.map(image => ({
            _id: image.imageUrl.split('/').pop().split('.').slice(0, -1).join('.'),
            origFileName: image.imageUrl.split('/').pop(),
            fileName: image.imageUrl.split('/').pop(),
            fileSize: 0,
            height: 1200,
            url: image.imageUrl,
            width: 1200,
            type: "image"
        }));
        elements.productImages.textContent = JSON.stringify({ items: imageItems, group: product.category }, null, 2);

        await insertScripts(otherScripts);
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));

        // Show main content
        elements.loader.style.display = 'none';
        elements.mainContent.style.display = 'block';

        // Set basic product info
        elements.productName.textContent = product.name;
        elements.productNameDir.textContent = product.name;
        elements.desc.innerHTML = product.description || 'Aucune description disponible';
        elements.productImage.srcset = product.images[0]?.imageUrl || '';

        // Set YouTube video
        if (product.youtube && elements.youtubeVideo && elements.youtubeVideoContainer) {
            const videoId = product.youtube.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
            elements.youtubeVideo.src = videoId ? `https://www.youtube.com/embed/${videoId}` : '';
            elements.youtubeVideoContainer.style.display = videoId ? 'block' : 'none';
        } else {
            elements.youtubeVideoContainer.style.display = 'none';
        }

        // Populate dimension picker
        const populateDimensionPicker = () => {
            elements.dimensionPicker.innerHTML = '';
            if (['Aquarium', 'Miroirs Décoratifs'].includes(product.subcategory) || (!product.allowCustom && product.dimensions)) {
                product.dimensions?.forEach((dim, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = `${dim.x}cm×${dim.y}cm${dim.z ? `×${dim.z}mm` : ''}`;
                    elements.dimensionPicker.appendChild(option);
                });
            } else {
                const customOption = document.createElement('option');
                customOption.value = 'custom';
                customOption.textContent = 'Personnalisé';
                elements.dimensionPicker.appendChild(customOption);
            }
        };

        // Populate verre and swiggle selectors for Double Vitrage and Verre Feuilleté
        const populateVerreSelectors = () => {
            if (product.subcategory === 'Double Vitrage') {
                elements.customOptions.innerHTML = `
                    <div class="w-commerce-commercecheckoutcolumn">
                        <label class="w-commerce-commercecheckoutlabel label">Type Verre 1</label>
                        <select id="verre1Type" class="select-field w-select"></select>
                    </div>
                    <div class="w-commerce-commercecheckoutcolumn">
                        <label class="w-commerce-commercecheckoutlabel label">Épaisseur Verre 1 (mm)</label>
                        <select id="verre1Z" class="select-field w-select"></select>
                    </div>
                    <div class="w-commerce-commercecheckoutcolumn">
                        <label class="w-commerce-commercecheckoutlabel label">Type Verre 2</label>
                        <select id="verre2Type" class="select-field w-select"></select>
                    </div>
                    <div class="w-commerce-commercecheckoutcolumn">
                        <label class="w-commerce-commercecheckoutlabel label">Épaisseur Verre 2 (mm)</label>
                        <select id="verre2Z" class="select-field w-select"></select>
                    </div>
                    <div class="w-commerce-commercecheckoutcolumn">
                        <label class="w-commerce-commercecheckoutlabel label">Épaisseur Swiggle (mm)</label>
                        <select id="swiggleThickness" class="select-field w-select"></select>
                    </div>
                    <div class="w-commerce-commercecheckoutcolumn">
                        <label class="w-commerce-commercecheckoutlabel label">Largeur (cm)</label>
                        <input id="x" class="w-commerce-commercecheckoutshippingstateprovince input no-margin-bottom" type="number" />
                    </div>
                    <div class="w-commerce-commercecheckoutcolumn">
                        <label class="w-commerce-commercecheckoutlabel label">Hauteur (cm)</label>
                        <input id="y" class="w-commerce-commercecheckoutshippingstateprovince input no-margin-bottom" type="number" />
                    </div>
                `;
                const verre1Type = document.getElementById('verre1Type');
                const verre1Z = document.getElementById('verre1Z');
                const verre2Type = document.getElementById('verre2Type');
                const verre2Z = document.getElementById('verre2Z');
                const swiggleThickness = document.getElementById('swiggleThickness');
                elements.xInput = document.getElementById('x');
                elements.yInput = document.getElementById('y');

                product.availableTypesVerre1.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.id;
                    option.textContent = `Type ${type.id}`;
                    verre1Type.appendChild(option);
                });
                product.availableTypesVerre2.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.id;
                    option.textContent = `Type ${type.id}`;
                    verre2Type.appendChild(option);
                });
                product.swiggleThicknesses.forEach(s => {
                    const option = document.createElement('option');
                    option.value = s.thickness;
                    option.textContent = `${s.thickness} mm`;
                    swiggleThickness.appendChild(option);
                });

                const updateVerreZOptions = (select, types, selectedType) => {
                    select.innerHTML = '';
                    const type = types.find(t => t.id === selectedType);
                    if (type) {
                        type.thicknesses.forEach(t => {
                            const option = document.createElement('option');
                            option.value = t.z;
                            option.textContent = `${t.z} mm`;
                            select.appendChild(option);
                        });
                    }
                };

                verre1Type.addEventListener('change', () => updateVerreZOptions(verre1Z, product.availableTypesVerre1, verre1Type.value));
                verre2Type.addEventListener('change', () => updateVerreZOptions(verre2Z, product.availableTypesVerre2, verre2Type.value));
                updateVerreZOptions(verre1Z, product.availableTypesVerre1, verre1Type.value);
                updateVerreZOptions(verre2Z, product.availableTypesVerre2, verre2Type.value);
            } else if (product.subcategory === 'Verre Feuilleté') {
                elements.customOptions.innerHTML = `
                    <div class="w-commerce-commercecheckoutcolumn">
                        <label class="w-commerce-commercecheckoutlabel label">Type Verre 1</label>
                        <select id="verre1Type" class="select-field w-select"></select>
                    </div>
                    <div class="w-commerce-commercecheckoutcolumn">
                        <label class="w-commerce-commercecheckoutlabel label">Épaisseur Verre 1 (mm)</label>
                        <select id="verre1Z" class="select-field w-select"></select>
                    </div>
                    <div class="w-commerce-commercecheckoutcolumn">
                        <label class="w-commerce-commercecheckoutlabel label">Type Verre 2</label>
                        <select id="verre2Type" class="select-field w-select"></select>
                    </div>
                    <div class="w-commerce-commercecheckoutcolumn">
                        <label class="w-commerce-commercecheckoutlabel label">Épaisseur Verre 2 (mm)</label>
                        <select id="verre2Z" class="select-field w-select"></select>
                    </div>
                    <div class="w-commerce-commercecheckoutcolumn">
                        <label class="w-commerce-commercecheckoutlabel label">Largeur (cm)</label>
                        <input id="x" class="w-commerce-commercecheckoutshippingstateprovince input no-margin-bottom" type="number" />
                    </div>
                    <div class="w-commerce-commercecheckoutcolumn">
                        <label class="w-commerce-commercecheckoutlabel label">Hauteur (cm)</label>
                        <input id="y" class="w-commerce-commercecheckoutshippingstateprovince input no-margin-bottom" type="number" />
                    </div>
                `;
                const verre1Type = document.getElementById('verre1Type');
                const verre1Z = document.getElementById('verre1Z');
                const verre2Type = document.getElementById('verre2Type');
                const verre2Z = document.getElementById('verre2Z');
                elements.xInput = document.getElementById('x');
                elements.yInput = document.getElementById('y');

                product.availableTypesVerre1.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.id;
                    option.textContent = `Type ${type.id}`;
                    verre1Type.appendChild(option);
                });
                product.availableTypesVerre2.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.id;
                    option.textContent = `Type ${type.id}`;
                    verre2Type.appendChild(option);
                });

                const updateVerreZOptions = (select, types, selectedType) => {
                    select.innerHTML = '';
                    const type = types.find(t => t.id === selectedType);
                    if (type) {
                        type.thicknesses.forEach(t => {
                            const option = document.createElement('option');
                            option.value = t.z;
                            option.textContent = `${t.z} mm`;
                            select.appendChild(option);
                        });
                    }
                };

                verre1Type.addEventListener('change', () => updateVerreZOptions(verre1Z, product.availableTypesVerre1, verre1Type.value));
                verre2Type.addEventListener('change', () => updateVerreZOptions(verre2Z, product.availableTypesVerre2, verre2Type.value));
                updateVerreZOptions(verre1Z, product.availableTypesVerre1, verre1Type.value);
                updateVerreZOptions(verre2Z, product.availableTypesVerre2, verre2Type.value);
            } else if (product.category === 'Cadres') {
                elements.customOptions.innerHTML = `
                    <div class="w-commerce-commercecheckoutcolumn">
                        <label class="w-commerce-commercecheckoutlabel label">Largeur (cm)</label>
                        <input id="x" class="w-commerce-commercecheckoutshippingstateprovince input no-margin-bottom" type="number" />
                    </div>
                    <div class="w-commerce-commercecheckoutcolumn">
                        <label class="w-commerce-commercecheckoutlabel label">Hauteur (cm)</label>
                        <input id="y" class="w-commerce-commercecheckoutshippingstateprovince input no-margin-bottom" type="number" />
                    </div>
                    <div class="w-commerce-commercecheckoutcolumn">
                        <label class="w-commerce-commercecheckoutlabel label">Avec Verre</label>
                        <select id="avecVerre" class="select-field w-select">
                            <option value="true">Avec verre</option>
                            <option value="false">Sans verre</option>
                        </select>
                    </div>
                `;
                elements.xInput = document.getElementById('x');
                elements.yInput = document.getElementById('y');
                elements.avecVerre = document.getElementById('avecVerre');
            } else {
                elements.zValues.innerHTML = '';
                product.availableTypesVerre1?.[0]?.thicknesses.forEach(z => {
                    const option = document.createElement('option');
                    option.value = z.z;
                    option.textContent = `${z.z} mm`;
                    elements.zValues.appendChild(option);
                });
            }
        };

        // Update price based on selections
        const updatePrice = () => {
            const dimensionIndex = elements.dimensionPicker.value;
            if (dimensionIndex === 'custom' && product.allowCustom) {
                const x = parseFloat(elements.xInput?.value);
                const y = parseFloat(elements.yInput?.value);
                if (isNaN(x) || isNaN(y)) {
                    elements.price.textContent = 'Entrez dimensions valides';
                    return;
                }

                if (product.subcategory === 'Double Vitrage') {
                    const verre1Type = document.getElementById('verre1Type')?.value;
                    const verre1Z = parseFloat(document.getElementById('verre1Z')?.value);
                    const verre2Type = document.getElementById('verre2Type')?.value;
                    const verre2Z = parseFloat(document.getElementById('verre2Z')?.value);
                    const swiggleThickness = parseFloat(document.getElementById('swiggleThickness')?.value);
                    const price = pricingAlgorithms.doubleVitrage(x, y, verre1Type, verre1Z, verre2Type, verre2Z, swiggleThickness, product);
                    elements.price.textContent = formatPrice(price);
                } else if (product.subcategory === 'Verre Feuilleté') {
                    const verre1Type = product.availableTypesVerre1.find(v => v.id === document.getElementById('verre1Type')?.value);
                    const verre1Z = parseFloat(document.getElementById('verre1Z')?.value);
                    const verre2Type = product.availableTypesVerre2.find(v => v.id === document.getElementById('verre2Type')?.value);
                    const verre2Z = parseFloat(document.getElementById('verre2Z')?.value);
                    const price = pricingAlgorithms.verreFeuilleté(x, y, verre1Type, verre1Z, verre2Type, verre2Z, product.prixFilm || 10);
                    elements.price.textContent = formatPrice(price);
                } else if (product.category === 'Cadres') {
                    const avecVerre = elements.avecVerre?.value === 'true';
                    const price = pricingAlgorithms.cadres(x, y, avecVerre, product);
                    elements.price.textContent = formatPrice(price);
                } else if (product.subcategory === 'Miroirs Rétroviseurs') {
                    const price = pricingAlgorithms.miroirsRétroviseurs(x, y, product);
                    elements.price.textContent = formatPrice(price);
                } else {
                    const z = parseFloat(elements.zValues?.value);
                    if (isNaN(z)) {
                        elements.price.textContent = 'Choisir une épaisseur';
                        return;
                    }
                    const price = pricingAlgorithms.simpleVitrage(x, y, z, product.availableTypesVerre1?.[0]?.thicknesses || []);
                    elements.price.textContent = formatPrice(price);
                }
            } else if (dimensionIndex !== '' && product.dimensions?.[dimensionIndex]) {
                elements.price.textContent = formatPrice(product.dimensions[dimensionIndex].price);
            } else {
                elements.price.textContent = 'Choisir une dimension';
            }
        };

        // Add to cart handler
        elements.addToCartBtn?.addEventListener('click', () => {
            if (!window.addToCart) {
                elements.price.textContent = 'Erreur: Fonction addToCart non disponible';
                return;
            }
            const qty = parseInt(elements.qtyInput?.value, 10);
            if (!Number.isInteger(qty) || qty <= 0) {
                elements.price.textContent = 'Entrez une quantité valide';
                return;
            }

            let dimensions;
            if (elements.dimensionPicker.value === 'custom' && product.allowCustom) {
                const x = parseFloat(elements.xInput?.value);
                const y = parseFloat(elements.yInput?.value);
                if (isNaN(x) || isNaN(y)) {
                    elements.price.textContent = 'Entrez dimensions valides';
                    return;
                }

                if (product.subcategory === 'Double Vitrage') {
                    const verre1Type = document.getElementById('verre1Type')?.value;
                    const verre1Z = parseFloat(document.getElementById('verre1Z')?.value);
                    const verre2Type = document.getElementById('verre2Type')?.value;
                    const verre2Z = parseFloat(document.getElementById('verre2Z')?.value);
                    const swiggleThickness = parseFloat(document.getElementById('swiggleThickness')?.value);
                    const price = pricingAlgorithms.doubleVitrage(x, y, verre1Type, verre1Z, verre2Type, verre2Z, swiggleThickness, product);
                    if (typeof price !== 'number') {
                        elements.price.textContent = price;
                        return;
                    }
                    dimensions = { x, y, verre1Type, verre1Z, verre2Type, verre2Z, swiggleThickness, price };
                } else if (product.subcategory === 'Verre Feuilleté') {
                    const verre1Type = product.availableTypesVerre1.find(v => v.id === document.getElementById('verre1Type')?.value);
                    const verre1Z = parseFloat(document.getElementById('verre1Z')?.value);
                    const verre2Type = product.availableTypesVerre2.find(v => v.id === document.getElementById('verre2Type')?.value);
                    const verre2Z = parseFloat(document.getElementById('verre2Z')?.value);
                    const price = pricingAlgorithms.verreFeuilleté(x, y, verre1Type, verre1Z, verre2Type, verre2Z, product.prixFilm || 10);
                    if (typeof price !== 'number') {
                        elements.price.textContent = price;
                        return;
                    }
                    dimensions = { x, y, verre1Type: verre1Type.id, verre1Z, verre2Type: verre2Type.id, verre2Z, price };
                } else if (product.category === 'Cadres') {
                    const avecVerre = elements.avecVerre?.value === 'true';
                    const price = pricingAlgorithms.cadres(x, y, avecVerre, product);
                    if (typeof price !== 'number') {
                        elements.price.textContent = price;
                        return;
                    }
                    dimensions = { x, y, avecVerre, price };
                } else if (product.subcategory === 'Miroirs Rétroviseurs') {
                    const price = pricingAlgorithms.miroirsRétroviseurs(x, y, product);
                    if (typeof price !== 'number') {
                        elements.price.textContent = price;
                        return;
                    }
                    dimensions = { x, y, price };
                } else {
                    const z = parseFloat(elements.zValues?.value);
                    if (isNaN(z)) {
                        elements.price.textContent = 'Choisir une épaisseur';
                        return;
                    }
                    const price = pricingAlgorithms.simpleVitrage(x, y, z, product.availableTypesVerre1?.[0]?.thicknesses || []);
                    if (typeof price !== 'number') {
                        elements.price.textContent = price;
                        return;
                    }
                    dimensions = { x, y, z, price };
                }
            } else if (elements.dimensionPicker.value !== '' && product.dimensions?.[elements.dimensionPicker.value]) {
                const selectedDim = product.dimensions[elements.dimensionPicker.value];
                dimensions = { x: selectedDim.x, y: selectedDim.y, z: selectedDim.z || null, price: selectedDim.price };
            } else {
                elements.price.textContent = 'Choisir une dimension';
                return;
            }

            const success = window.addToCart(product.id, dimensions, qty);
            elements.price.textContent = success ? 'Ajouté au panier' : 'Erreur lors de l’ajout au panier';
            if (success) setTimeout(updatePrice, 2000);
        });

        // Toggle custom options visibility
        const toggleCustomOptions = () => {
            elements.customOptions.style.display = elements.dimensionPicker.value === 'custom' && product.allowCustom ? 'flex' : 'none';
            populateVerreSelectors();
            updatePrice();
        };

        // Initialize UI
        populateDimensionPicker();
        toggleCustomOptions();
        elements.dimensionPicker.addEventListener('change', toggleCustomOptions);
        elements.xInput?.addEventListener('input', updatePrice);
        elements.yInput?.addEventListener('input', updatePrice);
        elements.zValues?.addEventListener('change', updatePrice);
        document.getElementById('verre1Type')?.addEventListener('change', updatePrice);
        document.getElementById('verre1Z')?.addEventListener('change', updatePrice);
        document.getElementById('verre2Type')?.addEventListener('change', updatePrice);
        document.getElementById('verre2Z')?.addEventListener('change', updatePrice);
        document.getElementById('swiggleThickness')?.addEventListener('change', updatePrice);
        document.getElementById('avecVerre')?.addEventListener('change', updatePrice);

        // Populate associated content
        if (elements.associatedContent && product.category) {
            const relatedProducts = products
                .filter(p => p.category === product.category && p.id.toString() !== productId)
                .sort(() => Math.random() - 0.5);
            elements.associatedContent.innerHTML = relatedProducts.map(p => {
                const dim = p.dimensions?.[0] || { x: 0, y: 0, z: null, price: 0 };
                const zDim = dim.z ? `×${dim.z}mm` : '';
                return `
                    <div role="listitem" class="product-card-wrapper w-dyn-item">
                        <a href="product.html?id=${p.id}" class="product-card w-inline-block">
                            <div class="product-card-image-wrapper">
                                <img src="${p.images[0]?.imageUrl}" alt="${p.name}" sizes="100vw">
                            </div>
                            <h6 class="product-card-heading">${p.name}</h6>
                            <div class="text-block-4">${dim.x}cm×${dim.y}cm${zDim}</div>
                            <div class="product-card-price">${formatPrice(dim.price)}</div>
                        </a>
                    </div>
                `;
            }).join('');
        }

        document.dispatchEvent(new Event('productDataReady'));
    } catch (error) {
        console.error('Error fetching product:', error.message);
        Object.assign(elements, {
            productName: `Erreur: ${error.message}`,
            productNameDir: `Erreur: ${error.message}`,
            productImages: '{}',
            dimensionPicker: '<option value="">Erreur de chargement</option>',
            customOptions: { style: { display: 'none' } },
            zValues: '<option value="">Erreur de chargement</option>',
            desc: 'Erreur de chargement',
            youtubeVideoContainer: { style: { display: 'none' } },
            associatedContent: '',
            price: `Erreur: ${error.message}`
        });
        document.dispatchEvent(new Event('productDataReady'));
    }
})();