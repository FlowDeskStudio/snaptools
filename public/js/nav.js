// Mobile hamburger menu toggle
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
                nav.classList.remove('open');
                hamburger.classList.remove('active');
                overlay.classList.remove('open');

                // Also close any open details/summary dropdowns
                var openDetails = nav.querySelectorAll('details[open]');
                for (var i = 0; i < openDetails.length; i++) {
                    openDetails[i].removeAttribute('open');
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

