import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    set
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
// INITIALIZE FIREBASE
// =====================================================

const app =
    initializeApp(firebaseConfig);

const database =
    getDatabase(app);


// =====================================================
// ELEMENTS
// =====================================================

const appointmentForm =
    document.getElementById("appointmentForm");

const appointmentMessage =
    document.getElementById("appointmentMessage");

const successOverlay =
    document.getElementById("successOverlay");

const successClose =
    document.getElementById("successClose");

const submitButton =
    appointmentForm?.querySelector(
        'button[type="submit"]'
    );


// =====================================================
// SUCCESS MESSAGE
// =====================================================

function showSuccessMessage() {

    if (!successOverlay) {
        return;
    }

    successOverlay.hidden = false;

}


function closeSuccessMessage() {

    if (!successOverlay) {
        return;
    }

    successOverlay.hidden = true;

}


// =====================================================
// CLOSE SUCCESS MESSAGE
// =====================================================

if (successClose) {

    successClose.addEventListener(
        "click",
        closeSuccessMessage
    );

}


// Close when clicking outside the box

if (successOverlay) {

    successOverlay.addEventListener(
        "click",
        (event) => {

            if (
                event.target === successOverlay
            ) {

                closeSuccessMessage();

            }

        }
    );

}


// Close with Escape key

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            successOverlay &&
            !successOverlay.hidden
        ) {

            closeSuccessMessage();

        }

    }
);


// =====================================================
// APPOINTMENT FORM
// =====================================================

if (appointmentForm) {

    appointmentForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // ---------------------------------------------
            // CLEAR PREVIOUS MESSAGE
            // ---------------------------------------------

            if (appointmentMessage) {

                appointmentMessage.textContent = "";

            }


            // ---------------------------------------------
            // DISABLE SUBMIT BUTTON
            // ---------------------------------------------

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.setAttribute(
                    "aria-disabled",
                    "true"
                );

                submitButton.dataset.originalText =
                    submitButton.textContent.trim();

                submitButton.textContent =
                    "Submitting...";

            }


            // ---------------------------------------------
            // GET FORM VALUES
            // ---------------------------------------------

            const name =
                document.getElementById("name")
                    ?.value.trim();

            const email =
                document.getElementById("email")
                    ?.value.trim();

            const phone =
                document.getElementById("phone")
                    ?.value.trim();

            const service =
                document.getElementById("service")
                    ?.value;

            const date =
                document.getElementById("date")
                    ?.value;

            const time =
                document.getElementById("time")
                    ?.value;

            const message =
                document.getElementById("message")
                    ?.value.trim();


            // ---------------------------------------------
            // BASIC VALIDATION
            // ---------------------------------------------

            if (
                !name ||
                !email ||
                !phone ||
                !service ||
                !date ||
                !time ||
                !message
            ) {

                showFormError(
                    "Please complete all required fields."
                );

                restoreSubmitButton();

                return;

            }


            // ---------------------------------------------
            // CREATE DATABASE REFERENCE
            // ---------------------------------------------

            const appointmentRef =
                push(
                    ref(
                        database,
                        "appointments"
                    )
                );


            // ---------------------------------------------
            // APPOINTMENT DATA
            // ---------------------------------------------

            const appointmentData = {

                name: name,

                email: email,

                phone: phone,

                service: service,

                date: date,

                time: time,

                message: message,

                status: "new",

                createdAt:
                    new Date().toISOString()

            };


            // ---------------------------------------------
            // SAVE TO FIREBASE
            // ---------------------------------------------

            try {

                await set(
                    appointmentRef,
                    appointmentData
                );


                // -----------------------------------------
                // RESET FORM
                // -----------------------------------------

                appointmentForm.reset();


                // -----------------------------------------
                // CLEAR FORM ERROR
                // -----------------------------------------

                if (appointmentMessage) {

                    appointmentMessage.textContent = "";

                }


                // -----------------------------------------
                // SHOW CUSTOM SUCCESS
                // -----------------------------------------

                showSuccessMessage();


            } catch (error) {

                console.error(
                    "Appointment submission error:",
                    error
                );


                showFormError(
                    "Unable to submit your appointment right now. Please try again."
                );

            } finally {

                restoreSubmitButton();

            }

        }
    );

}


// =====================================================
// FORM ERROR
// =====================================================

function showFormError(message) {

    if (!appointmentMessage) {
        return;
    }

    appointmentMessage.textContent =
        message;

}


// =====================================================
// RESTORE SUBMIT BUTTON
// =====================================================

function restoreSubmitButton() {

    if (!submitButton) {
        return;
    }


    submitButton.disabled = false;

    submitButton.removeAttribute(
        "aria-disabled"
    );


    submitButton.textContent =
        submitButton.dataset.originalText ||
        "Submit Appointment Request";

}
