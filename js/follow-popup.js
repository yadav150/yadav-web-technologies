/* =================================================
   FOLLOW US POPUP
   Shows once per browser session, after 5 seconds.
   Uses sessionStorage — new tab / new browser session
   will show it again.
================================================= */

(function () {
    "use strict";

    const SESSION_KEY = "ywt_follow_popup_seen";
    const DELAY_MS = 5000; // 5 seconds
    const FACEBOOK_URL = "https://www.facebook.com/share/1HPZKJK8Nx/";

    // ----- If already shown in this session, exit -----
    try {
        if (sessionStorage.getItem(SESSION_KEY) === "1") {
            return;
        }
    } catch (e) {
        // sessionStorage may be disabled — proceed anyway
    }

    // ----- Build the popup DOM -----
    function createPopup() {
        // Overlay
        const overlay = document.createElement("div");
        overlay.className = "follow-popup-overlay";

        // Popup box
        const popup = document.createElement("div");
        popup.className = "follow-popup";
        popup.setAttribute("role", "dialog");
        popup.setAttribute("aria-labelledby", "followPopupTitle");

        popup.innerHTML = `
            <button
                type="button"
                class="follow-popup-close"
                aria-label="Close follow popup">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2.4" stroke-linecap="round">
                    <path d="M6 6l12 12"></path>
                    <path d="M18 6L6 18"></path>
                </svg>
            </button>

            <div class="follow-popup-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9v-2.89h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.89h-2.33v6.99C18.34 21.13 22 16.99 22 12z"/>
                </svg>
            </div>

            <h3 id="followPopupTitle">Follow Us on Facebook</h3>
            <p>For latest information, updates, and news — follow us on Facebook.</p>

            <a
                href="${FACEBOOK_URL}"
                target="_blank"
                rel="noopener noreferrer"
                class="follow-popup-link">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9v-2.89h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.89h-2.33v6.99C18.34 21.13 22 16.99 22 12z"/>
                </svg>
                Follow Us
            </a>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        return { overlay, popup };
    }

    // ----- Show popup -----
    function showPopup() {
        const { overlay, popup } = createPopup();

        // Trigger animation on next frame
        requestAnimationFrame(() => {
            overlay.classList.add("show");
            popup.classList.add("show");
        });

        // Mark as seen for this session
        try {
            sessionStorage.setItem(SESSION_KEY, "1");
        } catch (e) {}

        // Close handlers
        function closePopup() {
            popup.classList.remove("show");
            overlay.classList.remove("show");
            setTimeout(() => {
                popup.remove();
                overlay.remove();
            }, 400);
        }

        const closeBtn = popup.querySelector(".follow-popup-close");
        if (closeBtn) closeBtn.addEventListener("click", closePopup);
        overlay.addEventListener("click", closePopup);

        document.addEventListener("keydown", function escHandler(e) {
            if (e.key === "Escape") {
                closePopup();
                document.removeEventListener("keydown", escHandler);
            }
        });
    }

    // ----- Wait 5 seconds and show -----
    function init() {
        setTimeout(showPopup, DELAY_MS);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
