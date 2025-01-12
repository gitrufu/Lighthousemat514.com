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
    showAddToCartNotification();
}

function showAddToCartNotification() {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.cart-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    
    // Get the product count and latest added item
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const latestItem = cart[cart.length - 1];
    const itemText = cartCount === 1 ? 'item' : 'items';
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-check-circle success-icon"></i>
        </div>
        <div class="notification-content">
            <div class="notification-header">
                <span class="notification-title">Added to Cart!</span>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <p class="notification-message">${latestItem.name} has been added to your cart</p>
            <a href="cart.html" class="view-cart-link">
                View Cart (${cartCount} ${itemText}) <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add click handler for close button
    notification.querySelector('.notification-close').addEventListener('click', (e) => {
        e.stopPropagation();
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    });

    // Auto-dismiss after 4 seconds
    const dismissTimeout = setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);

    // Clear timeout if user interacts with notification
    notification.addEventListener('mouseenter', () => {
        clearTimeout(dismissTimeout);
    });

    // Resume timeout when mouse leaves
    notification.addEventListener('mouseleave', () => {
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
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