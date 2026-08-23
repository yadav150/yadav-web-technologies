import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getDatabase,
    ref,
    onValue,
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
const auth = getAuth(app);
const database = getDatabase(app);

// =====================================================
// ADMIN UID (unchanged)
// =====================================================
const ADMIN_UID = "WnECxfnldyb76ajAYBjFbNFA7qz2";

// =====================================================
// ELEMENTS
// =====================================================
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
    if (listSpinner) {
        listSpinner.classList.add("hidden-spinner");
    }
}

function showSpinner() {
    if (listSpinner) {
        listSpinner.classList.remove("hidden-spinner");
    }
}

// =====================================================
// SECURITY CHECK (unchanged)
// =====================================================
function isAdmin(user) {
    return Boolean(user && user.uid === ADMIN_UID);
}

// =====================================================
// AUTH STATE
// =====================================================
onAuthStateChanged(auth, (user) => {
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
    showDashboard();
    adminUser.textContent = user.email || "Administrator";
    startAppointmentsListener();
});

// =====================================================
// LOGIN (unchanged)
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
// LOGOUT (unchanged)
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
// SHOW / HIDE (unchanged)
// =====================================================
function showLogin() {
    loginScreen.style.display = "flex";
    dashboard.style.display = "none";
}
function showDashboard() {
    loginScreen.style.display = "none";
    dashboard.style.display = "grid";
}

// =====================================================
// LOGIN ERROR (unchanged)
// =====================================================
function showLoginError(message) {
    if (loginError) loginError.textContent = message;
}
function clearLoginError() {
    if (loginError) loginError.textContent = "";
}
function getLoginErrorMessage(error) {
    if (error.code === "auth/invalid-credential") return "Invalid email or password.";
    if (error.code === "auth/user-not-found") return "No account was found with this email.";
    if (error.code === "auth/wrong-password") return "Incorrect password.";
    if (error.code === "auth/too-many-requests") return "Too many attempts. Please try again later.";
    return "Unable to sign in. Please try again.";
}

// =====================================================
// DATABASE LISTENER
// =====================================================
function startAppointmentsListener() {
    stopAppointmentsListener();
    showSpinner(); // Ensure spinner is visible while loading
    const appointmentsRef = ref(database, "appointments");
    unsubscribeAppointments = onValue(appointmentsRef, (snapshot) => {
        appointments = snapshot.val() || {};
        renderDashboard();
        hideSpinner(); // Data loaded – hide spinner
    }, (error) => {
        console.error("Database read error:", error);
        showToast("Database Error", "Unable to load appointments.", "error");
        hideSpinner(); // Error – hide spinner anyway
    });
}
function stopAppointmentsListener() {
    if (unsubscribeAppointments) {
        unsubscribeAppointments();
        unsubscribeAppointments = null;
    }
}

// =====================================================
// REFRESH (unchanged)
// =====================================================
if (refreshButton) {
    refreshButton.addEventListener("click", () => {
        renderDashboard();
        showToast("Refreshed", "Appointment list has been refreshed.", "success");
    });
}

// =====================================================
// SEARCH & FILTER (unchanged)
// =====================================================
if (searchInput) searchInput.addEventListener("input", renderAppointments);
if (statusFilter) statusFilter.addEventListener("change", renderAppointments);

// =====================================================
// DASHBOARD RENDER (unchanged)
// =====================================================
function renderDashboard() {
    updateStatistics();
    renderAppointments();
}

// =====================================================
// STATISTICS (unchanged)
// =====================================================
function updateStatistics() {
    const list = Object.values(appointments);
    totalCount.textContent = list.length;
    newCount.textContent = list.filter(item => getStatus(item) === "new").length;
    contactedCount.textContent = list.filter(item => getStatus(item) === "contacted").length;
    confirmedCount.textContent = list.filter(item => getStatus(item) === "confirmed").length;
    completedCount.textContent = list.filter(item => getStatus(item) === "completed").length;
}

// =====================================================
// STATUS (unchanged)
// =====================================================
function getStatus(item) {
    return (item?.status || "new").toLowerCase();
}

// =====================================================
// FILTER + SORT (unchanged)
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
// APPOINTMENT LIST (updated with spinner hide)
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
        // Spinner already hidden by listener; but ensure it's hidden
        hideSpinner();
        return;
    }
    appointmentsList.innerHTML = filtered.map(([id, item]) => createAppointmentRow(id, item)).join("");
    // Re‑attach view button listeners (they are links now, no need)
    hideSpinner(); // Just in case
}

// =====================================================
// APPOINTMENT ROW (unchanged)
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
// MOBILE SIDEBAR (unchanged)
// =====================================================
if (mobileMenuButton) {
    mobileMenuButton.addEventListener("click", () => {
        adminSidebar.classList.toggle("open");
    });
}

// =====================================================
// SIDEBAR NAV (unchanged)
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
// TOAST (unchanged)
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
// HTML ESCAPE (unchanged)
// =====================================================
function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// =====================================================
// INITIAL STATE (unchanged)
// =====================================================
showLogin();
