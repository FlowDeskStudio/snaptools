// Mobile hamburger menu & dropdown toggle
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger-btn');
    const nav = document.querySelector('.site-header nav');
    const overlay = document.querySelector('.nav-overlay');

    if (!hamburger || !nav) return;

    // Toggle mobile menu
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        nav.classList.toggle('open');
        if (overlay) overlay.classList.toggle('open');
    });

    // Close when clicking overlay
    if (overlay) {
        overlay.addEventListener('click', () => {
            hamburger.classList.remove('active');
            nav.classList.remove('open');
            overlay.classList.remove('open');
        });
    }

    // Dropdown toggle on click (for mobile & touch)
    document.querySelectorAll('.nav-dropdown > a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const parent = link.closest('.nav-dropdown');
            // Close others
            document.querySelectorAll('.nav-dropdown').forEach(d => {
                if (d !== parent) d.classList.remove('open');
            });
            parent.classList.toggle('open');
        });
    });

    // Close dropdowns when clicking outside (desktop)
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
        }
    });
});
