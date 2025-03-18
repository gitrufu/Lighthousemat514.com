document.addEventListener('DOMContentLoaded', () => {
    const cartItems = document.querySelector('.cart-items');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const cartContainer = document.querySelector('.cart-container');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const checkoutFormContainer = document.querySelector('.checkout-form-container');
    const confirmationPopup = document.querySelector('.order-confirmation-popup');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    function updateSteps(currentStep) {
        const steps = document.querySelectorAll('.cart-steps .step');
        const stepLines = document.querySelectorAll('.step-line');
        let foundCurrent = false;

        steps.forEach((step, index) => {
            if (step.dataset.step === currentStep) {
                step.classList.add('active');
                foundCurrent = true;
            } else if (!foundCurrent) {
                step.classList.add('completed');
                if (stepLines[index]) {
                    stepLines[index].classList.add('active');
                }
            } else {
                step.classList.remove('active', 'completed');
                if (stepLines[index - 1]) {
                    stepLines[index - 1].classList.remove('active');
                }
            }
        });
    }

    function showConfirmationPopup(orderData) {
        // Update popup content
        const popup = document.querySelector('.order-confirmation-popup');
        popup.querySelector('.order-id span').textContent = orderData.orderId;
        popup.querySelector('.order-total span').textContent = `₹${orderData.totalAmount}`;
        popup.querySelector('.customer-name').textContent = orderData.customerInfo.name;
        popup.querySelector('.customer-address').textContent = orderData.customerInfo.address;
        popup.querySelector('.customer-pincode').textContent = `PIN: ${orderData.customerInfo.pincode}`;
        popup.querySelector('.customer-phone').textContent = `Phone: ${orderData.customerInfo.phone}`;
        popup.querySelector('.customer-email').textContent = `Email: ${orderData.customerInfo.email}`;

        // Show popup
        popup.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Handle close button
        const closeBtn = popup.querySelector('.close-popup');
        closeBtn.onclick = () => {
            popup.style.display = 'none';
            document.body.style.overflow = '';
            window.location.href = 'index.html';
        };

        // Handle continue shopping button
        const continueBtn = popup.querySelector('.continue-shopping');
        continueBtn.onclick = () => {
            popup.style.display = 'none';
            document.body.style.overflow = '';
            window.location.href = 'index.html';
        };

        // Handle overlay click
        const overlay = popup.querySelector('.popup-overlay');
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                popup.style.display = 'none';
                document.body.style.overflow = '';
                window.location.href = 'index.html';
            }
        };
    }
    
    function updateCart() {
        if (cart.length === 0) {
            cartContainer.style.display = 'none';
            emptyCartMessage.style.display = 'flex';
            checkoutFormContainer.style.display = 'none';
            updateCartCount();
            updateSteps('cart');
            return;
        }

        cartContainer.style.display = 'grid';
        emptyCartMessage.style.display = 'none';
        checkoutFormContainer.style.display = 'none';
        updateCartCount();
        updateSteps('cart');
        
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item" data-index="${index}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p class="item-price">₹${item.price.toFixed(2)}</p>
                    <div class="item-options">
                        <div class="option-group">
                            <label>Size:</label>
                            <select class="size-select" data-index="${index}">
                                ${['S', 'M', 'L', 'XL', 'XXL'].map(size => 
                                    `<option value="${size}" ${item.size === size ? 'selected' : ''}>${size}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="option-group">
                            <label>Color:</label>
                            <select class="color-select" data-index="${index}">
                                ${['Black', 'White', 'Red', 'Skyblue', 'Beige'].map(color => 
                                    `<option value="${color}" ${item.color === color ? 'selected' : ''}>${color}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-index="${index}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                    </div>
                </div>
                <div class="item-total">
                    <p>₹${(item.price * item.quantity).toFixed(2)}</p>
                    <button class="remove-item" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        updateTotals();
        setupEventListeners();
    }

    function updateTotals() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = cart.length > 0 ? 50 : 0;
        const total = subtotal + shipping;

        document.querySelector('.subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.querySelector('.shipping').textContent = `₹${shipping.toFixed(2)}`;
        document.querySelector('.amount').textContent = total.toFixed(2);
        
        const checkoutBtn = document.querySelector('.checkout-btn');
        checkoutBtn.disabled = cart.length === 0;
    }

    function updateCartCount() {
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelector('.cart-count').textContent = cartCount;
    }

    function setupEventListeners() {
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', handleQuantityChange);
        });

        document.querySelectorAll('.size-select').forEach(select => {
            select.addEventListener('change', handleSizeChange);
        });

        document.querySelectorAll('.color-select').forEach(select => {
            select.addEventListener('change', handleColorChange);
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', handleRemoveItem);
        });
    }

    function handleQuantityChange(e) {
        const index = parseInt(e.target.dataset.index);
        
        if (e.target.classList.contains('plus') && cart[index].quantity < 10) {
            cart[index].quantity++;
        } else if (e.target.classList.contains('minus') && cart[index].quantity > 1) {
            cart[index].quantity--;
        }

        saveCartAndUpdate();
    }

    function handleSizeChange(e) {
        const index = parseInt(e.target.dataset.index);
        cart[index].size = e.target.value;
        saveCartAndUpdate();
    }

    function handleColorChange(e) {
        const index = parseInt(e.target.dataset.index);
        cart[index].color = e.target.value;
        saveCartAndUpdate();
    }

    function handleRemoveItem(e) {
        const index = parseInt(e.target.closest('.remove-item').dataset.index);
        cart.splice(index, 1);
        saveCartAndUpdate();
    }

    function saveCartAndUpdate() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    }

    // Add checkout button event listener
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                cartContainer.style.display = 'none';
                emptyCartMessage.style.display = 'none';
                checkoutFormContainer.style.display = 'block';
                updateSteps('checkout');
                
                document.getElementById('orderDetails').value = JSON.stringify(cart);
                document.getElementById('totalAmount').value = document.querySelector('.amount').textContent;
            }
        });
    }

    // Add back to cart button handler
    const backToCartBtn = document.querySelector('.back-to-cart');
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', () => {
            cartContainer.style.display = 'grid';
            emptyCartMessage.style.display = 'none';
            checkoutFormContainer.style.display = 'none';
            updateSteps('cart');
        });
    }

    // Handle form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            try {
                const response = await fetch('process_checkout.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    updateSteps('confirmation');
                    
                    const orderData = {
                        orderId: result.order_id,
                        totalAmount: formData.get('totalAmount'),
                        customerInfo: {
                            name: formData.get('name'),
                            phone: formData.get('phone'),
                            email: formData.get('email'),
                            address: formData.get('address'),
                            pincode: formData.get('pincode')
                        }
                    };

                    showConfirmationPopup(orderData);
                    
                    // Clear cart
                    cart = [];
                    localStorage.removeItem('cart');
                    updateCartCount();
                } else {
                    const errorMessage = result.errors ? result.errors.join('\n') : 'Order processing failed';
                    alert('Error: ' + errorMessage);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error processing order. Please try again.');
            }
        });

        // Add input validation
        const inputs = checkoutForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('invalid', (e) => {
                e.target.classList.add('error');
            });
            
            input.addEventListener('input', (e) => {
                if (e.target.validity.valid) {
                    e.target.classList.remove('error');
                }
            });
        });
    }

    // Initialize cart
    updateCart();
});