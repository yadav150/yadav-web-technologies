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
// ADMIN UID
// =====================================================

const ADMIN_UID =
    "WnECxfnldyb76ajAYBjFbNFA7qz2";


// =====================================================
// FIREBASE INITIALIZATION
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

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginError =
    document.getElementById("loginError");

const logoutButton =
    document.getElementById("logoutButton");

const refreshButton =
    document.getElementById("refreshButton");

const adminUser =
    document.getElementById("adminUser");

const appointmentsList =
    document.getElementById("appointmentsList");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const totalCount =
    document.getElementById("totalCount");

const newCount =
    document.getElementById("newCount");

const contactedCount =
    document.getElementById("contactedCount");

const confirmedCount =
    document.getElementById("confirmedCount");

const completedCount =
    document.getElementById("completedCount");

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

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const adminSidebar =
    document.getElementById("adminSidebar");

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

let selectedAppointment = null;

let unsubscribeAppointments = null;

let toastTimer = null;


// =====================================================
// SECURITY CHECK
// =====================================================

function isAdmin(user) {

    return Boolean(
        user &&
        user.uid === ADMIN_UID
    );

}


// =====================================================
// AUTH STATE
// =====================================================

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            showLogin();

            stopAppointmentsListener();

            return;

        }


        if (!isAdmin(user)) {

            showLogin();

            stopAppointmentsListener();

            signOut(auth);

            showLoginError(
                "This account is not authorized to access the admin panel."
            );

            return;

        }


        showDashboard();

        adminUser.textContent =
            user.email || "Administrator";

        startAppointmentsListener();

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


            const email =
                loginEmail.value.trim();

            const password =
                loginPassword.value;


            if (!email || !password) {

                showLoginError(
                    "Please enter your email and password."
                );

                return;

            }


            const button =
                loginForm.querySelector(
                    'button[type="submit"]'
                );


            if (button) {

                button.disabled = true;
                button.textContent =
                    "Signing in...";

            }


            clearLoginError();


            try {

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                showLoginError(
                    getLoginErrorMessage(error)
                );

            } finally {

                if (button) {

                    button.disabled =
                        false;

                    button.textContent =
                        "Sign In";

                }

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

            try {

                await signOut(auth);

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                showToast(
                    "Error",
                    "Unable to sign out.",
                    "error"
                );

            }

        }
    );

}


// =====================================================
// SHOW / HIDE
// =====================================================

function showLogin() {

    loginScreen.style.display =
        "flex";

    dashboard.style.display =
        "none";

}


function showDashboard() {

    loginScreen.style.display =
        "none";

    dashboard.style.display =
        "grid";

}


// =====================================================
// LOGIN ERROR
// =====================================================

function showLoginError(message) {

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


function getLoginErrorMessage(error) {

    if (
        error.code ===
        "auth/invalid-credential"
    ) {

        return "Invalid email or password.";

    }

    if (
        error.code ===
        "auth/user-not-found"
    ) {

        return "No account was found with this email.";

    }

    if (
        error.code ===
        "auth/wrong-password"
    ) {

        return "Incorrect password.";

    }

    if (
        error.code ===
        "auth/too-many-requests"
    ) {

        return "Too many attempts. Please try again later.";

    }

    return "Unable to sign in. Please try again.";

}


// =====================================================
// DATABASE LISTENER
// =====================================================

function startAppointmentsListener() {

    stopAppointmentsListener();


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

                renderDashboard();

            },
            (error) => {

                console.error(
                    "Database read error:",
                    error
                );


                showToast(
                    "Database Error",
                    "Unable to load appointments.",
                    "error"
                );

            }
        );

}


function stopAppointmentsListener() {

    if (
        unsubscribeAppointments
    ) {

        unsubscribeAppointments();

        unsubscribeAppointments =
            null;

    }

}


// =====================================================
// REFRESH
// =====================================================

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        () => {

            renderDashboard();

            showToast(
                "Refreshed",
                "Appointment list has been refreshed.",
                "success"
            );

        }
    );

}


// =====================================================
// SEARCH
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

    const list =
        Object.values(
            appointments
        );


    totalCount.textContent =
        list.length;


    newCount.textContent =
        list.filter(
            item =>
                getStatus(item) === "new"
        ).length;


    contactedCount.textContent =
        list.filter(
            item =>
                getStatus(item) === "contacted"
        ).length;


    confirmedCount.textContent =
        list.filter(
            item =>
                getStatus(item) === "confirmed"
        ).length;


    completedCount.textContent =
        list.filter(
            item =>
                getStatus(item) === "completed"
        ).length;

}


// =====================================================
// STATUS
// =====================================================

function getStatus(item) {

    return (
        item?.status ||
        "new"
    ).toLowerCase();

}


// =====================================================
// FILTER + SORT
// =====================================================

