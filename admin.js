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
    "REPLACE_WITH_YOUR_ADMIN_UID";


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

const shareCardRender =
    document.getElementById("shareCardRender");

const shareCardSubtitle =
    document.getElementById("shareCardSubtitle");

const shareCardGrid =
    document.getElementById("shareCardGrid");


// =====================================================
// STATE
// =====================================================

let appointments = {};

let selectedAppointmentId = null;


// =====================================================
// AUTH
// =====================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            showLogin();

            return;

        }


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
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("loginPassword")
                    .value;


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
                error
            );

            appointmentsList.innerHTML = `
                <div class="empty-state">

                    <h3>
                        Unable to load appointments
                    </h3>

                    <p>
                        Please check your Firebase database permissions.
                    </p>

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
            ([, item]) => {

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
                ([id, item]) => `

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

                `
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
// DETAILS
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

                Share

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

}


// =====================================================
// SHARE APPOINTMENT AS IMAGE
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


        /*
         * Native Android / mobile share sheet
         */

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

                files: [file]

            });

        }

        /*
         * Desktop / browsers without file sharing:
         * download the generated image.
         */

        else {

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


            alert(
                "The appointment image has been generated and downloaded."
            );

        }

    } catch (error) {

        /*
         * User closing the native share sheet
         * is not an actual application error.
         */

        if (
            error?.name !==
            "AbortError"
        ) {

            console.error(
                "Share error:",
                error
            );

            alert(
                "Unable to generate the appointment image."
            );

        }

    } finally {

        if (button) {

            button.disabled = false;

            button.innerHTML =
                button.dataset.originalText ||
                "Share";

        }

    }

}


// =====================================================
// BUILD SHARE CARD
// =====================================================

function buildShareCard(item) {

    if (
        !shareCardRender ||
        !shareCardGrid
    ) {

        throw new Error(
            "Share card template not found."
        );

    }


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
            formatCreatedAt(
                item.createdAt
            )
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
            class="share-card-field ${full ? "full" : ""}">

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
// HTML → CANVAS
//
// Uses html2canvas dynamically.
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

            scale: 2,

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


// =====================================================
// CANVAS → BLOB
// =====================================================

function canvasToBlob(canvas) {

    return new Promise(
        (resolve, reject) => {

            canvas.toBlob(
                (blob) => {

                    if (blob) {

                        resolve(
                            blob
                        );

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
// UPDATE STATUS
// =====================================================

async function updateAppointmentStatus(
    id
) {

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
            error
        );

        alert(
            "Unable to update appointment status."
        );

    }

}


// =====================================================
// DELETE
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

    } catch (error) {

        console.error(
            error
        );

        alert(
            "Unable to delete the appointment."
        );

    }

}


// =====================================================
// CLOSE DETAILS
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
// LOGIN UI
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
        "block";


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
// HELPERS
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
