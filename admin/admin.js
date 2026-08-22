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
// INITIALIZE
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

const loginSection =
    document.getElementById("loginSection");

const dashboardSection =
    document.getElementById("dashboardSection");

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");

const logoutBtn =
    document.getElementById("logoutBtn");

const appointmentsBody =
    document.getElementById("appointmentsBody");

const emptyState =
    document.getElementById("emptyState");

const refreshBtn =
    document.getElementById("refreshBtn");

const modal =
    document.getElementById("appointmentModal");

const closeModal =
    document.getElementById("closeModal");

const appointmentDetails =
    document.getElementById("appointmentDetails");

const deleteAppointment =
    document.getElementById("deleteAppointment");


// =====================================================
// CURRENT APPOINTMENT
// =====================================================

let selectedAppointmentId = null;

let appointmentsData = {};


// =====================================================
// LOGIN
// =====================================================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            document.getElementById(
                "adminEmail"
            ).value.trim();


        const password =
            document.getElementById(
                "adminPassword"
            ).value;


        loginMessage.textContent =
            "Signing in...";


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            loginForm.reset();

            loginMessage.textContent = "";


        } catch (error) {

            console.error(error);

            loginMessage.textContent =
                "Invalid email or password.";

        }

    }
);


// =====================================================
// AUTH STATE
// =====================================================

onAuthStateChanged(
    auth,
    (user) => {

        if (user) {

            loginSection.hidden = true;

            dashboardSection.hidden = false;

            loadAppointments();

        } else {

            loginSection.hidden = false;

            dashboardSection.hidden = true;

        }

    }
);


// =====================================================
// LOGOUT
// =====================================================

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

        } catch (error) {

            console.error(error);

        }

    }
);


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

            appointmentsData =
                snapshot.val() || {};

            renderAppointments();

        },
        (error) => {

            console.error(
                "Database error:",
                error
            );

        }
    );

}


// =====================================================
// RENDER APPOINTMENTS
// =====================================================

function renderAppointments() {

    appointmentsBody.innerHTML = "";


    const appointments =
        Object.entries(
            appointmentsData
        );


    if (appointments.length === 0) {

        emptyState.hidden = false;

        updateStatistics([]);

        return;

    }


    emptyState.hidden = true;


    appointments.sort(
        (a, b) => {

            const first =
                new Date(
                    a[1].createdAt || 0
                ).getTime();

            const second =
                new Date(
                    b[1].createdAt || 0
                ).getTime();

            return second - first;

        }
    );


    appointments.forEach(
        ([id, data]) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <strong>
                        ${escapeHTML(data.name || "—")}
                    </strong>

                    <small>
                        ${escapeHTML(data.phone || "")}
                    </small>

                </td>


                <td>
                    ${escapeHTML(data.service || "—")}
                </td>


                <td>
                    ${escapeHTML(data.date || "—")}
                </td>


                <td>
                    ${escapeHTML(data.time || "—")}
                </td>


                <td>

                    <select
                        class="status-select"
                        data-id="${id}">

                        <option value="new"
                            ${data.status === "new" ? "selected" : ""}>
                            New
                        </option>

                        <option value="contacted"
                            ${data.status === "contacted" ? "selected" : ""}>
                            Contacted
                        </option>

                        <option value="confirmed"
                            ${data.status === "confirmed" ? "selected" : ""}>
                            Confirmed
                        </option>

                        <option value="completed"
                            ${data.status === "completed" ? "selected" : ""}>
                            Completed
                        </option>

                    </select>

                </td>


                <td>

                    <button
                        type="button"
                        class="view-btn"
                        data-id="${id}">

                        View

                    </button>

                </td>

            `;


            appointmentsBody.appendChild(row);

        }
    );


    updateStatistics(
        appointments.map(
            item => item[1]
        )
    );

}


// =====================================================
// STATISTICS
// =====================================================

function updateStatistics(
    appointments
) {

    document.getElementById(
        "totalCount"
    ).textContent =
        appointments.length;


    document.getElementById(
        "newCount"
    ).textContent =
        appointments.filter(
            item => item.status === "new"
        ).length;


    document.getElementById(
        "contactedCount"
    ).textContent =
        appointments.filter(
            item => item.status === "contacted"
        ).length;


    document.getElementById(
        "confirmedCount"
    ).textContent =
        appointments.filter(
            item => item.status === "confirmed"
        ).length;


    document.getElementById(
        "completedCount"
    ).textContent =
        appointments.filter(
            item => item.status === "completed"
        ).length;

}


// =====================================================
// STATUS CHANGE
// =====================================================

appointmentsBody.addEventListener(
    "change",
    async (event) => {

        if (
            !event.target.classList.contains(
                "status-select"
            )
        ) {
            return;
        }


        const id =
            event.target.dataset.id;


        const status =
            event.target.value;


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

        } catch (error) {

            console.error(
                "Status update failed:",
                error
            );

        }

    }
);


// =====================================================
// VIEW APPOINTMENT
// =====================================================

appointmentsBody.addEventListener(
    "click",
    (event) => {

        if (
            !event.target.classList.contains(
                "view-btn"
            )
        ) {
            return;
        }


        const id =
            event.target.dataset.id;


        const data =
            appointmentsData[id];


        if (!data) {
            return;
        }


        selectedAppointmentId =
            id;


        appointmentDetails.innerHTML = `

            <div class="detail-row">
                <span>Client</span>
                <strong>
                    ${escapeHTML(data.name || "—")}
                </strong>
            </div>

            <div class="detail-row">
                <span>Email</span>
                <strong>
                    ${escapeHTML(data.email || "—")}
                </strong>
            </div>

            <div class="detail-row">
                <span>Phone</span>
                <strong>
                    ${escapeHTML(data.phone || "—")}
                </strong>
            </div>

            <div class="detail-row">
                <span>Service</span>
                <strong>
                    ${escapeHTML(data.service || "—")}
                </strong>
            </div>

            <div class="detail-row">
                <span>Date</span>
                <strong>
                    ${escapeHTML(data.date || "—")}
                </strong>
            </div>

            <div class="detail-row">
                <span>Time</span>
                <strong>
                    ${escapeHTML(data.time || "—")}
                </strong>
            </div>

            <div class="detail-row detail-message">
                <span>Message</span>
                <p>
                    ${escapeHTML(data.message || "No message provided.")}
                </p>
            </div>

        `;


        modal.hidden = false;

    }
);


// =====================================================
// CLOSE MODAL
// =====================================================

closeModal.addEventListener(
    "click",
    () => {

        modal.hidden = true;

    }
);


modal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === modal
        ) {

            modal.hidden = true;

        }

    }
);


// =====================================================
// DELETE
// =====================================================

deleteAppointment.addEventListener(
    "click",
    async () => {

        if (!selectedAppointmentId) {
            return;
        }


        const confirmed =
            confirm(
                "Delete this appointment permanently?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await remove(
                ref(
                    database,
                    `appointments/${selectedAppointmentId}`
                )
            );


            selectedAppointmentId =
                null;

            modal.hidden = true;


        } catch (error) {

            console.error(
                "Delete failed:",
                error
            );

            alert(
                "Unable to delete the appointment."
            );

        }

    }
);


// =====================================================
// REFRESH
// =====================================================

refreshBtn.addEventListener(
    "click",
    () => {

        renderAppointments();

    }
);


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
