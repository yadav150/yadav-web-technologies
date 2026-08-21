/* ============================================================
   YADAV WEB TECHNOLOGIES – Global Script
   Hamburger, Ripple, Scroll-Reveal, Dark/Light Mode Toggle
   ============================================================ */

(function() {
    'use strict';

    // ============================================================
    // 1. HAMBURGER NAV
    // ============================================================
    const hamburger = document.querySelector('.hamburger');
    const nav = document.getElementById('primary-nav');

    if (hamburger && nav) {
        // Close nav when clicking outside
        const closeNav = function(e) {
            if (nav.classList.contains('open') && 
                !nav.contains(e.target) && 
                !hamburger.contains(e.target)) {
                nav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        };

        // Toggle on hamburger click
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = nav.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close on outside click
        document.addEventListener('click', closeNav);

        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                nav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.focus();
            }
        });

        // Close nav when any nav link is clicked (for mobile)
        nav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                nav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ============================================================
    // 2. BUTTON RIPPLE EFFECT
    // ============================================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    document.addEventListener('click', function(e) {
        if (prefersReducedMotion.matches) return;

        const btn = e.target.closest('.btn');
        if (!btn) return;
        if (btn.disabled) return;

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
            // If reduced motion is preferred, show all immediately
            revealElements.forEach(function(el) {
                el.classList.add('visible');
            });
        } else {
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -20px 0px'
            });

            revealElements.forEach(function(el) {
                observer.observe(el);
            });
        }
    } else {
        // Fallback: show all if IntersectionObserver not supported
        revealElements.forEach(function(el) {
            el.classList.add('visible');
        });
    }

    // ============================================================
    // 4. DARK / LIGHT MODE TOGGLE
    // ============================================================
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // Check saved preference or system preference
    const getStoredTheme = function() {
        return localStorage.getItem('ywt-theme') || null;
    };

    const getSystemTheme = function() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    };

    const setTheme = function(theme) {
        if (theme === 'dark') {
            html.classList.add('dark-mode');
            localStorage.setItem('ywt-theme', 'dark');
        } else {
            html.classList.remove('dark-mode');
            localStorage.setItem('ywt-theme', 'light');
        }
        // Update toggle button icon/text if needed (optional)
        updateToggleButton(theme);
    };

    const updateToggleButton = function(theme) {
        if (!themeToggle) return;
        // We can update inner HTML or just rely on CSS for icon.
        // For simplicity, we'll set a data attribute or change text.
        if (theme === 'dark') {
            themeToggle.setAttribute('aria-label', 'Switch to light mode');
            // Optionally update inner SVG if we use inline icons
        } else {
            themeToggle.setAttribute('aria-label', 'Switch to dark mode');
        }
    };

    // Initialize theme
    let initialTheme = getStoredTheme();
    if (!initialTheme) {
        initialTheme = getSystemTheme();
    }
    setTheme(initialTheme);

    // Toggle on button click
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = html.classList.contains('dark-mode') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }

    // Listen for system theme changes (optional)
    if (window.matchMedia) {
        const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeMedia.addEventListener('change', function(e) {
            // Only change if user hasn't manually set a preference
            if (!localStorage.getItem('ywt-theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                setTheme(newTheme);
            }
        });
    }

    // ============================================================
    // 5. CONTACT FORM (demo submission with feedback)
    // ============================================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = contactForm.querySelector('.btn[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Sending...';
            btn.disabled = true;

            // Simulate sending
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
