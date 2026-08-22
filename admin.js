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
    update,
    remove
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


// =====================================================
// ADMIN UID
// =====================================================
// IMPORTANT:
// Replace ONLY this UID with your Firebase Auth UID.

const ADMIN_UID =
    "WnECxfnldyb76ajAYBjFbNFA7qz2";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyDFnxF_v-fXGiZeL_OEMzmKrPdR1PE3KfU",

    authDomain:
        "auth-project-by-yadav.firebaseapp.com",

    projectId:
        "auth-project-by-yadav",

    storageBucket:
        "auth-project-by-yadav.firebasestorage.app",

    messagingSenderId:
        "351339588417",

    appId:
        "1:351339588417:web:ab20ea055457d03370cfc0",

    measurementId:
        "G-NR5Z7R2P19"

};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const database =
    getDatabase(app);


// =====================================================
// ELEMENTS
// =====================================================

const loginScreen =
    document.getElementById("loginScreen");

const dashboard =
    document.getElementById("dashboard");

const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");

const logoutButton =
    document.getElementById("logoutButton");

const adminUser =
    document.getElementById("adminUser");

const appointmentsList =
    document.getElementById("appointmentsList");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const detailView =
    document.getElementById("detailView");

const detailTopGrid =
    document.getElementById("detailTopGrid");

const detailMessageBox =
    document.getElementById("detailMessageBox");

const detailActions =
    document.getElementById("detailActions");

const closeDetail =
    document.getElementById("closeDetail");

const refreshButton =
    document.getElementById("refreshButton");

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const adminSidebar =
    document.getElementById("adminSidebar");

const appointmentsNav =
    document.getElementById("appointmentsNav");

const dashboardNav =
    document.getElementById("dashboardNav");

const shareCardRender =
    document.getElementById("shareCardRender");

const shareCardSubtitle =
    document.getElementById("shareCardSubtitle");

const shareCardGrid =
    document.getElementById("shareCardGrid");

const adminToast =
    document.getElementById("adminToast");

const toastTitle =
    document.getElementById("toastTitle");

const toastMessage =
    document.getElementById("toastMessage");


// =====================================================
// STATE
// =====================================================

let appointments = {};

let selectedAppointmentId = null;

let unsubscribeAppointments = null;

let toastTimer = null;


// =====================================================
// AUTH STATE
// =====================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            showLogin();

            return;

        }


        // Only the configured Firebase UID
        // can access the admin dashboard.

        if (user.uid !== ADMIN_UID) {

            await signOut(auth);

            showLoginError(
                "This account is not authorized to access the admin dashboard."
            );

            return;

        }


        showDashboard(user);

        loadAppointments();

    }
);


// =====================================================
// LOGIN
// =====================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            clearLoginError();


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            try {

                const result =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                if (
                    result.user.uid !==
                    ADMIN_UID
                ) {

                    await signOut(auth);

                    showLoginError(
                        "This account is not authorized to access the admin dashboard."
                    );

                }

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                showLoginError(
                    "Invalid login details or access denied."
                );

            }

        }
    );

}


// =====================================================
// LOGOUT
// =====================================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            await signOut(auth);

        }
    );

}


// =====================================================
// LOAD APPOINTMENTS
// =====================================================

function loadAppointments() {

    if (unsubscribeAppointments) {

        unsubscribeAppointments();

    }


    const appointmentsRef =
        ref(
            database,
            "appointments"
        );


    unsubscribeAppointments =
        onValue(
            appointmentsRef,
            (snapshot) => {

                appointments =
                    snapshot.val() || {};

                renderAppointments();

                updateStatistics();


                if (
                    selectedAppointmentId &&
                    appointments[
                        selectedAppointmentId
                    ]
                ) {

                    showAppointmentDetails(
                        selectedAppointmentId,
                        false
                    );

                }

            },
            (error) => {

                console.error(
                    "Database error:",
                    error
                );


                appointmentsList.innerHTML =
                    createEmptyState(
                        "Unable to load appointments",
                        "Please check the Firebase database permissions."
                    );

            }
        );

}


// =====================================================
// RENDER APPOINTMENTS
// =====================================================

