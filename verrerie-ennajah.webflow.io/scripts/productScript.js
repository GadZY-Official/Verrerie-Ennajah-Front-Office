(function() {
    const api = 'https://ademtebourbi.github.io/VerrerieEnnajah-Data';
    const productName = document.getElementById('productName');
    const productNameDir = document.getElementById('productNameDir');
    const productImage = document.getElementById('productImage');
    const productImagesScript = document.getElementById('productImages');
    const dimensionPicker = document.getElementById('dimensionPicker');
    const customOption = document.getElementById('customOptions');
    const zValues = document.getElementById('zValues');
    const desc = document.getElementById('desc');
    const youtubeVideo = document.getElementById('youtubeVideo');
    const youtubeVideoContainer = document.getElementById('youtubeVideoContainer');
    const associatedContent = document.getElementById('associatedContent');

    // Get query parameter 'id'
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Function to format price with space every 3 digits and 3 decimal places
    function formatPrice(price) {
        const priceParts = price.toFixed(3).split('.');
        return `${priceParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}.${priceParts[1]}`;
    }

    if (!productId) {
        productName.textContent = 'No product ID provided';
        if (productNameDir) productNameDir.textContent = 'No product ID provided';
        productImagesScript.textContent = '{}';
        dimensionPicker.innerHTML = '<option value="">No product ID provided</option>';
        customOption.style.display = 'none';
        if (zValues) zValues.innerHTML = '<option value="">No product ID provided</option>';
        if (desc) desc.textContent = 'No description available';
        if (youtubeVideoContainer) youtubeVideoContainer.style.display = 'none';
        if (associatedContent) associatedContent.innerHTML = '';
        document.dispatchEvent(new Event('productDataReady'));
        return;
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
            const product = products.find(p => p.id === productId);
            if (product) {
                // Set product name
                productName.textContent = product.name;
                if (productNameDir) productNameDir.textContent = product.name;

                // Set product description
                if (desc) desc.textContent = product.description || 'No description available';

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
                    customOptionElement.textContent = 'Personalisé';
                    dimensionPicker.appendChild(customOptionElement);
                }

                // Populate zValues select if custom mode is enabled
                function updateZValues() {
                    if (zValues && product.allowCustom && dimensionPicker.value === 'custom' && product.availableZ) {
                        zValues.innerHTML = ''; // Clear existing options
                        product.availableZ.forEach(z => {
                            const option = document.createElement('option');
                            option.value = z;
                            option.textContent = `${z.z} mm`; // Fixed from z.z to z
                            zValues.appendChild(option);
                        });
                    } else if (zValues) {
                        zValues.innerHTML = '<option value="">Select a dimension first</option>';
                    }
                }

                // Toggle customOption div visibility and update zValues
                function toggleCustomOption() {
                    customOption.style.display = dimensionPicker.value === 'custom' ? 'flex' : 'none';
                    updateZValues();
                }

                // Set initial visibility and zValues, and add event listener
                toggleCustomOption();
                dimensionPicker.addEventListener('change', toggleCustomOption);

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
                productName.textContent = 'Product not found';
                if (productNameDir) productNameDir.textContent = 'Product not found';
                productImagesScript.textContent = '{}';
                dimensionPicker.innerHTML = '<option value="">Product not found</option>';
                customOption.style.display = 'none';
                if (zValues) zValues.innerHTML = '<option value="">Product not found</option>';
                if (desc) desc.textContent = 'No description available';
                if (youtubeVideoContainer) youtubeVideoContainer.style.display = 'none';
                if (associatedContent) associatedContent.innerHTML = '';
                document.dispatchEvent(new Event('productDataReady'));
            }
        })
        .catch(error => {
            console.error('Error fetching product:', error.message);
            productName.textContent = 'Error loading product: ' + error.message;
            if (productNameDir) productNameDir.textContent = 'Error loading product: ' + error.message;
            productImagesScript.textContent = '{}';
            dimensionPicker.innerHTML = '<option value="">Error loading dimensions</option>';
            customOption.style.display = 'none';
            if (zValues) zValues.innerHTML = '<option value="">Error loading z-values</option>';
            if (desc) desc.textContent = 'Error loading description';
            if (youtubeVideoContainer) youtubeVideoContainer.style.display = 'none';
            if (associatedContent) associatedContent.innerHTML = '';
            document.dispatchEvent(new Event('productDataReady'));
        });
})();