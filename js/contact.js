/* ============================================================
   CONTACT — Firebase integration
   Yadav Web Technologies
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
    getDatabase,
    ref,
    push,
    set
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

/* ===== FIREBASE CONFIG ===== */
const firebaseConfig = {
    apiKey: "AIzaSyDFnxF_v-fXGiZeL_OEMzmKrPdR1PE3KfU",
    authDomain: "auth-project-by-yadav.firebaseapp.com",
    projectId: "auth-project-by-yadav",
    storageBucket: "auth-project-by-yadav.firebasestorage.app",
    messagingSenderId: "351339588417",
    appId: "1:351339588417:web:ab20ea055457d03370cfc0",
    measurementId: "G-NR5Z7R2P19"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/* ===== DOM REFS ===== */
const contactForm = document.getElementById("contactForm");
const contactMessage = document.getElementById("contactMessage");
const successOverlay = document.getElementById("successOverlay");
const successClose = document.getElementById("successClose");

/* ===== SUCCESS OVERLAY ===== */
function showSuccessMessage() {
    if (successOverlay) {
        successOverlay.hidden = false;
        document.body.style.overflow = "hidden";
        if (successClose) successClose.focus();
    }
}
function closeSuccessMessage() {
    if (successOverlay) {
        successOverlay.hidden = true;
        document.body.style.overflow = "";
    }
}
if (successClose) successClose.addEventListener("click", closeSuccessMessage);
if (successOverlay) {
    successOverlay.addEventListener("click", (e) => {
        if (e.target === successOverlay) closeSuccessMessage();
    });
}
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && successOverlay && !successOverlay.hidden) {
        closeSuccessMessage();
    }
});

/* ===== FORM SUBMISSION ===== */
if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Reset inline error
        if (contactMessage) {
            contactMessage.textContent = "";
            contactMessage.classList.remove("is-visible");
        }

        // Button state
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const labelEl = submitButton ? submitButton.querySelector(".btn-label") : null;
        const originalLabel = labelEl ? labelEl.textContent : "Send Message";
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add("is-loading");
            if (labelEl) labelEl.textContent = "Sending...";
        }

        // Gather fields
        const name = document.getElementById("ct-name")?.value.trim();
        const email = document.getElementById("ct-email")?.value.trim();
        const phone = document.getElementById("ct-phone")?.value.trim() || "";
        const topic = document.getElementById("ct-topic")?.value;
        const subject = document.getElementById("ct-subject")?.value.trim();
        const message = document.getElementById("ct-message")?.value.trim();

        // Validation
        if (!name || !email || !topic || !subject || !message) {
            showError("Please complete all required fields.");
            restoreButton(submitButton, labelEl, originalLabel);
            return;
        }

        try {
            const contactData = {
                name,
                email,
                phone,
                topic,
                subject,
                message,
                status: "new",
                createdAt: new Date().toISOString()
            };

            const contactsRef = ref(database, "contacts");
            await set(push(contactsRef), contactData);

            contactForm.reset();
            showSuccessMessage();
        } catch (error) {
            console.error("Submission error:", error);
            showError(
                error.message ||
                "Unable to send your message right now. Please try again."
            );
        } finally {
            restoreButton(submitButton, labelEl, originalLabel);
        }
    });
}

/* ===== HELPERS ===== */
function showError(msg) {
    if (contactMessage) {
        contactMessage.textContent = msg;
        contactMessage.classList.add("is-visible");
    }
}

function restoreButton(btn, labelEl, originalLabel) {
    if (!btn) return;
    btn.disabled = false;
    btn.classList.remove("is-loading");
    if (labelEl) labelEl.textContent = originalLabel || "Send Message";
}
