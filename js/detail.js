/* ============================================================
   APPOINTMENT DETAIL — Yadav Web Technologies Admin
   Firebase-powered single-appointment view
   ============================================================ */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getDatabase,
    ref,
    get,
    update,
    remove
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
const auth = getAuth(app);
const database = getDatabase(app);

/* ===== ADMIN UID (must match admin.js) ===== */
const ADMIN_UID = "WnECxfnldyb76ajAYBjFbNFA7qz2";

/* ===== DOM ===== */
const pageLoader = document.getElementById("pageLoader");
const detailTitle = document.getElementById("detailTitle");
const detailBody = document.getElementById("detailBody");
const detailSpinner = document.getElementById("detailSpinner");
const adminUser = document.getElementById("adminUser");
const logoutButton = document.getElementById("logoutButton");
const mobileMenuButton = document.getElementById("mobileMenuButton");
const adminSidebar = document.getElementById("adminSidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const adminToast = document.getElementById("adminToast");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");
const dashboardNav = document.getElementById("dashboardNav");
const appointmentsNav = document.getElementById("appointmentsNav");
const shareCardSubtitle = document.getElementById("shareCardSubtitle");
const shareCardGrid = document.getElementById("shareCardGrid");

/* ===== STATE ===== */
let currentAppointmentId = null;
let currentAppointment = null;
let toastTimer = null;

/* ===== HELPERS ===== */
function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function isAdmin(user) {
    return Boolean(user && user.uid === ADMIN_UID);
}

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

function hideSpinner() {
    if (detailSpinner) detailSpinner.classList.add("hidden-spinner");
}

function showSpinner() {
    if (detailSpinner) detailSpinner.classList.remove("hidden-spinner");
}

/* ===== AUTH GUARD ===== */
onAuthStateChanged(auth, (user) => {
    if (pageLoader) pageLoader.style.display = "none";

    if (!user || !isAdmin(user)) {
        // Not authorized — send back to login
        window.location.replace("index.html");
        return;
    }

    if (adminUser) adminUser.textContent = user.email || "Administrator";

    // Load appointment
    currentAppointmentId = getIdFromURL();
    if (!currentAppointmentId) {
        renderError("No appointment specified", "The appointment ID is missing from the URL.");
        return;
    }
    loadAppointment(currentAppointmentId);
});

/* ===== LOGOUT ===== */
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error("Logout error:", err);
            showToast("Error", "Unable to sign out.", "error");
        }
    });
}

/* ===== MOBILE SIDEBAR ===== */
if (mobileMenuButton && adminSidebar) {
    mobileMenuButton.addEventListener("click", () => {
        adminSidebar.classList.toggle("open");
        if (sidebarOverlay) sidebarOverlay.classList.toggle("active");
    });
}
if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", () => {
        adminSidebar?.classList.remove("open");
        sidebarOverlay.classList.remove("active");
    });
}

/* ===== SIDEBAR NAV ===== */
if (dashboardNav) {
    dashboardNav.addEventListener("click", () => {
        window.location.href = "index.html";
    });
}
if (appointmentsNav) {
    appointmentsNav.addEventListener("click", () => {
        window.location.href = "index.html#appointmentsPanel";
    });
}

/* ===== LOAD APPOINTMENT ===== */
async function loadAppointment(id) {
    showSpinner();
    try {
        const snap = await get(ref(database, `appointments/${id}`));
        if (!snap.exists()) {
            renderError("Appointment not found", "This appointment may have been deleted or the link is invalid.");
            return;
        }
        currentAppointment = { id, ...snap.val() };
        renderDetail(currentAppointment);
    } catch (err) {
        console.error("Load error:", err);
        renderError("Failed to load", "Unable to fetch appointment data. Please try again.");
    } finally {
        hideSpinner();
    }
}

