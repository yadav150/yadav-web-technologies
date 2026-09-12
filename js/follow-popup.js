/* ============================================================
   FOLLOW POPUP — Yadav Web Technologies
   ============================================================ */
(function () {
    'use strict';

    const STORAGE_KEY = 'ywt-follow-popup-dismissed';
    const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    const popup = document.querySelector('.follow-popup');
    if (!popup) return;

    const closeBtn = popup.querySelector('[data-popup-close]');

    /* Check if dismissed recently */
    const checkDismissed = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return false;
            const dismissedAt = parseInt(stored, 10);
            if (isNaN(dismissedAt)) return false;
            return Date.now() - dismissedAt < DISMISS_DURATION;
        } catch (e) {
            return false;
        }
    };

    /* Mark dismissed */
    const markDismissed = () => {
        try {
            localStorage.setItem(STORAGE_KEY, Date.now().toString());
        } catch (e) {}
    };

    /* Hide popup */
    const hidePopup = () => {
        popup.classList.remove('is-visible');
        markDismissed();
    };

    /* Show popup */
    const showPopup = () => {
        popup.classList.add('is-visible');
    };

    /* Close button */
    if (closeBtn) {
        closeBtn.addEventListener('click', hidePopup);
    }

    /* Auto-hide after 12 seconds */
    let autoHideTimer = null;
    const startAutoHide = () => {
        autoHideTimer = setTimeout(hidePopup, 12000);
    };

    /* Show popup after delay (if not dismissed) */
    if (!checkDismissed()) {
        setTimeout(() => {
            showPopup();
            startAutoHide();
        }, 6000);
    }

    /* Pause auto-hide on hover */
    popup.addEventListener('mouseenter', () => {
        if (autoHideTimer) clearTimeout(autoHideTimer);
    });
    popup.addEventListener('mouseleave', () => {
        if (popup.classList.contains('is-visible')) startAutoHide();
    });

    /* Escape key */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.classList.contains('is-visible')) {
            hidePopup();
        }
    });
})();
