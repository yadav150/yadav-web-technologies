/* ============================================================
   MOBILE NAVIGATION — Hamburger menu
   ============================================================ */
(function () {
    'use strict';

    const isMobile = () => window.innerWidth <= 900;
    const hamburger = document.querySelector('.hamburger');
    const nav = document.getElementById('primary-nav');

    if (!hamburger || !nav) return;

    const setNavState = (open) => {
        nav.classList.toggle('is-open', open);
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.style.overflow = open && isMobile() ? 'hidden' : '';
    };

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        setNavState(!nav.classList.contains('is-open'));
    });

    document.addEventListener('click', (e) => {
        if (nav.classList.contains('is-open') &&
            !nav.contains(e.target) &&
            !hamburger.contains(e.target)) {
            setNavState(false);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) {
            setNavState(false);
            hamburger.focus();
        }
    });

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            if (isMobile()) setNavState(false);
        });
    });

    window.addEventListener('resize', () => {
        if (!isMobile()) setNavState(false);
    });

    /* Header scroll state */
    const header = document.querySelector('.site-header');
    if (header) {
        const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }
})();
