document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navRight = document.querySelector('.nav-right');
    
    // Toggle menu
    mobileMenuBtn.addEventListener('click', () => {
        navRight.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    // Handle nav link clicks
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            // Only handle hash links
            if (link.getAttribute('href').includes('#')) {
                e.preventDefault();
                
                // Close mobile menu
                navRight.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.classList.remove('menu-open');
                
                // Get the target section
                const targetId = link.getAttribute('href').split('#')[1];
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    // Smooth scroll to section
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                } else if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
                    // If we're not on index.html, redirect with the hash
                    window.location.href = 'index.html#' + targetId;
                }
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navRight.classList.contains('active') && 
            !navRight.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            navRight.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
}); 