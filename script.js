/* ============================================================
   YADAV WEB TECHNOLOGIES – Global Script
   Hamburger, Ripple, Scroll-Reveal, Dark/Light Mode, Form
   ============================================================ */

(function() {
    'use strict';

    // ============================================================
    // 1. HAMBURGER NAV (Fixed)
    // ============================================================
    const hamburger = document.querySelector('.hamburger');
    const nav = document.getElementById('primary-nav');

    if (hamburger && nav) {
        const toggleNav = function(forceOpen) {
            const isOpen = typeof forceOpen === 'boolean' ? forceOpen : !nav.classList.contains('open');
            nav.classList.toggle('open', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        };

        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleNav();
        });

        // Close on outside click
        document.addEventListener('click', function(e) {
            if (nav.classList.contains('open') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
                toggleNav(false);
            }
        });

        // Close on Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                toggleNav(false);
                hamburger.focus();
            }
        });

        // Close nav when a link is clicked (mobile)
        nav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                if (window.innerWidth < 640) {
                    toggleNav(false);
                }
            });
        });

        // On resize, if screen becomes wide, ensure nav is open if it was open? Actually we keep default behavior: on wide screen, nav is always visible via CSS, so we shouldn't toggle.
        // We'll keep the JS toggling only for mobile, but we also need to sync state on resize.
        // Better: if screen becomes wide, we can leave nav as is; CSS will show it.
        // But if the nav was closed on mobile and then resized to wide, it should be visible. So we may need to remove the open class when resizing to wide.
        // However, the primary-nav has max-height: none on wide screens, so it's always visible regardless of class. So we don't need to remove class.
        // We'll leave it.
    }

    // ============================================================
    // 2. BUTTON RIPPLE
    // ============================================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    document.addEventListener('click', function(e) {
        if (prefersReducedMotion.matches) return;

        const btn = e.target.closest('.btn');
        if (!btn || btn.disabled) return;

        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 0.6;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        btn.appendChild(ripple);

        ripple.addEventListener('animationend', function() {
            ripple.remove();
        });
    });

    // ============================================================
    // 3. SCROLL REVEAL
    // ============================================================
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
        if (prefersReducedMotion.matches) {
            revealElements.forEach(function(el) { el.classList.add('visible'); });
        } else {
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

            revealElements.forEach(function(el) {
                observer.observe(el);
            });
        }
    } else {
        revealElements.forEach(function(el) { el.classList.add('visible'); });
    }

    // ============================================================
    // 4. DARK / LIGHT MODE TOGGLE (Fixed & Persistent)
    // ============================================================
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    const getStoredTheme = function() {
        return localStorage.getItem('ywt-theme') || null;
    };

    const getSystemTheme = function() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const setTheme = function(theme) {
        if (theme === 'dark') {
            html.classList.add('dark-mode');
            localStorage.setItem('ywt-theme', 'dark');
        } else {
            html.classList.remove('dark-mode');
            localStorage.setItem('ywt-theme', 'light');
        }
        updateToggleButton(theme);
    };

    const updateToggleButton = function(theme) {
        if (!themeToggle) return;
        themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    };

    // Init
    let initialTheme = getStoredTheme() || getSystemTheme();
    setTheme(initialTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = html.classList.contains('dark-mode') ? 'dark' : 'light';
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    // Listen for system changes only if no manual override
    if (window.matchMedia) {
        const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeMedia.addEventListener('change', function(e) {
            if (!localStorage.getItem('ywt-theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // ============================================================
    // 5. CONTACT FORM (demo submission)
    // ============================================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = contactForm.querySelector('.btn[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Sending...';
            btn.disabled = true;

            setTimeout(function() {
                btn.innerHTML = '✓ Sent!';
                btn.style.background = '#22c55e';
                setTimeout(function() {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                    contactForm.reset();
                }, 2000);
            }, 1500);
        });
    }

})();
