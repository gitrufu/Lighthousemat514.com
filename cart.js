document.addEventListener('DOMContentLoaded', () => {
    const cartItems = document.querySelector('.cart-items');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const cartContainer = document.querySelector('.cart-container');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const checkoutFormContainer = document.querySelector('.checkout-form-container');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    function updateCart() {
        if (cart.length === 0) {
            cartContainer.style.display = 'none';
            emptyCartMessage.style.display = 'flex';
            checkoutFormContainer.style.display = 'none';
            updateCartCount();
            return;
        }

        cartContainer.style.display = 'grid';
        emptyCartMessage.style.display = 'none';
        checkoutFormContainer.style.display = 'none';
        updateCartCount();
        
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
        document.querySelector('.total-amount').textContent = `₹${total.toFixed(2)}`;
        
        // Enable/disable checkout button based on cart contents
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
        const index = parseInt(e.target.dataset.index);
        cart.splice(index, 1);
        saveCartAndUpdate();
    }

    function saveCartAndUpdate() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    }

    // Add this function to calculate total
    function calculateTotal() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = cart.length > 0 ? 50 : 0;
        return (subtotal + shipping).toFixed(2);
    }

    // Update the checkout button event listener
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                cartContainer.style.display = 'none';
                emptyCartMessage.style.display = 'none';
                checkoutFormContainer.style.display = 'block';
                
                // Set hidden form values
                document.getElementById('orderDetails').value = JSON.stringify(cart);
                document.getElementById('totalAmount').value = calculateTotal();
                
                // Log for debugging
                console.log('Checkout button clicked');
                console.log('Cart container display:', cartContainer.style.display);
                console.log('Checkout form display:', checkoutFormContainer.style.display);
            }
        });
    }

    // Update form submission handler
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
                console.log('Server response:', result); // Add this for debugging
                
                if (result.success) {
                    // Clear cart
                    cart = [];
                    localStorage.removeItem('cart');
                    
                    // Show success message and redirect
                    alert('Order placed successfully! Order ID: ' + result.order_id);
                    window.location.href = 'index.html';
                } else {
                    const errorMessage = result.errors ? result.errors.join('\n') : 'Order processing failed';
                    alert('Error: ' + errorMessage);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error processing order. Please try again.');
            }
        });

        // Add input validation for the form
        const inputs = checkoutForm.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            // Prevent paste of invalid characters
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text');
                
                // Filter based on input type
                let filteredText;
                switch(input.id) {
                    case 'name':
                        filteredText = text.replace(/[^A-Za-z\s]/g, '');
                        break;
                    case 'mobile':
                    case 'pincode':
                        filteredText = text.replace(/[^0-9]/g, '');
                        break;
                    case 'email':
                        filteredText = text.replace(/[^a-zA-Z0-9@._-]/g, '');
                        break;
                    case 'address':
                        filteredText = text.replace(/[^A-Za-z0-9\s,.-]/g, '');
                        break;
                    default:
                        filteredText = text;
                }
                
                // Insert filtered text
                if (filteredText) {
                    const start = input.selectionStart;
                    const end = input.selectionEnd;
                    input.value = input.value.slice(0, start) + 
                                filteredText + 
                                input.value.slice(end);
                    input.setSelectionRange(start + filteredText.length, 
                                         start + filteredText.length);
                }
            });

            // Real-time validation feedback
            input.addEventListener('input', () => {
                if (input.validity.valid) {
                    input.classList.remove('invalid');
                    input.classList.add('valid');
                } else {
                    input.classList.remove('valid');
                    input.classList.add('invalid');
                }
            });
        });
    }

    // Update back to cart button handler
    const backToCartBtn = document.querySelector('.back-to-cart');
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', () => {
            checkoutFormContainer.style.display = 'none';
            cartContainer.style.display = 'grid';
            console.log('Back to cart clicked');
        });
    }

    // Initialize cart
    updateCart();
}); 