function getFilteredAppointments() {

    const search =
        searchInput?.value
            .trim()
            .toLowerCase() ||
        "";


    const selectedStatus =
        statusFilter?.value ||
        "all";


    return Object.entries(
        appointments
    )
        .filter(
            ([id, item]) => {

                const searchableText =
                    [
                        item?.name,
                        item?.email,
                        item?.phone,
                        item?.service,
                        item?.date,
                        item?.time,
                        item?.message
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchableText.includes(
                        search
                    );


                const matchesStatus =
                    selectedStatus === "all" ||
                    getStatus(item) ===
                        selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        )
        .sort(
            ([, a], [, b]) => {

                const dateA =
                    new Date(
                        a?.createdAt || 0
                    ).getTime();

                const dateB =
                    new Date(
                        b?.createdAt || 0
                    ).getTime();

                return dateB - dateA;

            }
        );

}


// =====================================================
// APPOINTMENT LIST
// =====================================================

function renderAppointments() {

    if (!appointmentsList) {
        return;
    }


    const filtered =
        getFilteredAppointments();


    if (!filtered.length) {

        appointmentsList.innerHTML =
            `
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
                    No appointments found
                </h3>

                <p>
                    Try changing your search or status filter.
                </p>

            </div>
            `;

        return;

    }


    appointmentsList.innerHTML =
        filtered
            .map(
                ([id, item]) =>
                    createAppointmentRow(
                        id,
                        item
                    )
            )
            .join("");


    appointmentsList
        .querySelectorAll(
            "[data-view-id]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.viewId;

                        openAppointment(
                            id
                        );

                    }
                );

            }
        );

}


// =====================================================
// APPOINTMENT ROW
// =====================================================

function createAppointmentRow(
    id,
    item
) {

    const status =
        getStatus(item);


    const safeName =
        escapeHTML(
            item?.name ||
            "Unknown"
        );


    const safeEmail =
        escapeHTML(
            item?.email ||
            "No email"
        );


    const safePhone =
        escapeHTML(
            item?.phone ||
            "No phone"
        );


    const safeService =
        escapeHTML(
            item?.service ||
            "Not specified"
        );


    const safeDate =
        escapeHTML(
            item?.date ||
            "No date"
        );


    const safeTime =
        escapeHTML(
            item?.time ||
            "No time"
        );


    return `
        <article class="appointment-row">

            <div class="appointment-client">

                <strong>
                    ${safeName}
                </strong>

                <span>
                    ${safeEmail}
                </span>

                <span>
                    ${safePhone}
                </span>

            </div>


            <div class="appointment-service">

                <strong>
                    ${safeService}
                </strong>

                <span>
                    Appointment Request
                </span>

            </div>


            <div class="appointment-date">

                <strong>
                    ${safeDate}
                </strong>

                <span>
                    ${safeTime}
                </span>

            </div>


            <div>

                <span
                    class="status-badge status-${escapeHTML(status)}">

                    ${escapeHTML(status)}

                </span>

            </div>


            <div>

                <button
                    type="button"
                    class="view-button"
                    data-view-id="${escapeHTML(id)}">

                    View

                </button>

            </div>

        </article>
    `;

}


// =====================================================
// OPEN DETAIL
// =====================================================

