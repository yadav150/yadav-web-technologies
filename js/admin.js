import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getDatabase,
    ref,
    onValue,
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

// =====================================================
// MARK MODULE AS BOOTED (for the HTML safety net)
// =====================================================
window.__adminBooted = true;

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
const auth = getAuth(app);
const database = getDatabase(app);

// =====================================================
// ADMIN UID
// =====================================================
const ADMIN_UID = "WnECxfnldyb76ajAYBjFbNFA7qz2";

// =====================================================
// DOM ELEMENTS
// =====================================================
const pageLoader = document.getElementById("pageLoader");
const loginScreen = document.getElementById("loginScreen");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");
const logoutButton = document.getElementById("logoutButton");
const refreshButton = document.getElementById("refreshButton");
const adminUser = document.getElementById("adminUser");
const appointmentsList = document.getElementById("appointmentsList");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const totalCount = document.getElementById("totalCount");
const newCount = document.getElementById("newCount");
const contactedCount = document.getElementById("contactedCount");
const confirmedCount = document.getElementById("confirmedCount");
const completedCount = document.getElementById("completedCount");
const mobileMenuButton = document.getElementById("mobileMenuButton");
const adminSidebar = document.getElementById("adminSidebar");
const adminToast = document.getElementById("adminToast");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");
const listSpinner = document.getElementById("listSpinner");

// Forgot password elements
const forgotScreen = document.getElementById("forgotScreen");
const forgotForm = document.getElementById("forgotForm");
const forgotEmail = document.getElementById("forgotEmail");
const forgotError = document.getElementById("forgotError");
const forgotSuccess = document.getElementById("forgotSuccess");
const forgotLink = document.getElementById("forgotLink");
const forgotBackBtn = document.getElementById("forgotBackBtn");
const forgotSubmit = document.getElementById("forgotSubmit");

// =====================================================
// STATE
// =====================================================
let appointments = {};
let unsubscribeAppointments = null;
let toastTimer = null;

// =====================================================
// SPINNER CONTROL
// =====================================================
function hideSpinner() {
    if (listSpinner) listSpinner.classList.add("hidden-spinner");
}
function showSpinner() {
    if (listSpinner) listSpinner.classList.remove("hidden-spinner");
}

// =====================================================
// SECURITY CHECK
// =====================================================
function isAdmin(user) {
    return Boolean(user && user.uid === ADMIN_UID);
}

// =====================================================
// AUTH STATE – MAIN ENTRY POINT
// =====================================================
onAuthStateChanged(auth, (user) => {
    // Hide page loader as soon as auth initializes (user OR no user)
    if (pageLoader) pageLoader.style.display = "none";

    if (!user) {
        showLogin();
        stopAppointmentsListener();
        return;
    }
    if (!isAdmin(user)) {
        showLogin();
        stopAppointmentsListener();
        signOut(auth);
        showLoginError("This account is not authorized to access the admin panel.");
        return;
    }
    // Authorized admin
    showDashboard();
    adminUser.textContent = user.email || "Administrator";
    startAppointmentsListener();
});

// =====================================================
// LOGIN
// =====================================================
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = loginEmail.value.trim();
        const password = loginPassword.value;
        if (!email || !password) {
            showLoginError("Please enter your email and password.");
            return;
        }
        const button = loginForm.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = true;
            button.textContent = "Signing in...";
        }
        clearLoginError();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Login error:", error);
            showLoginError(getLoginErrorMessage(error));
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = "Sign In";
            }
        }
    });
}

// =====================================================
// LOGOUT
// =====================================================
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error:", error);
            showToast("Error", "Unable to sign out.", "error");
        }
    });
}

// =====================================================
// SHOW / HIDE SCREENS
// =====================================================
function showLogin() {
    loginScreen.classList.add("visible");
    dashboard.classList.remove("visible");
    if (forgotScreen) forgotScreen.classList.remove("visible");
}
function showDashboard() {
    loginScreen.classList.remove("visible");
    dashboard.classList.add("visible");
    if (forgotScreen) forgotScreen.classList.remove("visible");
}
function showForgotScreen() {
    loginScreen.classList.remove("visible");
    dashboard.classList.remove("visible");
    if (forgotScreen) forgotScreen.classList.add("visible");
    clearForgotError();
    clearForgotSuccess();
    if (forgotEmail) forgotEmail.value = "";
    if (forgotSubmit) {
        forgotSubmit.disabled = false;
        const label = forgotSubmit.querySelector(".login-btn-label");
        if (label) label.textContent = "Send Reset Link";
    }
}

