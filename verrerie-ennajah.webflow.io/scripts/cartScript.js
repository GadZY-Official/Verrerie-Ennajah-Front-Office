(function() {
    const api = 'https://ademtebourbi.github.io/VerrerieEnnajah-Data';
    const CART_KEY = 'cart';
    let cartElement = null;

    // Initialize cart in localStorage if it doesn't exist
    if (!localStorage.getItem(CART_KEY)) {
        localStorage.setItem(CART_KEY, JSON.stringify([]));
    }

    // Utility function to get cart from localStorage
    function getCartFromStorage() {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    }

    // Utility function to save cart to localStorage
    function saveCartToStorage(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    // Utility function to compare dimensions objects
    function areDimensionsEqual(dim1, dim2) {
        return dim1.x === dim2.x && dim1.y === dim2.y && dim1.z === dim2.z;
    }

    // Function to format price with space every 3 digits and 3 decimal places
    function formatPrice(price) {
        const priceParts = price.toFixed(3).split('.');
        return `${priceParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}.${priceParts[1]}`;
    }

    // Update cart items number display
    function updateCartItemsNum() {
        const cart = getCartFromStorage();
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        const cartItemsNum = document.getElementById('cartItemsNum');
        if (cartItemsNum) {
            cartItemsNum.textContent = totalItems.toString();
        } else {
            console.warn('Element with id="cartItemsNum" not found');
        }
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
            return product ? { name: product.name, image: product.images[0] || '' } : null;
        } catch (error) {
            console.error('Error fetching product details:', error.message);
            return null;
        }
    }

    // Generate cart HTML
    async function generateCartHTML() {
        const cart = getCartFromStorage();
        let totalPrice = 0;
        const itemsHTML = await Promise.all(cart.map(async item => {
            const productDetails = await fetchProductDetails(item.productId);
            const name = productDetails ? productDetails.name : 'Unknown Product';
            const image = productDetails ? productDetails.image : '';
            const zDimension = item.dimensions.z ? `×${item.dimensions.z}mm` : '';
            const itemTotal = item.dimensions.price * item.qty;
            totalPrice += itemTotal;

            return `
                <div class="w-commerce-commercecartitem">
                    <img src="${image}" alt="${name}" class="w-commerce-commercecartitemimage">
                    <div class="w-commerce-commercecartiteminfo">
                        <div class="w-commerce-commercecartproductname">${name}</div>
                        <div>${item.dimensions.x}cm×${item.dimensions.y}cm${zDimension}</div>
                        <div>${formatPrice(item.dimensions.price)} DT</div>
                        <a href="#" class="cart-remove-link" data-product-id="${item.productId}" data-x="${item.dimensions.x}" data-y="${item.dimensions.y}" data-z="${item.dimensions.z || ''}" aria-label="Remove item from cart">Remove</a>
                    </div>
                    <input type="number" class="w-commerce-commercecartquantity input quantity-input" required pattern="^[0-9]+$" inputmode="numeric" name="quantity" autocomplete="off" value="${item.qty}" min="1" data-product-id="${item.productId}" data-x="${item.dimensions.x}" data-y="${item.dimensions.y}" data-z="${item.dimensions.z || ''}">
                </div>
            `;
        }));

        const cartContent = itemsHTML.length > 0 ? `
            <div class="w-commerce-commercecartformwrapper">
                <form class="w-commerce-commercecartform">
                    <div class="w-commerce-commercecartlist cart-list">
                        ${itemsHTML.join('')}
                    </div>
                    <div class="w-commerce-commercecartfooter cart-footer">
                        <div class="w-commerce-commercecartlineitem">
                            <div>Subtotal</div>
                            <div>${formatPrice(totalPrice)} DT</div>
                        </div>
                        <a href="/checkout.html" class="w-commerce-commercecartcheckoutbutton button">Continue to Checkout</a>
                    </div>
                </form>
            </div>
        ` : `
            <div class="w-commerce-commercecartemptystate">
                <div>No items found.</div>
            </div>
        `;

        return `
            <div data-node-type="commerce-cart-container-wrapper" style="transition: all, opacity 300ms; opacity: 1;" class="w-commerce-commercecartcontainerwrapper w-commerce-commercecartcontainerwrapper--cartType-modal">
                <div data-node-type="commerce-cart-container" role="dialog" class="w-commerce-commercecartcontainer cart-container" style="transition: all, transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94); transform: scale(1);">
                    <div class="w-commerce-commercecartheader cart-header">
                        <h4 class="w-commerce-commercecartheading">Your Cart</h4>
                        <a href="#" data-node-type="commerce-cart-close-link" class="w-commerce-commercecartcloselink w-inline-block" role="button" aria-label="Close cart">
                            <svg width="16px" height="16px" viewBox="0 0 16 16">
                                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                    <g fill-rule="nonzero" fill="#333333">
                                        <polygon points="6.23223305 8 0.616116524 13.6161165 2.38388348 15.3838835 8 9.76776695 13.6161165 15.3838835 15.3838835 13.6161165 9.76776695 8 15.3838835 2.38388348 13.6161165 0.616116524 8 6.23223305 2.38388348 0.616116524 0.616116524 2.38388348 6.23223305 8"></polygon>
                                    </g>
                                </g>
                            </svg>
                        </a>
                    </div>
                    ${cartContent}
                </div>
            </div>
        `;
    }

    // Add to cart
    window.addToCart = function(productId, dimensions, qty) {
        if (!productId || !dimensions || !Number.isInteger(qty) || qty <= 0) {
            console.error('Invalid input: productId, dimensions, and positive integer qty are required');
            return false;
        }
        const cart = getCartFromStorage();
        const existingItem = cart.find(item => 
            item.productId === productId && areDimensionsEqual(item.dimensions, dimensions)
        );

        if (existingItem) {
            existingItem.qty += qty; // Merge quantities
        } else {
            cart.push({
                productId,
                dimensions: {
                    x: dimensions.x,
                    y: dimensions.y,
                    z: dimensions.z || null,
                    price: dimensions.price
                },
                qty
            });
        }

        saveCartToStorage(cart);
        updateCartItemsNum(); // Update items number
        if (cartElement) {
            refreshCart(); // Refresh cart if open
        }
        return true;
    };

    // Delete item from cart
    window.deleteFromCart = function(productId, dimensions) {
        if (!productId || !dimensions) {
            console.error('Invalid input: productId and dimensions are required');
            return false;
        }
        let cart = getCartFromStorage();
        cart = cart.filter(item => 
            !(item.productId === productId && areDimensionsEqual(item.dimensions, dimensions))
        );
        saveCartToStorage(cart);
        updateCartItemsNum(); // Update items number
        if (cartElement) {
            refreshCart(); // Refresh cart if open
        }
        return true;
    };

    // Update quantity of an item in cart
    window.updateQty = function(productId, dimensions, qty) {
        if (!productId || !dimensions || !Number.isInteger(qty) || qty <= 0) {
            console.error('Invalid input: productId, dimensions, and positive integer qty are required');
            return false;
        }
        const cart = getCartFromStorage();
        const item = cart.find(item => 
            item.productId === productId && areDimensionsEqual(item.dimensions, dimensions)
        );

        if (item) {
            item.qty = qty;
            saveCartToStorage(cart);
            updateCartItemsNum(); // Update items number
            if (cartElement) {
                refreshCart(); // Refresh cart if open
            }
            return true;
        } else {
            console.error('Item not found in cart');
            return false;
        }
    };

    // Get the current cart
    window.getCart = function() {
        return getCartFromStorage();
    };

    // Refresh cart without closing
    async function refreshCart() {
        if (cartElement) {
            cartElement.innerHTML = await generateCartHTML();

            // Re-attach event listeners
            cartElement.querySelectorAll('.cart-remove-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const productId = link.getAttribute('data-product-id');
                    const dimensions = {
                        x: parseFloat(link.getAttribute('data-x')),
                        y: parseFloat(link.getAttribute('data-y')),
                        z: link.getAttribute('data-z') ? parseFloat(link.getAttribute('data-z')) : null,
                        price: 0 // Price not needed for deletion
                    };
                    window.deleteFromCart(productId, dimensions);
                });
            });

            cartElement.querySelectorAll('.w-commerce-commercecartquantity').forEach(input => {
                input.addEventListener('change', () => {
                    const productId = input.getAttribute('data-product-id');
                    const dimensions = {
                        x: parseFloat(input.getAttribute('data-x')),
                        y: parseFloat(input.getAttribute('data-y')),
                        z: input.getAttribute('data-z') ? parseFloat(input.getAttribute('data-z')) : null,
                        price: 0 // Price not needed for update
                    };
                    const qty = parseInt(input.value, 10);
                    if (!Number.isInteger(qty) || qty <= 0) {
                        console.error('Invalid quantity');
                        return;
                    }
                    window.updateQty(productId, dimensions, qty);
                });
            });

            const closeLink = cartElement.querySelector('[data-node-type="commerce-cart-close-link"]');
            if (closeLink) {
                closeLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleCart();
                });
            }
        }
    }

    // Toggle cart visibility
    window.toggleCart = async function() {
        const wrapper = document.querySelector('[data-node-type="commerce-cart-wrapper"]');
        if (!wrapper) {
            console.error('Cart wrapper not found');
            return;
        }

        if (cartElement) {
            // Cart is open, remove it
            cartElement.remove();
            cartElement = null;
        } else {
            // Cart is closed, generate and add it
            cartElement = document.createElement('div');
            cartElement.innerHTML = await generateCartHTML();
            wrapper.appendChild(cartElement);

            // Add event listeners
            cartElement.querySelectorAll('.cart-remove-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const productId = link.getAttribute('data-product-id');
                    const dimensions = {
                        x: parseFloat(link.getAttribute('data-x')),
                        y: parseFloat(link.getAttribute('data-y')),
                        z: link.getAttribute('data-z') ? parseFloat(link.getAttribute('data-z')) : null,
                        price: 0 // Price not needed for deletion
                    };
                    window.deleteFromCart(productId, dimensions);
                });
            });

            cartElement.querySelectorAll('.w-commerce-commercecartquantity').forEach(input => {
                input.addEventListener('change', () => {
                    const productId = input.getAttribute('data-product-id');
                    const dimensions = {
                        x: parseFloat(input.getAttribute('data-x')),
                        y: parseFloat(input.getAttribute('data-y')),
                        z: input.getAttribute('data-z') ? parseFloat(input.getAttribute('data-z')) : null,
                        price: 0 // Price not needed for update
                    };
                    const qty = parseInt(input.value, 10);
                    if (!Number.isInteger(qty) || qty <= 0) {
                        console.error('Invalid quantity');
                        return;
                    }
                    window.updateQty(productId, dimensions, qty);
                });
            });

            const closeLink = cartElement.querySelector('[data-node-type="commerce-cart-close-link"]');
            if (closeLink) {
                closeLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleCart();
                });
            }
        }
        updateCartItemsNum(); // Update items number on toggle
    };

    // Initialize cart items number on page load
    document.addEventListener('DOMContentLoaded', updateCartItemsNum);
})();