function renderAppointments() {

    const search =
        searchInput?.value
            .trim()
            .toLowerCase() || "";


    const filter =
        statusFilter?.value || "all";


    const entries =
        Object.entries(
            appointments
        )
        .filter(
            ([, item]) => {

                const searchable = [

                    item.name,
                    item.email,
                    item.phone,
                    item.service,
                    item.message,
                    item.date,
                    item.time

                ]
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchable.includes(search);


                const matchesStatus =
                    filter === "all" ||
                    item.status === filter;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        )
        .sort(
            ([, a], [, b]) => {

                return (
                    new Date(
                        b.createdAt || 0
                    ) -
                    new Date(
                        a.createdAt || 0
                    )
                );

            }
        );


    if (!entries.length) {

        appointmentsList.innerHTML =
            createEmptyState(
                "No appointments found",
                "New appointment requests will appear here."
            );

        return;

    }


    appointmentsList.innerHTML =
        entries
            .map(
                ([id, item]) => {

                    const status =
                        item.status ||
                        "new";


                    return `

                        <article
                            class="appointment-row">

                            <div
                                class="appointment-client">

                                <strong>
                                    ${escapeHtml(
                                        item.name ||
                                        "Unknown Client"
                                    )}
                                </strong>

                                <span>
                                    ${escapeHtml(
                                        item.email ||
                                        "No email"
                                    )}
                                </span>

                            </div>


                            <div
                                class="appointment-service">

                                <strong>
                                    ${escapeHtml(
                                        item.service ||
                                        "Not specified"
                                    )}
                                </strong>

                                <span>
                                    ${escapeHtml(
                                        item.phone ||
                                        "No phone"
                                    )}
                                </span>

                            </div>


                            <div
                                class="appointment-date">

                                <strong>
                                    ${formatDate(
                                        item.date
                                    )}
                                </strong>

                                <span>
                                    ${escapeHtml(
                                        item.time ||
                                        "No time"
                                    )}
                                </span>

                            </div>


                            <div>

                                <span
                                    class="
                                        status-badge
                                        status-${escapeHtml(status)}
                                    ">

                                    ${escapeHtml(status)}

                                </span>

                            </div>


                            <div>

                                <button
                                    type="button"
                                    class="view-button"
                                    data-view-id="${escapeHtml(id)}">

                                    Open

                                </button>

                            </div>

                        </article>

                    `;

                }
            )
            .join("");


    document
        .querySelectorAll("[data-view-id]")
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        showAppointmentDetails(
                            button.dataset.viewId
                        );

                    }
                );

            }
        );

}


// =====================================================
// DETAIL VIEW
// =====================================================

