import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    set,
    push,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

// =====================================================
// FIREBASE CONFIG
// =====================================================
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

// =====================================================
// ELEMENTS
// =====================================================
const appointmentForm = document.getElementById("appointmentForm");
const appointmentMessage = document.getElementById("appointmentMessage");
const successOverlay = document.getElementById("successOverlay");
const successClose = document.getElementById("successClose");

// NEW: element to display the appointment number
const appointmentNumberDisplay = document.getElementById("appointmentNumber");

// =====================================================
// SUCCESS MESSAGE (unchanged)
// =====================================================
function showSuccessMessage() {
    if (successOverlay) successOverlay.hidden = false;
}
function closeSuccessMessage() {
    if (successOverlay) successOverlay.hidden = true;
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

// =====================================================
// DISPLAY NEXT APPOINTMENT NUMBER
// =====================================================
async function displayNextNumber() {
    try {
        const counterRef = ref(database, "appointmentCounter/current");
        const snapshot = await get(counterRef);
        let current = snapshot.exists() ? snapshot.val() : 1000;
        const next = current + 1;
        if (appointmentNumberDisplay) {
            appointmentNumberDisplay.textContent = "APT-" + next;
            appointmentNumberDisplay.dataset.nextNumber = next;
        }
    } catch (error) {
        console.error("Error fetching counter:", error);
        if (appointmentNumberDisplay) {
            appointmentNumberDisplay.textContent = "APT-1001";
            appointmentNumberDisplay.dataset.nextNumber = 1001;
        }
    }
}
displayNextNumber();

// =====================================================
// FORM SUBMISSION
// =====================================================
if (appointmentForm) {
    appointmentForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (appointmentMessage) appointmentMessage.textContent = "";

        const submitButton = appointmentForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.dataset.originalText = submitButton.innerHTML;
            submitButton.textContent = "Submitting...";
        }

        // Gather fields
        const name = document.getElementById("name")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const phone = document.getElementById("phone")?.value.trim();
        const service = document.getElementById("service")?.value;
        const date = document.getElementById("date")?.value;
        const time = document.getElementById("time")?.value;
        const message = document.getElementById("message")?.value.trim();

        if (!name || !email || !phone || !service || !date || !time || !message) {
            showError("Please complete all required fields.");
            restoreButton(submitButton);
            return;
        }

        // Get the next number from the display element
        const nextNum = parseInt(appointmentNumberDisplay?.dataset.nextNumber);
        if (!nextNum || isNaN(nextNum)) {
            showError("Unable to generate appointment number. Please refresh.");
            restoreButton(submitButton);
            return;
        }
        const appointmentNumber = "APT-" + nextNum;

        // Prepare data
        const appointmentData = {
            appointmentNumber: appointmentNumber,
            name,
            email,
            phone,
            service,
            date,
            time,
            message,
            status: "new",
            createdAt: new Date().toISOString()
        };

        try {
            // Atomically increment counter
            const counterRef = ref(database, "appointmentCounter/current");
            await runTransaction(counterRef, (current) => (current || 1000) + 1);

            // Save using push() – the key will be the push ID
            const appointmentsRef = ref(database, "appointments");
            await set(push(appointmentsRef), appointmentData);

            appointmentForm.reset();
            showSuccessMessage();
            // Refresh displayed number for next booking
            displayNextNumber();

        } catch (error) {
            console.error("Submission error:", error);
            showError("Unable to submit your appointment right now. Please try again.");
        } finally {
            restoreButton(submitButton);
        }
    });
}

// =====================================================
// HELPERS (unchanged)
// =====================================================
function showError(message) {
    if (appointmentMessage) appointmentMessage.textContent = message;
}
function restoreButton(button) {
    if (!button) return;
    button.disabled = false;
    if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
    } else {
        button.textContent = "Submit Appointment Request";
    }
}