/* ===== RENDER DETAIL ===== */
function renderDetail(data) {
    const status = (data.status || "new").toLowerCase();
    const number = data.appointmentNumber || "N/A";

    if (detailTitle) {
        detailTitle.textContent = number;
    }

    const emailLink = data.email
        ? `<a href="mailto:${escapeHTML(data.email)}">${escapeHTML(data.email)}</a>`
        : "—";

    const phoneClean = (data.phone || "").replace(/[^0-9+]/g, "");
    const phoneLink = data.phone
        ? `<a href="tel:${escapeHTML(phoneClean)}">${escapeHTML(data.phone)}</a>`
        : "—";

    const created = data.createdAt
        ? new Date(data.createdAt).toLocaleString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        })
        : "—";

    detailBody.innerHTML = `
        <div class="detail-grid">

            <div class="detail-item">
                <label>Appointment Number</label>
                <p><strong>${escapeHTML(number)}</strong></p>
            </div>

            <div class="detail-item">
                <label>Status</label>
                <p><span class="status-badge status-${escapeHTML(status)}">${escapeHTML(status)}</span></p>
            </div>

            <div class="detail-item">
                <label>Name</label>
                <p>${escapeHTML(data.name || "—")}</p>
            </div>

            <div class="detail-item">
                <label>Email</label>
                <p>${emailLink}</p>
            </div>

            <div class="detail-item">
                <label>Phone</label>
                <p>${phoneLink}</p>
            </div>

            <div class="detail-item">
                <label>Organization</label>
                <p>${escapeHTML(data.organization || "—")}</p>
            </div>

            <div class="detail-item">
                <label>Service</label>
                <p>${escapeHTML(data.service || "—")}</p>
            </div>

            <div class="detail-item">
                <label>Budget Range</label>
                <p>${escapeHTML(data.budget || "—")}</p>
            </div>

            <div class="detail-item">
                <label>Preferred Date</label>
                <p>${escapeHTML(data.date || "—")}</p>
            </div>

            <div class="detail-item">
                <label>Preferred Time</label>
                <p>${escapeHTML(data.time || "—")}</p>
            </div>

            <div class="detail-item full">
                <label>Submitted</label>
                <p>${escapeHTML(created)}</p>
            </div>

            <div class="detail-item full message">
                <label>Message / Requirements</label>
                <p>${escapeHTML(data.message || "—")}</p>
            </div>

        </div>

        <div class="detail-actions">

            ${status !== "contacted" && status !== "confirmed" && status !== "completed" ? `
                <button type="button" class="btn btn-secondary" data-action="contacted">
                    <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    Mark Contacted
                </button>
            ` : ""}

            ${status !== "confirmed" && status !== "completed" ? `
                <button type="button" class="btn btn-primary" data-action="confirmed">
                    <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Mark Confirmed
                </button>
            ` : ""}

            ${status !== "completed" ? `
                <button type="button" class="btn btn-secondary" data-action="completed">
                    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    Mark Completed
                </button>
            ` : ""}

            <button type="button" class="btn btn-share" data-action="share">
                <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
                Share as Image
            </button>

            <a href="index.html" class="btn btn-secondary">
                <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back
            </a>

            <button type="button" class="btn btn-danger" data-action="delete">
                <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                Delete
            </button>

        </div>
    `;

    // Attach action handlers
    detailBody.querySelectorAll("[data-action]").forEach((btn) => {
        btn.addEventListener("click", () => handleAction(btn.dataset.action));
    });

    // Prepare share card content
    prepareShareCard(data, created);
}

/* ===== ERROR STATE ===== */
function renderError(title, message) {
    if (detailTitle) detailTitle.textContent = "Error";
    detailBody.innerHTML = `
        <div class="detail-error">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h3>${escapeHTML(title)}</h3>
            <p>${escapeHTML(message)}</p>
            <a href="index.html" class="btn btn-primary">
                <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back to Dashboard
            </a>
        </div>
    `;
}

