/* ============================================================
   YADAV WEB TECHNOLOGIES — Modern Interaction Layer
   ============================================================ */
(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = () => window.innerWidth <= 900;

    /* 1. MOBILE NAVIGATION */
    const hamburger = document.querySelector('.hamburger');
    const nav = document.getElementById('primary-nav');

    if (hamburger && nav) {
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
                !nav.contains(e.target) && !hamburger.contains(e.target)) {
                setNavState(false);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('is-open')) {
                setNavState(false);
                hamburger.focus();
            }
        });

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (isMobile()) setNavState(false);
            });
        });

        window.addEventListener('resize', () => {
            if (!isMobile()) setNavState(false);
        });
    }

    /* 2. STICKY HEADER STATE */
    const header = document.querySelector('.site-header');
    const onScroll = () => {
        if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* 3. SCROLL PROGRESS BAR */
    const progress = document.querySelector('.scroll-progress');
    if (progress) {
        const updateProgress = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
            progress.style.width = pct + '%';
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        window.addEventListener('resize', updateProgress);
        updateProgress();
    }

    /* 4. SCROLL REVEAL */
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length && 'IntersectionObserver' in window && !prefersReduced) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-visible'));
    }

    /* 5. THEME TOGGLE */
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
            const next = root.classList.contains('dark-mode') ? 'light' : 'dark';
            applyTheme(next);
        });
    }

    /* 6. BACK TO TOP */
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        const toggleBTT = () => {
            backToTop.classList.toggle('is-visible', window.scrollY > 400);
        };
        window.addEventListener('scroll', toggleBTT, { passive: true });
        toggleBTT();
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
        });
    }

    /* 7. CARD 3D TILT (desktop only) */
    if (!prefersReduced && !isMobile()) {
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width - 0.5) * 6;
                const y = ((e.clientY - r.top) / r.height - 0.5) * -6;
                card.style.transform = `translateY(-6px) perspective(800px) rotateX(${y}deg) rotateY(${x}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* 8. SMOOTH ANCHOR LINKS */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            if (id.length > 1) {
                const el = document.querySelector(id);
                if (el) {
                    e.preventDefault();
                    el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
                }
            }
        });
    });

    /* 9. CONTACT FORM */
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const original = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = 'Sending...';
            setTimeout(() => {
                btn.innerHTML = 'Sent';
                btn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
                setTimeout(() => {
                    btn.innerHTML = original;
                    btn.style.background = '';
                    btn.disabled = false;
                    form.reset();
                }, 2000);
            }, 1200);
        });
    }

})();