function showAppointmentDetails(
    id,
    scrollToDetail = true
) {

    const item =
        appointments[id];


    if (!item) {

        return;

    }


    selectedAppointmentId =
        id;


    const currentStatus =
        item.status ||
        "new";


    detailTopGrid.innerHTML = `

        <div class="detail-summary">

            ${detailItem(
                "Client Name",
                item.name || "Not provided"
            )}

            ${detailItem(
                "Service",
                item.service || "Not provided"
            )}

            ${detailItem(
                "Email",
                item.email || "Not provided"
            )}

            ${detailItem(
                "Phone",
                item.phone || "Not provided"
            )}

            ${detailItem(
                "Appointment Date",
                formatDate(item.date)
            )}

            ${detailItem(
                "Appointment Time",
                item.time || "Not provided"
            )}

            ${detailItem(
                "Current Status",
                currentStatus
            )}

            ${detailItem(
                "Submitted",
                formatCreatedAt(item.createdAt)
            )}

        </div>


        <aside class="detail-status-card">

            <span class="detail-status-card-label">
                Update Appointment
            </span>


            <select
                id="detailStatus">

                <option
                    value="new"
                    ${currentStatus === "new" ? "selected" : ""}>
                    New
                </option>

                <option
                    value="contacted"
                    ${currentStatus === "contacted" ? "selected" : ""}>
                    Contacted
                </option>

                <option
                    value="confirmed"
                    ${currentStatus === "confirmed" ? "selected" : ""}>
                    Confirmed
                </option>

                <option
                    value="completed"
                    ${currentStatus === "completed" ? "selected" : ""}>
                    Completed
                </option>

            </select>


            <button
                type="button"
                class="detail-primary-button status-action"
                id="saveStatus">

                Update Status

            </button>

        </aside>

    `;


    detailMessageBox.innerHTML = `

        <div class="detail-message-head">

            <strong>
                Project Requirement
            </strong>

        </div>


        <div class="detail-message-content">

            ${escapeHtml(
                item.message ||
                "No message provided."
            )}

        </div>

    `;


    detailActions.innerHTML = `

        <button
            type="button"
            class="share-button"
            id="shareAppointment">

            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round">

                <circle
                    cx="18"
                    cy="5"
                    r="3">
                </circle>

                <circle
                    cx="6"
                    cy="12"
                    r="3">
                </circle>

                <circle
                    cx="18"
                    cy="19"
                    r="3">
                </circle>

                <path d="m8.6 13.5 6.8 4"></path>

                <path d="m15.4 6.5-6.8 4"></path>

            </svg>

            Share Appointment

        </button>


        <button
            type="button"
            class="danger-button"
            id="deleteAppointment">

            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round">

                <path d="M4 7h16"></path>
                <path d="M10 11v6"></path>
                <path d="M14 11v6"></path>
                <path d="M6 7l1 14h10l1-14"></path>
                <path d="M9 7V4h6v3"></path>

            </svg>

            Delete Appointment

        </button>

    `;


    detailView.classList.add(
        "active"
    );


    document
        .getElementById("saveStatus")
        .addEventListener(
            "click",
            () => {

                updateAppointmentStatus(
                    id
                );

            }
        );


    document
        .getElementById("shareAppointment")
        .addEventListener(
            "click",
            () => {

                shareAppointmentImage(
                    item
                );

            }
        );


    document
        .getElementById("deleteAppointment")
        .addEventListener(
            "click",
            () => {

                deleteAppointment(
                    id
                );

            }
        );


    if (scrollToDetail) {

        detailView.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


// =====================================================
// DETAIL ITEM
// =====================================================

function detailItem(
    label,
    value
) {

    return `

        <div class="detail-item">

            <label>
                ${escapeHtml(label)}
            </label>

            <p>
                ${escapeHtml(value)}
            </p>

        </div>

    `;

}


// =====================================================
// UPDATE STATUS
// =====================================================

async function updateAppointmentStatus(id) {

    const statusElement =
        document.getElementById(
            "detailStatus"
        );


    if (!statusElement) {

        return;

    }


    const newStatus =
        statusElement.value;


    const button =
        document.getElementById(
            "saveStatus"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Updating...";

    }


    try {

        await update(
            ref(
                database,
                `appointments/${id}`
            ),
            {
                status:
                    newStatus
            }
        );


        showToast(
            "Status updated",
            `Appointment marked as ${newStatus}.`,
            "success"
        );


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        showToast(
            "Update failed",
            "Unable to update the appointment status.",
            "error"
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Update Status";

        }

    }

}


// =====================================================
// DELETE APPOINTMENT
// =====================================================

async function deleteAppointment(
    id
) {

    const confirmed =
        window.confirm(
            "Delete this appointment permanently?"
        );


    if (!confirmed) {

        return;

    }


    try {

        await remove(
            ref(
                database,
                `appointments/${id}`
            )
        );


        selectedAppointmentId =
            null;


        detailView.classList.remove(
            "active"
        );


        showToast(
            "Appointment deleted",
            "The appointment has been removed.",
            "success"
        );


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        showToast(
            "Delete failed",
            "Unable to delete the appointment.",
            "error"
        );

    }

}


// =====================================================
// SHARE APPOINTMENT IMAGE
// =====================================================

async function shareAppointmentImage(
    item
) {

    const button =
        document.getElementById(
            "shareAppointment"
        );


    if (button) {

        button.disabled = true;

        button.dataset.originalText =
            button.innerHTML;

        button.textContent =
            "Preparing...";

    }


    try {

        buildShareCard(
            item
        );


        const canvas =
            await createCanvasFromCard();


        const blob =
            await canvasToBlob(
                canvas
            );


        const file =
            new File(
                [blob],
                "appointment-details.png",
                {
                    type: "image/png"
                }
            );


        if (
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({
                files: [file]
            })
        ) {

            await navigator.share({

                title:
                    "Appointment Details",

                text:
                    "Yadav Web Technologies - Appointment Details",

                files:
                    [file]

            });


            showToast(
                "Share ready",
                "The appointment image is ready to share.",
                "success"
            );

        } else {

            const url =
                URL.createObjectURL(
                    blob
                );


            const anchor =
                document.createElement(
                    "a"
                );


            anchor.href =
                url;

            anchor.download =
                "appointment-details.png";


            document.body.appendChild(
                anchor
            );


            anchor.click();

            anchor.remove();


            URL.revokeObjectURL(
                url
            );


            showToast(
                "Image generated",
                "The appointment image was downloaded because file sharing is unavailable in this browser.",
                "success"
            );

        }

    } catch (error) {

        if (
            error?.name !==
            "AbortError"
        ) {

            console.error(
                "Share error:",
                error
            );


            showToast(
                "Share failed",
                "Unable to generate the appointment image.",
                "error"
            );

        }

    } finally {

        if (button) {

            button.disabled = false;

            button.innerHTML =
                button.dataset.originalText ||
                "Share Appointment";

        }

    }

}


// =====================================================
// BUILD SHARE CARD
// =====================================================

function buildShareCard(
    item
) {

    shareCardSubtitle.textContent =
        `${formatDate(item.date)} · ${item.time || "Time not specified"}`;


    shareCardGrid.innerHTML = `

        ${shareField(
            "Client",
            item.name ||
            "Not provided"
        )}

        ${shareField(
            "Service",
            item.service ||
            "Not provided"
        )}

        ${shareField(
            "Email",
            item.email ||
            "Not provided"
        )}

        ${shareField(
            "Phone",
            item.phone ||
            "Not provided"
        )}

        ${shareField(
            "Appointment Date",
            formatDate(item.date)
        )}

        ${shareField(
            "Appointment Time",
            item.time ||
            "Not provided"
        )}

        ${shareField(
            "Status",
            item.status ||
            "new"
        )}

        ${shareField(
            "Submitted",
            formatCreatedAt(item.createdAt)
        )}

        ${shareField(
            "Project Requirement",
            item.message ||
            "No message provided.",
            true
        )}

    `;

}


function shareField(
    label,
    value,
    full = false
) {

    return `

        <div
            class="
                share-card-field
                ${full ? "full" : ""}
            ">

            <span
                class="share-card-label">

                ${escapeHtml(label)}

            </span>


            <div
                class="share-card-value">

                ${escapeHtml(value)}

            </div>

        </div>

    `;

}


// =====================================================
// HTML2CANVAS
// =====================================================

async function createCanvasFromCard() {

    if (
        typeof window.html2canvas ===
        "undefined"
    ) {

        await loadHtml2Canvas();

    }


    return await window.html2canvas(
        shareCardRender,
        {
            backgroundColor:
                "#ffffff",

            scale:
                2,

            useCORS:
                true,

            logging:
                false
        }
    );

}


function loadHtml2Canvas() {

    return new Promise(
        (resolve, reject) => {

            const script =
                document.createElement(
                    "script"
                );


            script.src =
                "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";


            script.onload =
                () => resolve();


            script.onerror =
                () => reject(
                    new Error(
                        "Unable to load image generation library."
                    )
                );


            document.head.appendChild(
                script
            );

        }
    );

}


function canvasToBlob(
    canvas
) {

    return new Promise(
        (resolve, reject) => {

            canvas.toBlob(
                (blob) => {

                    if (blob) {

                        resolve(blob);

                    } else {

                        reject(
                            new Error(
                                "Unable to create image."
                            )
                        );

                    }

                },
                "image/png",
                1
            );

        }
    );

}


// =====================================================
// SEARCH / FILTER
// =====================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderAppointments
    );

}


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        renderAppointments
    );

}


