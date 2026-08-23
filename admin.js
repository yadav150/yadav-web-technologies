```javascript
/* =====================================================
   FIREBASE IMPORTS
===================================================== */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    onValue,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


/* =====================================================
   FIREBASE CONFIG
===================================================== */

const firebaseConfig = {

    apiKey:
        "AIzaSyDFnxF_v-fXGiZeL_OEMzmKrPdR1PE3KfU",

    authDomain:
        "auth-project-by-yadav.firebaseapp.com",

    databaseURL:
        "https://auth-project-by-yadav-default-rtdb.firebaseio.com",

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


/* =====================================================
   FIREBASE INITIALIZATION
===================================================== */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const database =
    getDatabase(app);


/* =====================================================
   ADMIN UID
===================================================== */

const ADMIN_UID =
    "WnECxfnldyb76ajAYBjFbNFA7qz2";


/* =====================================================
   DOM
===================================================== */

const loginScreen =
    document.getElementById("loginScreen");

const adminApp =
    document.getElementById("adminApp");

const detailPage =
    document.getElementById("detailPage");

const loginForm =
    document.getElementById("loginForm");

const loginButton =
    document.getElementById("loginButton");

const loginError =
    document.getElementById("loginError");

const logoutButton =
    document.getElementById("logoutButton");

const themeButton =
    document.getElementById("themeButton");

const appointmentsList =
    document.getElementById("appointmentsList");

const statusFilter =
    document.getElementById("statusFilter");

const backButton =
    document.getElementById("backButton");

const shareButton =
    document.getElementById("shareButton");

const shareLoading =
    document.getElementById("shareLoading");

const detailBody =
    document.getElementById("detailBody");

const documentReference =
    document.getElementById("documentReference");


/* =====================================================
   STATE
===================================================== */

let appointments = {};

let currentAppointment = null;

let unsubscribeAppointments = null;


/* =====================================================
   LOGIN
===================================================== */

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        loginError.classList.remove("show");

        const email =
            document
                .getElementById("adminEmail")
                .value
                .trim();

        const password =
            document
                .getElementById("adminPassword")
                .value;


        loginButton.disabled = true;

        loginButton.textContent =
            "Signing in...";


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        } catch (error) {

            console.error(error);

            loginError.textContent =
                "Invalid admin email or password.";

            loginError.classList.add("show");

        } finally {

            loginButton.disabled = false;

            loginButton.textContent =
                "Sign In";

        }

    }
);


/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            showLogin();

            return;

        }


        /* ---------------------------------------------
           UID SECURITY CHECK
        --------------------------------------------- */

        if (user.uid !== ADMIN_UID) {

            signOut(auth);

            showLogin();

            loginError.textContent =
                "This account is not authorized for the admin panel.";

            loginError.classList.add("show");

            return;

        }


        showAdmin();

        loadAppointments();

    }
);


/* =====================================================
   SHOW LOGIN
===================================================== */

function showLogin() {

    loginScreen.style.display =
        "flex";

    adminApp.style.display =
        "none";

    detailPage.style.display =
        "none";

}


/* =====================================================
   SHOW ADMIN
===================================================== */

function showAdmin() {

    loginScreen.style.display =
        "none";

    adminApp.style.display =
        "block";

    detailPage.style.display =
        "none";

}


/* =====================================================
   LOAD APPOINTMENTS
===================================================== */

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

                renderDashboard();

            },
            (error) => {

                console.error(
                    "Database error:",
                    error
                );

                appointmentsList.innerHTML = `
                    <div class="empty-state">
                        Unable to load appointments.
                    </div>
                `;

            }
        );

}


/* =====================================================
   DASHBOARD
===================================================== */

function renderDashboard() {

    const records =
        Object.entries(appointments);


    updateStatistics(records);

    renderAppointmentList(records);

}


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics(records) {

    let pending = 0;
    let confirmed = 0;
    let completed = 0;


    records.forEach(
        ([id, appointment]) => {

            const status =
                getStatus(appointment);


            if (status === "pending") {
                pending++;
            }

            if (status === "confirmed") {
                confirmed++;
            }

            if (status === "completed") {
                completed++;
            }

        }
    );


    document.getElementById(
        "totalCount"
    ).textContent =
        records.length;


    document.getElementById(
        "pendingCount"
    ).textContent =
        pending;


    document.getElementById(
        "confirmedCount"
    ).textContent =
        confirmed;


    document.getElementById(
        "completedCount"
    ).textContent =
        completed;

}


/* =====================================================
   RENDER LIST
===================================================== */

function renderAppointmentList(records) {

    const filter =
        statusFilter.value;


    const filtered =
        records.filter(
            ([id, appointment]) => {

                if (filter === "all") {
                    return true;
                }

                return getStatus(
                    appointment
                ) === filter;

            }
        );


    if (!filtered.length) {

        appointmentsList.innerHTML = `
            <div class="empty-state">
                No appointments found.
            </div>
        `;

        return;

    }


    filtered.sort(
        (a, b) => {

            const first =
                a[1].createdAt || 0;

            const second =
                b[1].createdAt || 0;

            return second - first;

        }
    );


    appointmentsList.innerHTML =
        filtered
            .map(
                ([id, appointment]) =>
                    createAppointmentCard(
                        id,
                        appointment
                    )
            )
            .join("");

}


/* =====================================================
   APPOINTMENT CARD
===================================================== */

function createAppointmentCard(
    id,
    appointment
) {

    const status =
        getStatus(appointment);

    const statusClass =
        `status-${status}`;


    const name =
        escapeHTML(
            appointment.name ||
            "Unnamed Client"
        );


    const service =
        escapeHTML(
            appointment.service ||
            "Service not specified"
        );


    const email =
        escapeHTML(
            appointment.email ||
            "No email"
        );


    const phone =
        escapeHTML(
            appointment.phone ||
            "No phone"
        );


    const date =
        escapeHTML(
            appointment.date ||
            "Not specified"
        );


    const time =
        escapeHTML(
            appointment.time ||
            "Not specified"
        );


    return `

        <article class="appointment-card">

            <div class="appointment-main">

                <div class="appointment-top">

                    <span class="appointment-name">
                        ${name}
                    </span>

                    <span class="status-badge ${statusClass}">
                        ${capitalize(status)}
                    </span>

                </div>


                <div class="appointment-meta">

                    <span>
                        ${date}
                    </span>

                    <span>
                        ${time}
                    </span>

                    <span>
                        ${email}
                    </span>

                    <span>
                        ${phone}
                    </span>

                </div>


                <div class="appointment-service">

                    ${service}

                </div>

            </div>


            <div class="appointment-actions">

                <button
                    class="small-btn"
                    data-view="${id}">

                    View

                </button>

                <button
                    class="small-btn danger"
                    data-delete="${id}">

                    Delete

                </button>

            </div>

        </article>

    `;

}


/* =====================================================
   FILTER
===================================================== */

statusFilter.addEventListener(
    "change",
    renderDashboard
);


/* =====================================================
   CARD ACTIONS
===================================================== */

appointmentsList.addEventListener(
    "click",
    async (event) => {

        const viewButton =
            event.target.closest(
                "[data-view]"
            );


        const deleteButton =
            event.target.closest(
                "[data-delete]"
            );


        if (viewButton) {

            const id =
                viewButton.dataset.view;

            openAppointment(
                id
            );

        }


        if (deleteButton) {

            const id =
                deleteButton.dataset.delete;

            await deleteAppointment(
                id
            );

        }

    }
);


/* =====================================================
   OPEN DETAIL PAGE
===================================================== */

function openAppointment(id) {

    const appointment =
        appointments[id];


    if (!appointment) {
        return;
    }


    currentAppointment = {
        id,
        ...appointment
    };


    renderAppointmentDetail(
        currentAppointment
    );


    adminApp.style.display =
        "none";

    detailPage.style.display =
        "block";

    window.scrollTo(
        0,
        0
    );

}


/* =====================================================
   RENDER DETAIL
===================================================== */

function renderAppointmentDetail(
    appointment
) {

    const id =
        appointment.id;


    documentReference.textContent =
        `Appointment ID: ${id}`;


    const status =
        getStatus(appointment);


    detailBody.innerHTML = `

        <section class="detail-section">

            <div class="detail-section-title">
                Client Information
            </div>


            <div class="detail-grid">

                ${detailItem(
                    "Name",
                    appointment.name
                )}

                ${detailItem(
                    "Email",
                    appointment.email
                )}

                ${detailItem(
                    "Phone",
                    appointment.phone
                )}

            </div>

        </section>


        <section class="detail-section">

            <div class="detail-section-title">
                Appointment Information
            </div>


            <div class="detail-grid">

                ${detailItem(
                    "Service",
                    appointment.service
                )}

                ${detailItem(
                    "Date",
                    appointment.date
                )}

                ${detailItem(
                    "Time",
                    appointment.time
                )}

                ${detailItem(
                    "Status",
                    capitalize(status)
                )}

            </div>

        </section>


        ${renderAdditionalDetails(
            appointment
        )}


        <section class="detail-section">

            <div class="detail-section-title">
                Manage Status
            </div>


            <div class="detail-grid">

                ${detailItem(
                    "Current Status",
                    capitalize(status)
                )}

            </div>


            <div style="
                display:flex;
                flex-wrap:wrap;
                gap:8px;
                margin-top:12px;
            ">

                <button
                    type="button"
                    class="small-btn"
                    data-detail-status="pending">

                    Pending

                </button>

                <button
                    type="button"
                    class="small-btn"
                    data-detail-status="confirmed">

                    Confirmed

                </button>

                <button
                    type="button"
                    class="small-btn"
                    data-detail-status="completed">

                    Completed

                </button>

                <button
                    type="button"
                    class="small-btn"
                    data-detail-status="cancelled">

                    Cancelled

                </button>

            </div>

        </section>

    `;

}


/* =====================================================
   DETAIL ITEM
===================================================== */

function detailItem(
    label,
    value
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        value =
            "Not provided";

    }


    return `

        <div class="detail-item">

            <div class="detail-label">
                ${escapeHTML(label)}
            </div>

            <div class="detail-value">
                ${escapeHTML(
                    String(value)
                )}
            </div>

        </div>

    `;

}


/* =====================================================
   ADDITIONAL DETAILS
===================================================== */

function renderAdditionalDetails(
    appointment
) {

    const knownFields = [
        "id",
        "name",
        "email",
        "phone",
        "service",
        "date",
        "time",
        "status",
        "createdAt"
    ];


    const additional =
        Object.entries(appointment)
            .filter(
                ([key, value]) => {

                    return (
                        !knownFields.includes(key) &&
                        value !== null &&
                        value !== undefined &&
                        value !== ""
                    );

                }
            );


    if (!additional.length) {
        return "";
    }


    return `

        <section class="detail-section">

            <div class="detail-section-title">
                Additional Information
            </div>


            <div class="detail-grid">

                ${additional
                    .map(
                        ([key, value]) =>
                            detailItem(
                                formatLabel(key),
                                value
                            )
                    )
                    .join("")}

            </div>

        </section>

    `;

}


/* =====================================================
   DETAIL STATUS ACTION
===================================================== */

detailBody.addEventListener(
    "click",
    async (event) => {

        const button =
            event.target.closest(
                "[data-detail-status]"
            );


        if (!button ||
            !currentAppointment) {

            return;

        }


        const status =
            button.dataset.detailStatus;


        await updateAppointmentStatus(
            currentAppointment.id,
            status
        );

    }
);


/* =====================================================
   UPDATE STATUS
===================================================== */

async function updateAppointmentStatus(
    id,
    status
) {

    try {

        await update(
            ref(
                database,
                `appointments/${id}`
            ),
            {
                status: status
            }
        );


        currentAppointment.status =
            status;


        renderAppointmentDetail(
            currentAppointment
        );

    } catch (error) {

        console.error(error);

        alert(
            "Unable to update appointment status."
        );

    }

}


/* =====================================================
   DELETE
===================================================== */

async function deleteAppointment(
    id
) {

    const appointment =
        appointments[id];


    const name =
        appointment?.name ||
        "this appointment";


    const confirmed =
        window.confirm(
            `Delete ${name}? This action cannot be undone.`
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


        if (
            currentAppointment &&
            currentAppointment.id === id
        ) {

            closeDetail();

        }

    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete appointment."
        );

    }

}


/* =====================================================
   BACK
===================================================== */

backButton.addEventListener(
    "click",
    closeDetail
);


function closeDetail() {

    currentAppointment =
        null;

    detailPage.style.display =
        "none";

    adminApp.style.display =
        "block";

}


/* =====================================================
   SHARE APPOINTMENT AS IMAGE
===================================================== */

shareButton.addEventListener(
    "click",
    shareAppointment
);


async function shareAppointment() {

    if (!currentAppointment) {
        return;
    }


    if (
        typeof html2canvas ===
        "undefined"
    ) {

        alert(
            "Image generator is unavailable."
        );

        return;

    }


    shareLoading.classList.add(
        "show"
    );


    try {

        const documentElement =
            document.getElementById(
                "appointmentDocument"
            );


        const canvas =
            await html2canvas(
                documentElement,
                {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#ffffff"
                }
            );


        const blob =
            await new Promise(
                (resolve) => {

                    canvas.toBlob(
                        resolve,
                        "image/png"
                    );

                }
            );


        if (!blob) {
            throw new Error(
                "Image generation failed."
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


        /* ---------------------------------------------
           NATIVE SHARE
        --------------------------------------------- */

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
                    "Appointment details",

                files: [
                    file
                ]

            });


        } else {

            /* -----------------------------------------
               FALLBACK DOWNLOAD
            ----------------------------------------- */

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
                "appointment-details.png";

            document.body.appendChild(
                link
            );

            link.click();

            link.remove();

            URL.revokeObjectURL(
                url
            );


            alert(
                "Image generated. Your browser does not support direct image sharing, so the image was saved instead."
            );

        }

    } catch (error) {

        if (
            error.name !==
            "AbortError"
        ) {

            console.error(
                error
            );

            alert(
                "Unable to generate or share the appointment image."
            );

        }

    } finally {

        shareLoading.classList.remove(
            "show"
        );

    }

}


/* =====================================================
   LOGOUT
===================================================== */

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

        } catch (error) {

            console.error(error);

        }

    }
);


/* =====================================================
   THEME
===================================================== */

themeButton.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );


        localStorage.setItem(
            "adminTheme",
            document.body.classList.contains(
                "dark"
            )
                ? "dark"
                : "light"
        );

    }
);


if (
    localStorage.getItem(
        "adminTheme"
    ) === "dark"
) {

    document.body.classList.add(
        "dark"
    );

}


/* =====================================================
   HELPERS
===================================================== */

function getStatus(
    appointment
) {

    const status =
        String(
            appointment.status ||
            "pending"
        ).toLowerCase();


    const valid = [
        "pending",
        "confirmed",
        "completed",
        "cancelled"
    ];


    return valid.includes(status)
        ? status
        : "pending";

}


function capitalize(
    value
) {

    return String(value)
        .charAt(0)
        .toUpperCase() +
        String(value)
            .slice(1);

}


function formatLabel(
    value
) {

    return String(value)
        .replace(
            /([A-Z])/g,
            " $1"
        )
        .replace(
            /[_-]+/g,
            " "
        )
        .replace(
            /^\w/,
            (letter) =>
                letter.toUpperCase()
        );

}


function escapeHTML(
    value
) {

    return String(value)
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
```
