// i18n.js — Lightweight vanilla JS internationalization engine for devsnap.net
// No external libraries. Uses data-i18n attributes on HTML elements.

(function () {
    'use strict';

    const DEFAULT_LANG = 'en';
    const SUPPORTED_LANGS = ['en', 'ja'];

    /**
     * Apply translations to all elements with [data-i18n] attributes.
     * The `translations` object must be defined on the page before this runs.
     * @param {string} lang — Language code ('en' or 'ja')
     */
    function setLanguage(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;

        localStorage.setItem('devsnap_lang', lang);
        document.documentElement.lang = lang;

        // Translations object is expected to be defined per page
        if (typeof window._i18n === 'undefined') return;

        const dict = window._i18n[lang];
        if (!dict) return;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key] !== undefined) {
                // Support innerHTML for keys ending with _html
                if (key.endsWith('_html')) {
                    el.innerHTML = dict[key];
                } else {
                    el.textContent = dict[key];
                }
            }
        });

        // Update placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key] !== undefined) {
                el.placeholder = dict[key];
            }
        });

        // Update title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (dict[key] !== undefined) {
                el.title = dict[key];
            }
        });

        // Update page <title> and meta description
        if (dict._pageTitle) {
            document.title = dict._pageTitle;
        }
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && dict._pageDescription) {
            metaDesc.setAttribute('content', dict._pageDescription);
        }

        // Update lang switcher active state
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
    }

    /**
     * Get the current language from localStorage, fallback to default.
     */
    function getCurrentLang() {
        return localStorage.getItem('devsnap_lang') || DEFAULT_LANG;
    }

    // Expose globally
    window.setLanguage = setLanguage;
    window.getCurrentLang = getCurrentLang;

    // Auto-apply on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        const lang = getCurrentLang();

        // Bind lang switcher buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setLanguage(btn.dataset.lang);
            });
        });

        // Apply saved language
        setLanguage(lang);
    });
})();