// =====================================================
// FORGOT PASSWORD
// =====================================================
if (forgotLink) {
    forgotLink.addEventListener("click", () => {
        const typedEmail = loginEmail?.value.trim() || "";
        showForgotScreen();
        if (typedEmail && forgotEmail) forgotEmail.value = typedEmail;
        forgotEmail?.focus();
    });
}

if (forgotBackBtn) {
    forgotBackBtn.addEventListener("click", () => {
        showLogin();
    });
}

if (forgotForm) {
    forgotForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearForgotError();
        clearForgotSuccess();

        const email = forgotEmail.value.trim();
        if (!email) {
            showForgotError("Please enter your email address.");
            return;
        }

        if (forgotSubmit) {
            forgotSubmit.disabled = true;
            const label = forgotSubmit.querySelector(".login-btn-label");
            if (label) label.textContent = "Sending...";
        }

        try {
            await sendPasswordResetEmail(auth, email);
            showForgotSuccess(
                "If that email is registered, a password reset link has been sent. Check your inbox and spam folder."
            );
            forgotForm.reset();
        } catch (error) {
            console.error("Password reset error:", error);
            if (error.code === "auth/too-many-requests") {
                showForgotError("Too many attempts. Please try again later.");
            } else if (error.code === "auth/invalid-email") {
                showForgotError("Please enter a valid email address.");
            } else {
                showForgotSuccess(
                    "If that email is registered, a password reset link has been sent. Check your inbox and spam folder."
                );
                forgotForm.reset();
            }
        } finally {
            if (forgotSubmit) {
                forgotSubmit.disabled = false;
                const label = forgotSubmit.querySelector(".login-btn-label");
                if (label) label.textContent = "Send Reset Link";
            }
        }
    });
}

function showForgotError(message) {
    if (forgotError) forgotError.textContent = message;
    if (forgotSuccess) forgotSuccess.textContent = "";
}
function clearForgotError() {
    if (forgotError) forgotError.textContent = "";
}
function showForgotSuccess(message) {
    if (forgotSuccess) forgotSuccess.textContent = message;
    if (forgotError) forgotError.textContent = "";
}
function clearForgotSuccess() {
    if (forgotSuccess) forgotSuccess.textContent = "";
}

// =====================================================
// LOGIN ERROR
// =====================================================
function showLoginError(message) {
    if (loginError) loginError.textContent = message;
}
function clearLoginError() {
    if (loginError) loginError.textContent = "";
}
function getLoginErrorMessage(error) {
    if (error.code === "auth/too-many-requests") {
        return "Too many attempts. Please try again later.";
    }
    return "Invalid User ID or Password.";
}

// =====================================================
// DATABASE LISTENER
// =====================================================
function startAppointmentsListener() {
    stopAppointmentsListener();
    showSpinner();
    const appointmentsRef = ref(database, "appointments");
    unsubscribeAppointments = onValue(appointmentsRef, (snapshot) => {
        appointments = snapshot.val() || {};
        renderDashboard();
        hideSpinner();
    }, (error) => {
        console.error("Database read error:", error);
        showToast("Database Error", "Unable to load appointments.", "error");
        hideSpinner();
    });
}
function stopAppointmentsListener() {
    if (unsubscribeAppointments) {
        unsubscribeAppointments();
        unsubscribeAppointments = null;
    }
}

// =====================================================
// REFRESH
// =====================================================
if (refreshButton) {
    refreshButton.addEventListener("click", () => {
        renderDashboard();
        showToast("Refreshed", "Appointment list has been refreshed.", "success");
    });
}

// =====================================================
// SEARCH & FILTER
// =====================================================
if (searchInput) searchInput.addEventListener("input", renderAppointments);
if (statusFilter) statusFilter.addEventListener("change", renderAppointments);

// =====================================================
// DASHBOARD RENDER
// =====================================================
function renderDashboard() {
    updateStatistics();
    renderAppointments();
}

// =====================================================
// STATISTICS
// =====================================================
function updateStatistics() {
    const list = Object.values(appointments);
    if (totalCount) totalCount.textContent = list.length;
    if (newCount) newCount.textContent = list.filter(item => getStatus(item) === "new").length;
    if (contactedCount) contactedCount.textContent = list.filter(item => getStatus(item) === "contacted").length;
    if (confirmedCount) confirmedCount.textContent = list.filter(item => getStatus(item) === "confirmed").length;
    if (completedCount) completedCount.textContent = list.filter(item => getStatus(item) === "completed").length;
}

