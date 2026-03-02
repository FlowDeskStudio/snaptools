// Mobile hamburger menu & dropdown toggle — iOS Safari compatible
(function () {
    function init() {
        var hamburger = document.querySelector('.hamburger-btn');
        var nav = document.querySelector('.site-header nav');
        var overlay = document.querySelector('.nav-overlay');
        if (!hamburger || !nav) return;

        // --- Hamburger toggle ---
        hamburger.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var isOpen = nav.classList.toggle('open');
            hamburger.classList.toggle('active', isOpen);
            if (overlay) overlay.classList.toggle('open', isOpen);
        });

        // --- Close on overlay tap ---
        if (overlay) {
            overlay.addEventListener('click', function () {
                closeMenu();
            });
        }

        // --- Dropdown toggle (click only, no touchend to avoid double-fire) ---
        var dropdownLinks = document.querySelectorAll('.nav-dropdown > a');
        for (var i = 0; i < dropdownLinks.length; i++) {
            dropdownLinks[i].setAttribute('href', 'javascript:void(0)');
            dropdownLinks[i].addEventListener('click', handleDropdownClick);
        }

        function handleDropdownClick(e) {
            e.preventDefault();
            e.stopPropagation();
            var parent = this.parentElement;

            // Close all other dropdowns
            var all = document.querySelectorAll('.nav-dropdown.open');
            for (var j = 0; j < all.length; j++) {
                if (all[j] !== parent) all[j].classList.remove('open');
            }

            // Toggle this one
            parent.classList.toggle('open');
        }

        // --- Close dropdowns on outside click ---
        document.addEventListener('click', function (e) {
            // Don't close if clicking inside a dropdown or the hamburger
            if (e.target.closest && e.target.closest('.nav-dropdown')) return;
            if (e.target.closest && e.target.closest('.hamburger-btn')) return;

            var openDropdowns = document.querySelectorAll('.nav-dropdown.open');
            for (var i = 0; i < openDropdowns.length; i++) {
                openDropdowns[i].classList.remove('open');
            }
        });

        function closeMenu() {
            nav.classList.remove('open');
            hamburger.classList.remove('active');
            if (overlay) overlay.classList.remove('open');
            var openDropdowns = document.querySelectorAll('.nav-dropdown.open');
            for (var i = 0; i < openDropdowns.length; i++) {
                openDropdowns[i].classList.remove('open');
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