// =====================================================
// REFRESH
// =====================================================

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        () => {

            renderAppointments();

            updateStatistics();

            showToast(
                "Dashboard refreshed",
                "The current Firebase data has been refreshed.",
                "success"
            );

        }
    );

}


// =====================================================
// CLOSE DETAIL
// =====================================================

if (closeDetail) {

    closeDetail.addEventListener(
        "click",
        () => {

            selectedAppointmentId =
                null;


            detailView.classList.remove(
                "active"
            );


            document
                .getElementById(
                    "appointmentsPanel"
                )
                .scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }
    );

}


// =====================================================
// SIDEBAR
// =====================================================

if (mobileMenuButton) {

    mobileMenuButton.addEventListener(
        "click",
        () => {

            adminSidebar.classList.toggle(
                "open"
            );

        }
    );

}


if (appointmentsNav) {

    appointmentsNav.addEventListener(
        "click",
        () => {

            adminSidebar.classList.remove(
                "open"
            );

        }
    );

}


if (dashboardNav) {

    dashboardNav.addEventListener(
        "click",
        () => {

            adminSidebar.classList.remove(
                "open"
            );

        }
    );

}


// =====================================================
// STATISTICS
// =====================================================

function updateStatistics() {

    const values =
        Object.values(
            appointments
        );


    setCount(
        "totalCount",
        values.length
    );


    setCount(
        "newCount",
        values.filter(
            item =>
                item.status === "new"
        ).length
    );


    setCount(
        "contactedCount",
        values.filter(
            item =>
                item.status === "contacted"
        ).length
    );


    setCount(
        "confirmedCount",
        values.filter(
            item =>
                item.status === "confirmed"
        ).length
    );


    setCount(
        "completedCount",
        values.filter(
            item =>
                item.status === "completed"
        ).length
    );

}


