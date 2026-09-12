/* ============================================================
   APPOINTMENT — Firebase integration
   Yadav Web Technologies
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    set,
    push
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
const appointmentForm = document.getElementById("appointmentForm");
const appointmentMessage = document.getElementById("appointmentMessage");
const successOverlay = document.getElementById("successOverlay");
const successClose = document.getElementById("successClose");
const appointmentNumberDisplay = document.getElementById("appointmentNumber");

/* ===== SUCCESS OVERLAY HANDLERS ===== */
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

/* ===== APPOINTMENT NUMBER GENERATOR (with retry) ===== */
async function getNextAppointmentNumber() {
    const counterRef = ref(database, "appointmentCounter/current");
    let attempts = 0;
    while (attempts < 5) {
        try {
            const snapshot = await get(counterRef);
            let current = snapshot.exists() ? snapshot.val() : 1000;
            if (typeof current !== "number") current = 1000;
            const next = current + 1;
            await set(counterRef, next);
            return next;
        } catch (error) {
            attempts++;
            console.warn(`Counter update attempt ${attempts} failed:`, error.message);
            if (attempts >= 5) {
                throw new Error("Unable to generate number. Please try again.");
            }
            await new Promise((resolve) => setTimeout(resolve, 300));
        }
    }
}

/* ===== DISPLAY NEXT NUMBER ON LOAD ===== */
async function displayNextNumber() {
    if (!appointmentNumberDisplay) return;
    try {
        const counterRef = ref(database, "appointmentCounter/current");
        const snapshot = await get(counterRef);
        let current = snapshot.exists() ? snapshot.val() : 1000;
        if (typeof current !== "number") current = 1000;
        const next = current + 1;
        appointmentNumberDisplay.textContent = "APT-" + next;
        appointmentNumberDisplay.dataset.nextNumber = next;
    } catch (error) {
        console.error("Error fetching counter:", error);
        appointmentNumberDisplay.textContent = "APT-1001";
        appointmentNumberDisplay.dataset.nextNumber = 1001;
    }
}
displayNextNumber();

/* ===== FORM SUBMISSION ===== */
if (appointmentForm) {
    appointmentForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Reset message
        if (appointmentMessage) {
            appointmentMessage.textContent = "";
            appointmentMessage.classList.remove("is-visible");
        }

        // Disable submit button
        const submitButton = appointmentForm.querySelector('button[type="submit"]');
        const labelEl = submitButton ? submitButton.querySelector(".btn-label") : null;
        const originalLabel = labelEl ? labelEl.textContent : "Book Appointment";
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add("is-loading");
            if (labelEl) labelEl.textContent = "Submitting...";
        }

        // Gather fields
        const name = document.getElementById("apt-name")?.value.trim();
        const email = document.getElementById("apt-email")?.value.trim();
        const phone = document.getElementById("apt-phone")?.value.trim();
        const organization = document.getElementById("apt-org")?.value.trim() || "";
        const service = document.getElementById("apt-type")?.value;
        const budget = document.getElementById("apt-budget")?.value || "";
        const date = document.getElementById("apt-date")?.value;
        const time = document.getElementById("apt-time")?.value;
        const message = document.getElementById("apt-message")?.value.trim();

        // Validation
        if (!name || !email || !phone || !service || !date || !time || !message) {
            showError("Please complete all required fields.");
            restoreButton(submitButton, labelEl, originalLabel);
            return;
        }

        try {
            const nextNum = await getNextAppointmentNumber();
            const appointmentNumber = "APT-" + nextNum;

            const appointmentData = {
                appointmentNumber,
                name,
                email,
                phone,
                organization,
                service,
                budget,
                date,
                time,
                message,
                status: "new",
                createdAt: new Date().toISOString()
            };

            const appointmentsRef = ref(database, "appointments");
            await set(push(appointmentsRef), appointmentData);

            appointmentForm.reset();
            showSuccessMessage();
            displayNextNumber(); // refresh displayed number
        } catch (error) {
            console.error("Submission error:", error);
            showError(
                error.message ||
                "Unable to submit your appointment right now. Please try again."
            );
        } finally {
            restoreButton(submitButton, labelEl, originalLabel);
        }
    });
}

/* ===== HELPERS ===== */
function showError(msg) {
    if (appointmentMessage) {
        appointmentMessage.textContent = msg;
        appointmentMessage.classList.add("is-visible");
    }
}

function restoreButton(btn, labelEl, originalLabel) {
    if (!btn) return;
    btn.disabled = false;
    btn.classList.remove("is-loading");
    if (labelEl) labelEl.textContent = originalLabel || "Book Appointment";
}
