(async function () {
    const api = 'https://ademtebourbi.github.io/VerrerieEnnajah-Data';
    const productName = document.getElementById('productName');
    const productNameDir = document.getElementById('productNameDir');
    const productImage = document.getElementById('productImage');
    const dimensionPicker = document.getElementById('dimensionPicker');
    const customOption = document.getElementById('customOptions');
    const zValues = document.getElementById('zValues');
    const desc = document.getElementById('desc');
    const youtubeVideo = document.getElementById('youtubeVideo');
    const youtubeVideoContainer = document.getElementById('youtubeVideoContainer');
    const associatedContent = document.getElementById('associatedContent');
    const priceElement = document.getElementById('price');
    const xInput = document.getElementById('x');
    const yInput = document.getElementById('y');
    const zInput = document.getElementById('z');
    const qtyInput = document.getElementById('qty');
    const addToCartBtn = document.getElementById('addToCartBtn');

    // Get query parameter 'id'
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Function to format price with space every 3 digits and 3 decimal places
    function formatPrice(price) {
        const priceParts = price.toFixed(3).split('.');
        return `${priceParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}.${priceParts[1]}`;
    }

    // Function to calculate custom price
    function calculateCustomPrice(x, y, z, availableZ) {
        // Convert to meters
        const xmm = x / 100;
        const ymm = y / 100;

        const zData = availableZ.find(item => item.z == z);
        if (!zData) return 'Épaisseur invalide';
        const zPrice = zData.price;

        if (z != 3) {
            if ((x >= 300 && x <= 325 && y >= 200 && y <= 225) || (y >= 300 && y <= 325 && x >= 200 && x <= 225)) {
                return 3.25 * 2.25 * zPrice;
            } else if (x >= 200 && x <= 225 && y >= 5 && y < 300) {
                return (ymm + 0.03) * 2.25 * zPrice;
            } else if (y >= 200 && y <= 225 && x >= 5 && x < 300) {
                return 2.25 * (xmm + 0.03) * zPrice;
            } else if (y >= 300 && y <= 325 && x >= 5 && x < 200) {
                return 3.25 * (xmm + 0.03) * zPrice;
            } else if (x >= 300 && x <= 325 && y >= 5 && y < 200) {
                return 3.25 * (ymm + 0.03) * zPrice;
            } else if ((x >= 5 && x < 300 && y >= 5 && y < 200) || (y >= 5 && y < 300 && x >= 5 && x < 200)) {
                return (xmm + 0.03) * (ymm + 0.03) * zPrice;
            }
        } else {
            if ((x >= 225 && x <= 240 && y >= 165 && y <= 180) || (y >= 225 && y <= 240 && x >= 165 && x <= 180)) {
                return 2.4 * 1.8 * zPrice;
            } else if (x >= 165 && x <= 180 && y >= 5 && y < 225) {
                return (ymm + 0.03) * 1.8 * zPrice;
            } else if (y >= 165 && y <= 180 && x >= 5 && x < 225) {
                return (xmm + 0.03) * 1.8 * zPrice;
            } else if (y >= 225 && y <= 240 && x >= 5 && x < 165) {
                return 2.4 * (xmm + 0.03) * zPrice;
            } else if (x >= 225 && x <= 240 && y >= 5 && y < 165) {
                return 2.4 * (ymm + 0.03) * zPrice;
            } else if ((x >= 5 && x < 225 && y >= 5 && y < 165) || (y >= 5 && y < 225 && x >= 5 && x < 165)) {
                return (xmm + 0.03) * (ymm + 0.03) * zPrice;
            }
        }
        return 'Dimensions non valides';
    }

    // Function to delay execution
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    if (!productId) {
        productName.textContent = 'No product ID provided';
        if (productNameDir) productNameDir.textContent = 'No product ID provided';
        productImagesScript.textContent = '{}';
        dimensionPicker.innerHTML = '<option value="">No product ID provided</option>';
        customOption.style.display = 'none';
        if (zValues) zValues.innerHTML = '<option value="">No product ID provided</option>';
        if (desc) desc.textContent = 'Aucune description disponible';
        if (youtubeVideoContainer) youtubeVideoContainer.style.display = 'none';
        if (associatedContent) associatedContent.innerHTML = '';
        if (priceElement) priceElement.textContent = 'Aucun prix disponible';
        document.dispatchEvent(new Event('productDataReady'));
        return;
    }

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

    try {
        const response = await fetch(`${api}/products.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, StatusText: ${response.statusText}`);
        }
        const products = await response.json();

        if (!Array.isArray(products)) {
            throw new Error('Invalid data format: Expected an array of products');
        }
        const product = products.find(p => p.id === productId);
        if (product) {
            const loader = document.getElementById('loader');
            const mainContent = document.getElementById('mainContent');

            // STEP 3: Sort - JSON scripts first, then others (both in reverse order)
            const jsonScripts = [];
            const otherScripts = [];

            for (let i = deferredScripts.length - 1; i >= 0; i--) {
                const s = deferredScripts[i];
                const type = s.attributes['type'] || 'text/javascript';
                if (type === 'application/json') jsonScripts.push(s);
                else otherScripts.push(s);
            }

            // Function to insert scripts
            const insertScripts = (scriptList) => {
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

            // Insert JSON scripts
            insertScripts(jsonScripts);
            await delay(5000);

            const productImagesScript = document.getElementById('productImages');

            // Create JSON for product images
            const imageItems = product.images.map(imageUrl => {
                const fileName = imageUrl.split('/').pop();
                const id = fileName.split('.').slice(0, -1).join('.');
                return {
                    _id: id,
                    origFileName: fileName,
                    fileName: fileName,
                    fileSize: 0, // Placeholder as fileSize is not available
                    height: 1200,
                    url: imageUrl,
                    width: 1200,
                    type: "image"
                };
            });

            // Set JSON content in script tag with group
            productImagesScript.textContent = JSON.stringify({
                items: imageItems,
                group: product.category || "Unknown"
            }, null, 2);

            // Wait for 1 second
            await delay(5000);

            // Insert other scripts after delay
            insertScripts(otherScripts);

            loader.style.display = 'none';
            mainContent.style.display = 'block';

            // Set product name
            productName.textContent = product.name;
            if (productNameDir) productNameDir.textContent = product.name;

            // Set product description
            if (desc) desc.textContent = product.description || 'Aucune description disponible';

            // Set product image srcset
            if (product.images && product.images[0]) {
                productImage.srcset = product.images[0];
            }

            // Set YouTube video iframe src
            if (youtubeVideo && youtubeVideoContainer && product.youtubeLink) {
                const videoId = product.youtubeLink.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
                if (videoId) {
                    youtubeVideo.src = `https://www.youtube.com/embed/${videoId}`;
                    youtubeVideoContainer.style.display = 'block';
                } else {
                    youtubeVideoContainer.style.display = 'none';
                }
            } else if (youtubeVideoContainer) {
                youtubeVideoContainer.style.display = 'none';
            }

            // Populate dimension picker
            dimensionPicker.innerHTML = ''; // Clear existing options
            product.defaultDimensions.forEach((dim, index) => {
                const zDimension = dim.z ? `×${dim.z}mm` : '';
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${dim.x}cm×${dim.y}cm${zDimension}`;
                dimensionPicker.appendChild(option);
            });

            // Add custom option if allowCustom is true
            if (product.allowCustom) {
                const customOptionElement = document.createElement('option');
                customOptionElement.value = 'custom';
                customOptionElement.textContent = 'Personnalisé';
                dimensionPicker.appendChild(customOptionElement);
            }

            // Populate zValues select if custom mode is enabled
            function updateZValues() {
                if (zValues && product.allowCustom && dimensionPicker.value === 'custom' && product.availableZ) {
                    zValues.innerHTML = ''; // Clear existing options
                    product.availableZ.forEach(z => {
                        const option = document.createElement('option');
                        option.value = z.z;
                        option.textContent = `${z.z} mm`;
                        zValues.appendChild(option);
                    });
                } else if (zValues) {
                    zValues.innerHTML = '<option value="">Choisir d’abord une dimension</option>';
                }
            }

            // Update price based on dimensionPicker or custom inputs
            function updatePrice() {
                if (dimensionPicker.value === 'custom' && xInput && yInput && zValues && product.allowCustom) {
                    const x = parseFloat(xInput.value);
                    const y = parseFloat(yInput.value);
                    const z = parseFloat(zValues.value);
                    if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                        const calculatedPrice = calculateCustomPrice(x, y, z, product.availableZ);
                        priceElement.textContent = typeof calculatedPrice === 'number' ? formatPrice(calculatedPrice) + ' DT' : calculatedPrice;
                    } else {
                        priceElement.textContent = 'Entrez dimensions valides';
                    }
                } else if (dimensionPicker.value !== '' && product.defaultDimensions[dimensionPicker.value]) {
                    priceElement.textContent = formatPrice(product.defaultDimensions[dimensionPicker.value].price) + ' DT';
                } else {
                    priceElement.textContent = 'Choisir une dimension';
                }
            }

            // Add to cart handler
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', () => {
                    if (!window.addToCart) {
                        console.error('addToCart method not available');
                        return;
                    }
                    const qty = parseInt(qtyInput ? qtyInput.value : '1', 10);
                    if (!Number.isInteger(qty) || qty <= 0) {
                        console.error('Invalid quantity');
                        priceElement.textContent = 'Entrez une quantité valide';
                        return;
                    }

                    let dimensions;
                    if (dimensionPicker.value === 'custom' && xInput && yInput && zValues && product.allowCustom) {
                        const x = parseFloat(xInput.value);
                        const y = parseFloat(yInput.value);
                        const z = parseFloat(zValues.value);
                        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                            const calculatedPrice = calculateCustomPrice(x, y, z, product.availableZ);
                            if (typeof calculatedPrice !== 'number') {
                                console.error('Invalid dimensions for custom price');
                                priceElement.textContent = calculatedPrice;
                                return;
                            }
                            dimensions = { x, y, z, price: calculatedPrice };
                        } else {
                            console.error('Invalid custom dimensions');
                            priceElement.textContent = 'Entrez dimensions valides';
                            return;
                        }
                    } else if (dimensionPicker.value !== '' && product.defaultDimensions[dimensionPicker.value]) {
                        const selectedDim = product.defaultDimensions[dimensionPicker.value];
                        dimensions = {
                            x: selectedDim.x,
                            y: selectedDim.y,
                            z: selectedDim.z || null,
                            price: selectedDim.price
                        };
                    } else {
                        console.error('No valid dimension selected');
                        priceElement.textContent = 'Choisir dimension';
                        return;
                    }

                    const success = window.addToCart(product.id, dimensions, qty);
                    if (success) {
                        priceElement.textContent = 'Ajouté au panier';
                        setTimeout(updatePrice, 2000); // Revert price display after 2 seconds
                    } else {
                        priceElement.textContent = 'Erreur lors de l’ajout au panier';
                    }
                });
            }

            // Toggle customOption div visibility and update zValues and price
            function toggleCustomOption() {
                customOption.style.display = dimensionPicker.value === 'custom' ? 'flex' : 'none';
                updateZValues();
                updatePrice();
            }

            // Set initial visibility, zValues, and price, and add event listeners
            toggleCustomOption();
            dimensionPicker.addEventListener('change', toggleCustomOption);
            if (xInput) xInput.addEventListener('input', updatePrice);
            if (yInput) yInput.addEventListener('input', updatePrice);
            if (zValues) zValues.addEventListener('change', updatePrice);

            // Populate associated content with related products
            if (associatedContent && product.category) {
                // Filter products with the same category, excluding current product
                const relatedProducts = products
                    .filter(p => p.category === product.category && p.id !== productId)
                    // Randomize order
                    .sort(() => Math.random() - 0.5);

                associatedContent.innerHTML = ''; // Clear existing content
                relatedProducts.forEach(relatedProduct => {
                    const dimensions = relatedProduct.defaultDimensions[0];
                    const zDimension = dimensions.z ? `×${dimensions.z}mm` : '';
                    const formattedPrice = formatPrice(dimensions.price);

                    const productCard = `
                        <div role="listitem" class="product-card-wrapper w-dyn-item">
                            <a href="product.html?id=${relatedProduct.id}" class="product-card w-inline-block">
                                <div class="product-card-image-wrapper">
                                    <img src="${relatedProduct.images[0]}" alt="${relatedProduct.name}" sizes="100vw">
                                </div>
                                <h6 class="product-card-heading">${relatedProduct.name}</h6>
                                <div class="text-block-4">${dimensions.x}cm×${dimensions.y}cm${zDimension}</div>
                                <div class="product-card-price">${formattedPrice} DT</div>
                            </a>
                        </div>
                    `;
                    associatedContent.insertAdjacentHTML('beforeend', productCard);
                });
            }

            // Dispatch custom event to signal data is ready
            document.dispatchEvent(new Event('productDataReady'));
        } else {
            window.location.href = '404.html';
        }
    } catch (error) {
        console.error('Error fetching product:', error.message);
        productName.textContent = 'Erreur de chargement du produit : ' + error.message;
        if (productNameDir) productNameDir.textContent = 'Erreur de chargement du produit : ' + error.message;
        productImagesScript.textContent = '{}';
        dimensionPicker.innerHTML = '<option value="">Erreur de chargement des dimensions</option>';
        customOption.style.display = 'none';
        if (zValues) zValues.innerHTML = '<option value="">Erreur de chargement des valeurs d’épaisseur</option>';
        if (desc) desc.textContent = 'Erreur de chargement de la description';
        if (youtubeVideoContainer) youtubeVideoContainer.style.display = 'none';
        if (associatedContent) associatedContent.innerHTML = '';
        if (priceElement) priceElement.textContent = 'Erreur de chargement du prix : ' + error.message;
        document.dispatchEvent(new Event('productDataReady'));
    }
})();