import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getDatabase,
    ref,
    get,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

// =====================================================
// FIREBASE CONFIG (replace with your own)
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
// ADMIN UID (same as in admin.js)
// =====================================================
const ADMIN_UID = "WnECxfnldyb76ajAYBjFbNFA7qz2";

// =====================================================
// DOM ELEMENTS
// =====================================================
const detailBody = document.getElementById("detailBody");
const detailTitle = document.getElementById("detailTitle");
const detailSpinner = document.getElementById("detailSpinner");

// Share card elements (hidden until used)
const shareCardRender = document.getElementById("shareCardRender");
const shareCardSubtitle = document.getElementById("shareCardSubtitle");
const shareCardGrid = document.getElementById("shareCardGrid");

// =====================================================
// SPINNER CONTROL
// =====================================================
function hideSpinner() {
    if (detailSpinner) {
        detailSpinner.classList.add("hidden-spinner");
    }
}

function showSpinner() {
    if (detailSpinner) {
        detailSpinner.classList.remove("hidden-spinner");
    }
}

// =====================================================
// AUTH GUARD – redirect if not admin
// =====================================================
onAuthStateChanged(auth, (user) => {
    if (!user || user.uid !== ADMIN_UID) {
        // Not logged in or not admin – redirect to admin login
        window.location.href = "admin.html";
    } else {
        // Authorized – load the appointment
        loadAppointment();
    }
});

// =====================================================
// GET ID FROM URL
// =====================================================
function getAppointmentId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// =====================================================
// LOAD APPOINTMENT FROM FIREBASE
// =====================================================
async function loadAppointment() {
    const id = getAppointmentId();
    if (!id) {
        detailBody.innerHTML = `<p style="color:red;">No appointment ID provided.</p>`;
        hideSpinner();
        return;
    }
    try {
        showSpinner();
        const snapshot = await get(ref(database, `appointments/${id}`));
        hideSpinner();
        if (!snapshot.exists()) {
            detailBody.innerHTML = `<p>Appointment not found.</p>`;
            return;
        }
        const data = snapshot.val();
        renderDetail(data, id);
    } catch (error) {
        console.error("Load error:", error);
        hideSpinner();
        detailBody.innerHTML = `<p style="color:red;">Error loading appointment.</p>`;
    }
}

// =====================================================
// RENDER DETAIL VIEW
// =====================================================
function renderDetail(data, id) {
    const status = (data.status || "new").toLowerCase();
    detailTitle.textContent = `Appointment ${data.appointmentNumber || "N/A"}`;

    // Build fields
    const fields = [
        { label: "Appointment Number", value: data.appointmentNumber, full: false },
        { label: "Name", value: data.name, full: false },
        { label: "Email", value: data.email, full: false },
        { label: "Phone", value: data.phone, full: false },
        { label: "Service", value: data.service, full: false },
        { label: "Date", value: data.date, full: false },
        { label: "Time", value: data.time, full: false },
        { label: "Message", value: data.message, full: true }
    ];

    let html = `<div class="detail-grid">`;
    fields.forEach(f => {
        html += `
            <div class="detail-item ${f.full ? 'full' : ''}">
                <label>${escapeHTML(f.label)}</label>
                <p>${escapeHTML(f.value || "Not provided")}</p>
            </div>
        `;
    });
    html += `</div>`;

    // Status dropdown + save button
    html += `
        <div style="margin-top:20px; display:flex; align-items:center; gap:12px; flex-wrap:wrap; border-top:1px solid var(--admin-border); padding-top:20px;">
            <label style="font-weight:600;">Status:</label>
            <select id="statusSelect" class="status-select">
                <option value="new" ${status === "new" ? "selected" : ""}>New</option>
                <option value="contacted" ${status === "contacted" ? "selected" : ""}>Contacted</option>
                <option value="confirmed" ${status === "confirmed" ? "selected" : ""}>Confirmed</option>
                <option value="completed" ${status === "completed" ? "selected" : ""}>Completed</option>
            </select>
            <button id="saveStatusBtn" class="btn btn-primary">Save Status</button>
            <span id="statusMessage" style="font-size:14px; color:var(--admin-muted);"></span>
        </div>
    `;

    // Action buttons
    html += `
        <div class="detail-actions">
            <button id="shareBtn" class="btn btn-share">📤 Share</button>
            <button id="deleteBtn" class="btn btn-danger">🗑️ Delete</button>
            <a href="admin.html" class="btn">← Back</a>
        </div>
    `;

    detailBody.innerHTML = html;

    // ---- Attach event listeners ----

    // Save status
    const saveBtn = document.getElementById("saveStatusBtn");
    const statusSelect = document.getElementById("statusSelect");
    const statusMsg = document.getElementById("statusMessage");
    if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
            const newStatus = statusSelect.value;
            try {
                await update(ref(database, `appointments/${id}`), { status: newStatus });
                statusMsg.textContent = "✅ Status updated!";
                // Update the badge if present (optional)
                const badge = document.querySelector(".status-badge");
                if (badge) {
                    badge.className = `status-badge status-${newStatus}`;
                    badge.textContent = newStatus;
                }
                setTimeout(() => { statusMsg.textContent = ""; }, 3000);
            } catch (error) {
                console.error("Status update error:", error);
                statusMsg.textContent = "❌ Update failed.";
            }
        });
    }

    // Delete
    const deleteBtn = document.getElementById("deleteBtn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
            if (!confirm("Permanently delete this appointment?")) return;
            try {
                await remove(ref(database, `appointments/${id}`));
                alert("Deleted. Returning to dashboard.");
                window.location.href = "admin.html";
            } catch (error) {
                console.error("Delete error:", error);
                alert("Delete failed.");
            }
        });
    }

    // Share
    const shareBtn = document.getElementById("shareBtn");
    if (shareBtn) {
        shareBtn.addEventListener("click", () => shareAppointment(data));
    }
}

