import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    set,
    push
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

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

const appointmentForm = document.getElementById("appointmentForm");
const appointmentMessage = document.getElementById("appointmentMessage");
const successOverlay = document.getElementById("successOverlay");
const successClose = document.getElementById("successClose");
const appointmentNumberDisplay = document.getElementById("appointmentNumber");

// ----- Success overlay handlers (unchanged) -----
function showSuccessMessage() { if (successOverlay) successOverlay.hidden = false; }
function closeSuccessMessage() { if (successOverlay) successOverlay.hidden = true; }
if (successClose) successClose.addEventListener("click", closeSuccessMessage);
if (successOverlay) {
    successOverlay.addEventListener("click", (e) => {
        if (e.target === successOverlay) closeSuccessMessage();
    });
}
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && successOverlay && !successOverlay.hidden) closeSuccessMessage();
});

// ----- Generate next number using get+set with retry (no transaction) -----
async function getNextAppointmentNumber() {
    const counterRef = ref(database, "appointmentCounter/current");
    let attempts = 0;
    while (attempts < 5) {
        try {
            const snapshot = await get(counterRef);
            let current = snapshot.exists() ? snapshot.val() : 1000;
            if (typeof current !== 'number') current = 1000; // fallback
            const next = current + 1;
            await set(counterRef, next);
            return next;
        } catch (error) {
            attempts++;
            console.warn(`Counter update attempt ${attempts} failed:`, error.message);
            if (attempts >= 5) throw new Error("Unable to generate number. Please try again.");
            await new Promise(resolve => setTimeout(resolve, 300)); // wait before retry
        }
    }
}

// ----- Display next number on page load -----
async function displayNextNumber() {
    try {
        const counterRef = ref(database, "appointmentCounter/current");
        const snapshot = await get(counterRef);
        let current = snapshot.exists() ? snapshot.val() : 1000;
        if (typeof current !== 'number') current = 1000;
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

// ----- Form submission -----
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

        try {
            const nextNum = await getNextAppointmentNumber();
            const appointmentNumber = "APT-" + nextNum;

            const appointmentData = {
                appointmentNumber,
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

            const appointmentsRef = ref(database, "appointments");
            await set(push(appointmentsRef), appointmentData);

            appointmentForm.reset();
            showSuccessMessage();
            displayNextNumber(); // refresh displayed number

        } catch (error) {
            console.error("Submission error:", error);
            showError(error.message || "Unable to submit your appointment right now. Please try again.");
        } finally {
            restoreButton(submitButton);
        }
    });
}

function showError(msg) {
    if (appointmentMessage) appointmentMessage.textContent = msg;
}
function restoreButton(btn) {
    if (!btn) return;
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText || "Submit Appointment Request";
}
