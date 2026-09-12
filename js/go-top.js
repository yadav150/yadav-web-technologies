/* ============================================================
   BACK TO TOP BUTTON
   ============================================================ */
(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const backToTop = document.querySelector('.back-to-top');
    if (!backToTop) return;

    const toggleBTT = () => {
        backToTop.classList.toggle('is-visible', window.scrollY > 400);
    };

    window.addEventListener('scroll', toggleBTT, { passive: true });
    toggleBTT();

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: prefersReduced ? 'auto' : 'smooth'
        });
    });
})();