function openAppointment(id) {

    const item =
        appointments[id];


    if (!item) {

        showToast(
            "Error",
            "Appointment could not be found.",
            "error"
        );

        return;

    }


    selectedAppointment = {
        id,
        data: item
    };


    renderDetail(
        id,
        item
    );


    detailView.classList.add(
        "active"
    );


    detailView.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// =====================================================
// DETAIL VIEW
// =====================================================

function renderDetail(
    id,
    item
) {

    const status =
        getStatus(item);


    detailTopGrid.innerHTML =
        `
        <div class="detail-summary">

            ${detailField(
                "Name",
                item?.name
            )}

            ${detailField(
                "Email",
                item?.email
            )}

            ${detailField(
                "Phone",
                item?.phone
            )}

            ${detailField(
                "Service",
                item?.service
            )}

            ${detailField(
                "Date",
                item?.date
            )}

            ${detailField(
                "Time",
                item?.time
            )}

        </div>


        <div class="detail-status-card">

            <span class="detail-status-card-label">
                Appointment Status
            </span>

            <select
                id="detailStatusSelect">

                <option
                    value="new"
                    ${status === "new" ? "selected" : ""}>
                    New
                </option>

                <option
                    value="contacted"
                    ${status === "contacted" ? "selected" : ""}>
                    Contacted
                </option>

                <option
                    value="confirmed"
                    ${status === "confirmed" ? "selected" : ""}>
                    Confirmed
                </option>

                <option
                    value="completed"
                    ${status === "completed" ? "selected" : ""}>
                    Completed
                </option>

            </select>


            <button
                type="button"
                class="detail-primary-button"
                id="saveStatusButton">

                Save Status

            </button>

        </div>
        `;


    detailMessageBox.innerHTML =
        `
        <div class="detail-message-head">

            <strong>
                Customer Message
            </strong>

        </div>

        <div class="detail-message-content">

            ${escapeHTML(
                item?.message ||
                "No message provided."
            )}

        </div>
        `;


    detailActions.innerHTML =
        `
        <button
            type="button"
            class="share-button"
            id="shareAppointmentButton">

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

                <path d="m8.6 13.5 6.8 3.9"></path>
                <path d="m15.4 6.6-6.8 3.9"></path>

            </svg>

            Share Appointment

        </button>


        <button
            type="button"
            class="danger-button"
            id="deleteAppointmentButton">

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

                <path d="M6 7l1 13h10l1-13"></path>

                <path d="M9 7V4h6v3"></path>

            </svg>

            Delete Appointment

        </button>
        `;


    const saveStatusButton =
        document.getElementById(
            "saveStatusButton"
        );


    if (saveStatusButton) {

        saveStatusButton.addEventListener(
            "click",
            () => {

                saveAppointmentStatus(
                    id
                );

            }
        );

    }


    const deleteButton =
        document.getElementById(
            "deleteAppointmentButton"
        );


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            () => {

                deleteAppointment(
                    id
                );

            }
        );

    }


    const shareButton =
        document.getElementById(
            "shareAppointmentButton"
        );


    if (shareButton) {

        shareButton.addEventListener(
            "click",
            () => {

                shareAppointmentAsImage(
                    id,
                    item
                );

            }
        );

    }

}


// =====================================================
// DETAIL FIELD
// =====================================================

function detailField(
    label,
    value
) {

    return `
        <div class="detail-item">

            <label>
                ${escapeHTML(label)}
            </label>

            <p>
                ${escapeHTML(
                    value ||
                    "Not provided"
                )}
            </p>

        </div>
    `;

}


// =====================================================
// CLOSE DETAIL
// =====================================================

if (closeDetail) {

    closeDetail.addEventListener(
        "click",
        () => {

            closeAppointmentDetail();

        }
    );

}


function closeAppointmentDetail() {

    detailView.classList.remove(
        "active"
    );

    selectedAppointment =
        null;

}


// =====================================================
// SAVE STATUS
// =====================================================

async function saveAppointmentStatus(
    id
) {

    if (!isAdmin(auth.currentUser)) {

        showToast(
            "Access Denied",
            "You are not authorized to perform this action.",
            "error"
        );

        return;

    }


    const select =
        document.getElementById(
            "detailStatusSelect"
        );


    const button =
        document.getElementById(
            "saveStatusButton"
        );


    if (!select) {
        return;
    }


    const newStatus =
        select.value;


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Saving...";

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
            "Status Updated",
            "Appointment status has been updated.",
            "success"
        );


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        showToast(
            "Update Failed",
            "Unable to update appointment status.",
            "error"
        );

    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Save Status";

        }

    }

}


// =====================================================
// DELETE APPOINTMENT
// =====================================================

async function deleteAppointment(
    id
) {

    if (!isAdmin(auth.currentUser)) {

        showToast(
            "Access Denied",
            "You are not authorized to perform this action.",
            "error"
        );

        return;

    }


    const confirmed =
        window.confirm(
            "Are you sure you want to permanently delete this appointment?"
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


        closeAppointmentDetail();


        showToast(
            "Deleted",
            "Appointment has been deleted.",
            "success"
        );


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        showToast(
            "Delete Failed",
            "Unable to delete the appointment.",
            "error"
        );

    }

}


// =====================================================
// SHARE APPOINTMENT AS IMAGE
// =====================================================

async function shareAppointmentAsImage(
    id,
    item
) {

    const button =
        document.getElementById(
            "shareAppointmentButton"
        );


    if (!button) {
        return;
    }


    const originalText =
        button.innerHTML;


    button.disabled =
        true;

    button.textContent =
        "Generating Image...";


    try {

        await buildShareCard(
            item
        );


        const canvas =
            await renderShareCard();


        const blob =
            await canvasToBlob(
                canvas
            );


        if (!blob) {

            throw new Error(
                "Unable to generate image."
            );

        }


        const file =
            new File(
                [
                    blob
                ],
                "appointment-details.png",
                {
                    type:
                        "image/png"
                }
            );


        // =================================================
        // NATIVE SHARE
        // =================================================

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
                    "Appointment details from Yadav Web Technologies.",
                files:
                    [file]
            });


            showToast(
                "Shared",
                "Appointment image is ready and shared.",
                "success"
            );


        } else {

            // =================================================
            // FALLBACK DOWNLOAD
            // =================================================

            downloadBlob(
                blob,
                "appointment-details.png"
            );


            showToast(
                "Image Generated",
                "Your appointment image has been generated.",
                "success"
            );

        }


    } catch (error) {

        if (
            error?.name !==
            "AbortError"
        ) {

            console.error(
                "Share image error:",
                error
            );


            showToast(
                "Share Failed",
                "Unable to generate the appointment image.",
                "error"
            );

        }

    } finally {

        button.disabled =
            false;

        button.innerHTML =
            originalText;

    }

}


