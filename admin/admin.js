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

const ADMIN_UID =
    "WnECxfnldyb76ajAYBjFbNFA7qz2";


// =====================================================
// FIREBASE
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

const detailBody =
    document.getElementById("detailBody");

const closeDetail =
    document.getElementById("closeDetail");


// =====================================================
// STATE
// =====================================================

let appointments = {};

let selectedAppointmentId = null;


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


        // ---------------------------------------------
        // STRICT ADMIN UID CHECK
        // ---------------------------------------------

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


            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            clearLoginError();


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

    const appointmentsRef =
        ref(
            database,
            "appointments"
        );


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
                    selectedAppointmentId
                );

            }

        },
        (error) => {

            console.error(
                "Database error:",
                error
            );

            appointmentsList.innerHTML = `
                <div class="empty-state">
                    <h3>Unable to load appointments</h3>
                    <p>Please check your Firebase database permissions.</p>
                </div>
            `;

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
            ([id, item]) => {

                const searchable = [

                    item.name,
                    item.email,
                    item.phone,
                    item.service,
                    item.message

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

        appointmentsList.innerHTML = `
            <div class="empty-state">

                <h3>
                    No appointments found
                </h3>

                <p>
                    New appointment requests will appear here.
                </p>

            </div>
        `;

        return;

    }


    appointmentsList.innerHTML =
        entries
            .map(
                ([id, item]) => {

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
                                        ""
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
                                        ""
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
                                        ""
                                    )}
                                </span>

                            </div>


                            <div>

                                <span
                                    class="status-badge">

                                    ${escapeHtml(
                                        item.status ||
                                        "new"
                                    )}

                                </span>

                            </div>


                            <div>

                                <button
                                    type="button"
                                    class="view-button"
                                    data-view-id="${id}">

                                    View Project

                                </button>

                            </div>

                        </article>

                    `;

                }
            )
            .join("");


    document
        .querySelectorAll(
            "[data-view-id]"
        )
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
// APPOINTMENT DETAILS
// =====================================================

function showAppointmentDetails(id) {

    const item =
        appointments[id];


    if (!item) {
        return;
    }


    selectedAppointmentId =
        id;


    detailBody.innerHTML = `

        <div class="detail-grid">

            <div class="detail-item">

                <label>
                    Client Name
                </label>

                <p>
                    ${escapeHtml(
                        item.name ||
                        "Not provided"
                    )}
                </p>

            </div>


            <div class="detail-item">

                <label>
                    Service
                </label>

                <p>
                    ${escapeHtml(
                        item.service ||
                        "Not provided"
                    )}
                </p>

            </div>


            <div class="detail-item">

                <label>
                    Email
                </label>

                <p>
                    ${escapeHtml(
                        item.email ||
                        "Not provided"
                    )}
                </p>

            </div>


            <div class="detail-item">

                <label>
                    Phone
                </label>

                <p>
                    ${escapeHtml(
                        item.phone ||
                        "Not provided"
                    )}
                </p>

            </div>


            <div class="detail-item">

                <label>
                    Appointment Date
                </label>

                <p>
                    ${formatDate(
                        item.date
                    )}
                </p>

            </div>


            <div class="detail-item">

                <label>
                    Appointment Time
                </label>

                <p>
                    ${escapeHtml(
                        item.time ||
                        "Not provided"
                    )}
                </p>

            </div>


            <div class="detail-item">

                <label>
                    Current Status
                </label>

                <p>
                    ${escapeHtml(
                        item.status ||
                        "new"
                    )}
                </p>

            </div>


            <div class="detail-item">

                <label>
                    Submitted
                </label>

                <p>
                    ${formatCreatedAt(
                        item.createdAt
                    )}
                </p>

            </div>


            <div class="detail-item full">

                <label>
                    Project Requirement
                </label>

                <p>
                    ${escapeHtml(
                        item.message ||
                        "No message provided."
                    )}
                </p>

            </div>

        </div>


        <div class="detail-actions">

            <select
                id="detailStatus">

                <option
                    value="new"
                    ${item.status === "new" ? "selected" : ""}>

                    New

                </option>

                <option
                    value="contacted"
                    ${item.status === "contacted" ? "selected" : ""}>

                    Contacted

                </option>

                <option
                    value="confirmed"
                    ${item.status === "confirmed" ? "selected" : ""}>

                    Confirmed

                </option>

                <option
                    value="completed"
                    ${item.status === "completed" ? "selected" : ""}>

                    Completed

                </option>

            </select>


            <button
                type="button"
                class="btn btn-primary"
                id="saveStatus">

                Update Status

            </button>


            <button
                type="button"
                class="danger-button"
                id="deleteAppointment">

                Delete Appointment

            </button>

        </div>

    `;


    detailView.classList.add(
        "active"
    );


    detailView.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


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
        .getElementById("deleteAppointment")
        .addEventListener(
            "click",
            () => {

                deleteAppointment(
                    id
                );

            }
        );

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


    try {

        await update(
            ref(
                database,
                `appointments/${id}`
            ),
            {
                status:
                    statusElement.value
            }
        );

    } catch (error) {

        console.error(
            "Status update error:",
            error
        );

        alert(
            "Unable to update appointment status."
        );

    }

}


// =====================================================
// DELETE APPOINTMENT
// =====================================================

async function deleteAppointment(id) {

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

    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Unable to delete the appointment."
        );

    }

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

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

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
            item => item.status === "new"
        ).length
    );


    setCount(
        "contactedCount",
        values.filter(
            item => item.status === "contacted"
        ).length
    );


    setCount(
        "confirmedCount",
        values.filter(
            item => item.status === "confirmed"
        ).length
    );


    setCount(
        "completedCount",
        values.filter(
            item => item.status === "completed"
        ).length
    );

}


function setCount(id, value) {

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


function showDashboard(user) {

    loginScreen.style.display =
        "none";

    dashboard.style.display =
        "block";


    if (adminUser) {

        adminUser.textContent =
            user.email || "";

    }

}


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


// =====================================================
// HELPERS
// =====================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function formatDate(value) {

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


function formatCreatedAt(value) {

    if (!value) {
        return "Not available";
    }


    const date =
        new Date(value);


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