// =====================================================
// STATUS
// =====================================================
function getStatus(item) {
    return (item?.status || "new").toLowerCase();
}

// =====================================================
// FILTER + SORT
// =====================================================
function getFilteredAppointments() {
    const search = searchInput?.value.trim().toLowerCase() || "";
    const selectedStatus = statusFilter?.value || "all";
    return Object.entries(appointments)
        .filter(([id, item]) => {
            const searchableText = [
                item?.name, item?.email, item?.phone,
                item?.service, item?.date, item?.time,
                item?.message, item?.appointmentNumber
            ].filter(Boolean).join(" ").toLowerCase();
            const matchesSearch = !search || searchableText.includes(search);
            const matchesStatus = selectedStatus === "all" || getStatus(item) === selectedStatus;
            return matchesSearch && matchesStatus;
        })
        .sort(([,a], [,b]) => {
            const dateA = new Date(a?.createdAt || 0).getTime();
            const dateB = new Date(b?.createdAt || 0).getTime();
            return dateB - dateA;
        });
}

// =====================================================
// APPOINTMENT LIST
// =====================================================
function renderAppointments() {
    if (!appointmentsList) return;
    const filtered = getFilteredAppointments();
    if (!filtered.length) {
        appointmentsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                        <path d="M8 9h8"></path><path d="M8 13h5"></path>
                    </svg>
                </div>
                <h3>No appointments found</h3>
                <p>Try changing your search or status filter.</p>
            </div>
        `;
        hideSpinner();
        return;
    }
    appointmentsList.innerHTML = filtered.map(([id, item]) => createAppointmentRow(id, item)).join("");
    hideSpinner();
}

// =====================================================
// APPOINTMENT ROW
// =====================================================
function createAppointmentRow(id, item) {
    const status = getStatus(item);
    const number = item?.appointmentNumber || "N/A";
    const safeNumber = escapeHTML(number);
    const safeName = escapeHTML(item?.name || "Unknown");
    const safeEmail = escapeHTML(item?.email || "No email");
    const safePhone = escapeHTML(item?.phone || "No phone");
    const safeService = escapeHTML(item?.service || "Not specified");
    const safeDate = escapeHTML(item?.date || "No date");
    const safeTime = escapeHTML(item?.time || "No time");

    return `
        <article class="appointment-row">
            <div class="appointment-number">${safeNumber}</div>
            <div class="appointment-client">
                <strong>${safeName}</strong>
                <span>${safeEmail}</span>
                <span>${safePhone}</span>
            </div>
            <div class="appointment-service">
                <strong>${safeService}</strong>
                <span>Appointment Request</span>
            </div>
            <div class="appointment-date">
                <strong>${safeDate}</strong>
                <span>${safeTime}</span>
            </div>
            <div>
                <span class="status-badge status-${escapeHTML(status)}">${escapeHTML(status)}</span>
            </div>
            <div>
                <a href="detail.html?id=${escapeHTML(id)}" class="view-link">View</a>
            </div>
        </article>
    `;
}

// =====================================================
// MOBILE SIDEBAR
// =====================================================
if (mobileMenuButton) {
    mobileMenuButton.addEventListener("click", () => {
        adminSidebar.classList.toggle("open");
    });
}

// =====================================================
// SIDEBAR NAV
// =====================================================
const dashboardNav = document.getElementById("dashboardNav");
const appointmentsNav = document.getElementById("appointmentsNav");

if (dashboardNav) {
    dashboardNav.addEventListener("click", () => {
        setActiveNav(dashboardNav);
        window.scrollTo({ top: 0, behavior: "smooth" });
        closeMobileSidebar();
    });
}
if (appointmentsNav) {
    appointmentsNav.addEventListener("click", () => {
        setActiveNav(appointmentsNav);
        document.getElementById("appointmentsPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
        closeMobileSidebar();
    });
}
function setActiveNav(activeButton) {
    document.querySelectorAll(".admin-nav button").forEach(btn => btn.classList.remove("active"));
    activeButton.classList.add("active");
}
function closeMobileSidebar() {
    if (adminSidebar && window.innerWidth <= 800) {
        adminSidebar.classList.remove("open");
    }
}

// =====================================================
// TOAST
// =====================================================
function showToast(title, message, type = "success") {
    if (!adminToast || !toastTitle || !toastMessage) return;
    clearTimeout(toastTimer);
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    adminToast.className = `admin-toast ${type} show`;
    toastTimer = setTimeout(() => {
        adminToast.classList.remove("show");
    }, 3500);
}

// =====================================================
// HTML ESCAPE
// =====================================================
function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