/* ===== ACTION HANDLER ===== */
async function handleAction(action) {
    if (!currentAppointment) return;

    if (action === "share") {
        shareAsImage();
        return;
    }

    if (action === "delete") {
        if (!confirm("Delete this appointment permanently? This cannot be undone.")) return;
        try {
            await remove(ref(database, `appointments/${currentAppointmentId}`));
            showToast("Deleted", "Appointment has been removed.", "success");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1200);
        } catch (err) {
            console.error("Delete error:", err);
            showToast("Error", "Unable to delete appointment.", "error");
        }
        return;
    }

    // Status updates: contacted | confirmed | completed
    if (["contacted", "confirmed", "completed"].includes(action)) {
        try {
            await update(ref(database, `appointments/${currentAppointmentId}`), {
                status: action
            });
            currentAppointment.status = action;
            renderDetail(currentAppointment);
            showToast("Updated", `Status changed to ${action}.`, "success");
        } catch (err) {
            console.error("Update error:", err);
            showToast("Error", "Unable to update status.", "error");
        }
    }
}

/* ===== PREPARE SHARE CARD ===== */
function prepareShareCard(data, created) {
    if (!shareCardSubtitle || !shareCardGrid) return;

    const number = data.appointmentNumber || "N/A";
    const status = (data.status || "new").toLowerCase();

    shareCardSubtitle.textContent = `Appointment ${number} — submitted on ${created}`;

    const rows = [
        ["Status", status.toUpperCase()],
        ["Name", data.name || "—"],
        ["Email", data.email || "—"],
        ["Phone", data.phone || "—"],
        ["Organization", data.organization || "—"],
        ["Service", data.service || "—"],
        ["Preferred Date", data.date || "—"],
        ["Preferred Time", data.time || "—"]
    ];

    shareCardGrid.innerHTML = rows.map(([label, value]) => `
        <div style="padding:14px 16px; border:1px solid #e8edf4; border-radius:8px; background:#fafcff;">
            <div style="font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#667085; margin-bottom:5px;">${escapeHTML(label)}</div>
            <div style="font-size:14px; color:#172033; line-height:1.5; word-break:break-word;">${escapeHTML(value)}</div>
        </div>
    `).join("");

    // Add message block below grid
    if (data.message) {
        shareCardGrid.insertAdjacentHTML("afterend", `
            <div id="shareCardMessage" style="margin-top:14px; padding:16px; border:1px solid #e8edf4; border-radius:8px; background:#fafcff;">
                <div style="font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#667085; margin-bottom:6px;">Message</div>
                <div style="font-size:14px; color:#172033; line-height:1.7;">${escapeHTML(data.message)}</div>
            </div>
        `);
    }
}

/* ===== SHARE AS IMAGE ===== */
async function shareAsImage() {
    if (!window.html2canvas) {
        showToast("Unavailable", "Share feature is unavailable right now.", "error");
        return;
    }

    const target = document.getElementById("shareCardRender");
    if (!target) return;

    showToast("Preparing", "Generating image…", "success");

    try {
        const canvas = await window.html2canvas(target, {
            backgroundColor: "#ffffff",
            scale: 2,
            useCORS: true,
            logging: false
        });

        const number = currentAppointment?.appointmentNumber || "appointment";
        const fileName = `${number.replace(/\s+/g, "-")}.png`;

        // Try Web Share API first (mobile-friendly)
        if (navigator.canShare && canvas.toBlob) {
            const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
            const file = new File([blob], fileName, { type: "image/png" });

            if (navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: `Appointment ${number}`,
                        text: "Shared from Yadav Web Technologies Admin"
                    });
                    return;
                } catch (shareErr) {
                    // User cancelled or share failed — fall through to download
                    if (shareErr.name === "AbortError") return;
                }
            }
        }

        // Fallback: download the image
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast("Downloaded Sucessful", "Image saved to your device.", "success");
    } catch (err) {
        console.error("Share image error:", err);
        showToast("Failed", "Could not generate image.", "error");
    }
}