// =====================================================
// BUILD SHARE CARD
// =====================================================

async function buildShareCard(
    item
) {

    const subtitle =
        document.getElementById(
            "shareCardSubtitle"
        );


    const grid =
        document.getElementById(
            "shareCardGrid"
        );


    if (!subtitle || !grid) {
        return;
    }


    subtitle.textContent =
        `Appointment request for ${
            item?.name ||
            "Customer"
        }`;


    grid.innerHTML =
        `
        ${shareField(
            "Name",
            item?.name
        )}

        ${shareField(
            "Email",
            item?.email
        )}

        ${shareField(
            "Phone",
            item?.phone
        )}

        ${shareField(
            "Service",
            item?.service
        )}

        ${shareField(
            "Date",
            item?.date
        )}

        ${shareField(
            "Time",
            item?.time
        )}

        ${shareField(
            "Status",
            getStatus(item)
        )}

        ${shareField(
            "Message",
            item?.message,
            true
        )}
        `;

}


// =====================================================
// SHARE FIELD
// =====================================================

function shareField(
    label,
    value,
    full = false
) {

    return `
        <div
            class="share-card-field ${
                full ? "full" : ""
            }">

            <span class="share-card-label">
                ${escapeHTML(label)}
            </span>

            <div class="share-card-value">
                ${escapeHTML(
                    value ||
                    "Not provided"
                )}
            </div>

        </div>
    `;

}


// =====================================================
// RENDER HTML TO CANVAS
// Uses html2canvas dynamically.
// =====================================================

async function renderShareCard() {

    if (
        typeof window.html2canvas !==
        "function"
    ) {

        await loadHtml2Canvas();

    }


    const element =
        document.getElementById(
            "shareCardRender"
        );


    if (!element) {

        throw new Error(
            "Share card element not found."
        );

    }


    return await window.html2canvas(
        element,
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


// =====================================================
// LOAD HTML2CANVAS
// =====================================================

function loadHtml2Canvas() {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const existing =
                document.querySelector(
                    'script[data-html2canvas]'
                );


            if (existing) {

                existing.addEventListener(
                    "load",
                    resolve,
                    {
                        once: true
                    }
                );

                existing.addEventListener(
                    "error",
                    reject,
                    {
                        once: true
                    }
                );

                return;

            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

            script.async =
                true;

            script.dataset.html2canvas =
                "true";


            script.onload =
                resolve;

            script.onerror =
                () =>
                    reject(
                        new Error(
                            "Unable to load image generator."
                        )
                    );


            document.head.appendChild(
                script
            );

        }
    );

}


// =====================================================
// CANVAS → BLOB
// =====================================================

function canvasToBlob(
    canvas
) {

    return new Promise(
        resolve => {

            canvas.toBlob(
                resolve,
                "image/png"
            );

        }
    );

}


// =====================================================
// DOWNLOAD FALLBACK
// =====================================================

function downloadBlob(
    blob,
    filename
) {

    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;

    link.download =
        filename;

    document.body.appendChild(
        link
    );


    link.click();

    link.remove();


    setTimeout(
        () => {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );

}


// =====================================================
// MOBILE SIDEBAR
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


// =====================================================
// SIDEBAR NAVIGATION
// =====================================================

const dashboardNav =
    document.getElementById(
        "dashboardNav"
    );

const appointmentsNav =
    document.getElementById(
        "appointmentsNav"
    );


if (dashboardNav) {

    dashboardNav.addEventListener(
        "click",
        () => {

            setActiveNav(
                dashboardNav
            );

            closeAppointmentDetail();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            closeMobileSidebar();

        }
    );

}


if (appointmentsNav) {

    appointmentsNav.addEventListener(
        "click",
        () => {

            setActiveNav(
                appointmentsNav
            );

            document
                .getElementById(
                    "appointmentsPanel"
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            closeMobileSidebar();

        }
    );

}


function setActiveNav(
    activeButton
) {

    document
        .querySelectorAll(
            ".admin-nav button"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

            }
        );


    activeButton.classList.add(
        "active"
    );

}


function closeMobileSidebar() {

    if (
        adminSidebar &&
        window.innerWidth <= 800
    ) {

        adminSidebar.classList.remove(
            "open"
        );

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
        `admin-toast ${type} show`;


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
// HTML ESCAPE
// =====================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// INITIAL STATE
// =====================================================

showLogin();
```
