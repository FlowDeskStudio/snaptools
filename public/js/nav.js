// Mobile hamburger menu & dropdown toggle — iOS Safari compatible
(function () {
    function init() {
        var hamburger = document.querySelector('.hamburger-btn');
        var nav = document.querySelector('.site-header nav');
        var overlay = document.querySelector('.nav-overlay');

        if (!hamburger || !nav) return;

        // Toggle mobile menu
        hamburger.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            hamburger.classList.toggle('active');
            nav.classList.toggle('open');
            if (overlay) overlay.classList.toggle('open');
        }, false);

        // Close when clicking overlay
        if (overlay) {
            overlay.addEventListener('click', function () {
                hamburger.classList.remove('active');
                nav.classList.remove('open');
                overlay.classList.remove('open');
                // Close all dropdowns
                var openDropdowns = document.querySelectorAll('.nav-dropdown.open');
                for (var i = 0; i < openDropdowns.length; i++) {
                    openDropdowns[i].classList.remove('open');
                }
            }, false);
        }

        // Dropdown toggle on click (for mobile & touch devices)
        var dropdownLinks = document.querySelectorAll('.nav-dropdown > a');
        for (var i = 0; i < dropdownLinks.length; i++) {
            (function (link) {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var parent = link.parentElement;
                    // Close other dropdowns
                    var allDropdowns = document.querySelectorAll('.nav-dropdown');
                    for (var j = 0; j < allDropdowns.length; j++) {
                        if (allDropdowns[j] !== parent) {
                            allDropdowns[j].classList.remove('open');
                        }
                    }
                    // Toggle this dropdown
                    parent.classList.toggle('open');
                    return false;
                }, false);

                // Also handle touchend for iOS Safari
                link.addEventListener('touchend', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var parent = link.parentElement;
                    var allDropdowns = document.querySelectorAll('.nav-dropdown');
                    for (var j = 0; j < allDropdowns.length; j++) {
                        if (allDropdowns[j] !== parent) {
                            allDropdowns[j].classList.remove('open');
                        }
                    }
                    parent.classList.toggle('open');
                    return false;
                }, false);
            })(dropdownLinks[i]);
        }

        // Close dropdowns when clicking outside (desktop)
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.nav-dropdown') && !e.target.closest('.hamburger-btn')) {
                var openDropdowns = document.querySelectorAll('.nav-dropdown.open');
                for (var i = 0; i < openDropdowns.length; i++) {
                    openDropdowns[i].classList.remove('open');
                }
            }
        }, false);
    }

    // Run immediately if DOM already loaded, otherwise wait
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