// =====================================================
// SHARE APPOINTMENT AS IMAGE
// =====================================================
async function shareAppointment(item) {
    const button = document.getElementById("shareBtn");
    if (!button) return;
    const originalText = button.innerHTML;
    button.disabled = true;
    button.textContent = "Generating...";

    try {
        // Build the share card content
        shareCardSubtitle.textContent = `Appointment request for ${item?.name || "Customer"}`;
        shareCardGrid.innerHTML = `
            ${shareField("Name", item?.name)}
            ${shareField("Email", item?.email)}
            ${shareField("Phone", item?.phone)}
            ${shareField("Service", item?.service)}
            ${shareField("Date", item?.date)}
            ${shareField("Time", item?.time)}
            ${shareField("Status", (item?.status || "new").toLowerCase())}
            ${shareField("Message", item?.message, true)}
        `;

        // Ensure html2canvas is loaded
        if (typeof window.html2canvas !== "function") {
            await loadHtml2Canvas();
        }

        // Capture the share card
        const canvas = await window.html2canvas(shareCardRender, {
            backgroundColor: "#ffffff",
            scale: 2,
            useCORS: true,
            logging: false
        });

        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
        if (!blob) throw new Error("Unable to generate image.");

        const file = new File([blob], "appointment-details.png", { type: "image/png" });

        // Try native share
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: "Appointment Details",
                text: "Appointment details from Yadav Web Technologies.",
                files: [file]
            });
            showToast("Shared", "Image shared successfully.", "success");
        } else {
            // Fallback: download
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "appointment-details.png";
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(link.href), 1000);
            showToast("Image Generated", "Image downloaded successfully.", "success");
        }
    } catch (error) {
        if (error?.name !== "AbortError") {
            console.error("Share error:", error);
            alert("Unable to share. You can take a screenshot manually.");
        }
    } finally {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

// =====================================================
// SHARE FIELD HELPER
// =====================================================
function shareField(label, value, full = false) {
    return `
        <div class="share-card-field ${full ? "full" : ""}" style="padding:15px; border:1px solid #e2e8f0; border-radius:7px; ${full ? "grid-column:1/-1;" : ""}">
            <span style="display:block; margin-bottom:6px; color:#667085; font-size:12px; font-weight:600;">${escapeHTML(label)}</span>
            <div style="line-height:1.5; white-space:pre-wrap;">${escapeHTML(value || "Not provided")}</div>
        </div>
    `;
}

// =====================================================
// LOAD HTML2CANVAS DYNAMICALLY
// =====================================================
function loadHtml2Canvas() {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error("Unable to load image generator."));
        document.head.appendChild(script);
    });
}

// =====================================================
// TOAST (fallback – uses alert if toast element not present)
// =====================================================
function showToast(title, message, type = "success") {
    // If you have a toast element on this page, you can implement it.
    // For simplicity, we use alert, but you can integrate your existing toast.
    alert(`${title}: ${message}`);
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
