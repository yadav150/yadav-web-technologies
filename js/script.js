/* ============================================================
   YADAV WEB TECHNOLOGIES — Global Script
   Theme toggle · Scroll reveal · Scroll progress · Card tilt
   ============================================================ */
(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = () => window.innerWidth <= 900;

    /* ============================================================
       1. DARK / LIGHT MODE TOGGLE
       ============================================================ */
    const themeBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;
    const THEME_KEY = 'ywt-theme';

    const getSystemTheme = () =>
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark' : 'light';

    const applyTheme = (theme, persist = true) => {
        root.classList.toggle('dark-mode', theme === 'dark');
        if (persist) localStorage.setItem(THEME_KEY, theme);
        if (themeBtn) {
            themeBtn.setAttribute('aria-label',
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        }
    };

    const stored = localStorage.getItem(THEME_KEY);
    applyTheme(stored || getSystemTheme(), !!stored);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            applyTheme(root.classList.contains('dark-mode') ? 'light' : 'dark');
        });
    }

    if (window.matchMedia) {
        const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeMedia.addEventListener('change', (e) => {
            if (!localStorage.getItem(THEME_KEY)) {
                applyTheme(e.matches ? 'dark' : 'light', false);
            }
        });
    }

    /* ============================================================
       2. SCROLL REVEAL
       ============================================================ */
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length && 'IntersectionObserver' in window && !prefersReduced) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        revealEls.forEach((el) => io.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    /* ============================================================
       3. SCROLL PROGRESS BAR
       ============================================================ */
    const progress = document.querySelector('.scroll-progress');
    if (progress) {
        const updateProgress = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        window.addEventListener('resize', updateProgress);
        updateProgress();
    }

    /* ============================================================
       4. CARD 3D TILT (desktop only)
       ============================================================ */
    if (!prefersReduced && !isMobile()) {
        document.querySelectorAll('.card').forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width - 0.5) * 6;
                const y = ((e.clientY - r.top) / r.height - 0.5) * -6;
                card.style.transform =
                    `translateY(-6px) perspective(800px) rotateX(${y}deg) rotateY(${x}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* ============================================================
       5. SMOOTH ANCHOR LINKS
       ============================================================ */
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            if (id && id.length > 1) {
                const el = document.querySelector(id);
                if (el) {
                    e.preventDefault();
                    el.scrollIntoView({
                        behavior: prefersReduced ? 'auto' : 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
})();
