// Store cart data in localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(product) {
    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex(item => 
        item.name === product.name && 
        item.size === product.size && 
        item.color === product.color
    );
    
    if (existingProductIndex > -1) {
        // Update quantity if total doesn't exceed 10
        if (cart[existingProductIndex].quantity < 10) {
            cart[existingProductIndex].quantity++;
        }
    } else {
        // Add new product to cart
        cart.push({
            ...product,
            quantity: 1,
            size: 'M',
            color: 'Black'
        });
    }
    
    // Update localStorage and cart count
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show notification
    showCartPopup();
}

function showCartPopup() {
    // Remove existing popup if any
    const existingPopup = document.querySelector('.cart-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'cart-popup';

    // Calculate cart total and items
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Create popup content
    let popupContent = `
        <div class="popup-header">
            <h3>Cart Overview</h3>
            <button class="popup-close">&times;</button>
        </div>
        <div class="popup-content">
            <div class="cart-summary">
                <span>${itemCount} item${itemCount !== 1 ? 's' : ''} in cart</span>
                <span class="cart-total">₹${cartTotal.toFixed(2)}</span>
            </div>
            <div class="recent-items">
    `;

    // Add last 2 items from cart
    const recentItems = cart.slice(-2).reverse();
    recentItems.forEach(item => {
        popupContent += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">₹${item.price.toFixed(2)} × ${item.quantity}</span>
                </div>
            </div>
        `;
    });

    popupContent += `
            </div>
            <a href="cart.html" class="view-cart-btn">View Cart</a>
        </div>
    `;

    popup.innerHTML = popupContent;
    document.body.appendChild(popup);

    // Add event listeners
    const closeBtn = popup.querySelector('.popup-close');
    closeBtn.addEventListener('click', () => {
        popup.classList.add('popup-fade-out');
        setTimeout(() => popup.remove(), 300);
    });

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (document.body.contains(popup)) {
            popup.classList.add('popup-fade-out');
            setTimeout(() => popup.remove(), 300);
        }
    }, 5000);

    // Prevent auto-dismiss on hover
    popup.addEventListener('mouseenter', () => {
        popup.classList.add('popup-hover');
    });

    popup.addEventListener('mouseleave', () => {
        popup.classList.remove('popup-hover');
        setTimeout(() => {
            if (document.body.contains(popup) && !popup.classList.contains('popup-hover')) {
                popup.classList.add('popup-fade-out');
                setTimeout(() => popup.remove(), 300);
            }
        }, 2000);
    });
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Regular product cards
    document.querySelectorAll('.product-card .add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const product = {
                name: productCard.querySelector('h3').textContent,
                price: parseFloat(productCard.querySelector('p').textContent.replace('₹', '')),
                image: productCard.querySelector('img').src
            };
            addToCart(product);
            button.classList.add('added-to-cart');
            setTimeout(() => button.classList.remove('added-to-cart'), 1000);
        });
    });

    // Limited edition and new arrival cards
    document.querySelectorAll('.limited-edition-card .add-to-cart, .new-arrival-card .add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.limited-edition-card, .new-arrival-card');
            const product = {
                name: card.querySelector('h3').textContent,
                price: parseFloat(card.querySelector('.product-price').dataset.price),
                image: card.querySelector('img').src
            };
            addToCart(product);
            button.classList.add('added-to-cart');
            setTimeout(() => button.classList.remove('added-to-cart'), 1000);
        });
    });

    updateCartCount();
});

function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}