function setCount(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// =====================================================
// LOGIN / DASHBOARD UI
// =====================================================

function showLogin() {

    loginScreen.style.display =
        "flex";

    dashboard.style.display =
        "none";

}


function showDashboard(
    user
) {

    loginScreen.style.display =
        "none";

    dashboard.style.display =
        "grid";


    if (adminUser) {

        adminUser.textContent =
            user.email || "";

    }

}


function showLoginError(
    message
) {

    if (loginError) {

        loginError.textContent =
            message;

    }

}


function clearLoginError() {

    if (loginError) {

        loginError.textContent =
            "";

    }

}


// =====================================================
// TOAST
// =====================================================

function showToast(
    title,
    message,
    type = "success"
) {

    if (
        !adminToast ||
        !toastTitle ||
        !toastMessage
    ) {

        return;

    }


    clearTimeout(
        toastTimer
    );


    toastTitle.textContent =
        title;


    toastMessage.textContent =
        message;


    adminToast.className =
        `admin-toast ${type}`;


    requestAnimationFrame(
        () => {

            adminToast.classList.add(
                "show"
            );

        }
    );


    toastTimer =
        setTimeout(
            () => {

                adminToast.classList.remove(
                    "show"
                );

            },
            3500
        );

}


// =====================================================
// EMPTY STATE
// =====================================================

function createEmptyState(
    title,
    message
) {

    return `

        <div class="empty-state">

            <div class="empty-state-icon">

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8">

                    <rect
                        x="4"
                        y="4"
                        width="16"
                        height="16"
                        rx="2">
                    </rect>

                    <path d="M8 9h8"></path>
                    <path d="M8 13h5"></path>

                </svg>

            </div>


            <h3>
                ${escapeHtml(title)}
            </h3>


            <p>
                ${escapeHtml(message)}
            </p>

        </div>

    `;

}


// =====================================================
// SECURITY-SAFE HTML ESCAPING
// =====================================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


// =====================================================
// DATE FORMATTING
// =====================================================

function formatDate(
    value
) {

    if (!value) {

        return "Not specified";

    }


    const date =
        new Date(
            `${value}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return escapeHtml(
            value
        );

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =====================================================
// CREATED AT FORMATTING
// =====================================================

function formatCreatedAt(
    value
) {

    if (!value) {

        return "Not available";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Not available";

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}
