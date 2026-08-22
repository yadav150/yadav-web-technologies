import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    set
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


// =====================================================
// FIREBASE CONFIGURATION
// =====================================================

const firebaseConfig = {

    apiKey: "AIzaSyDFnxF_v-fXGiZeL_OEMzmKrPdR1PE3KfU",

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

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);


// =====================================================
// APPOINTMENT FORM
// =====================================================

const appointmentForm =
    document.getElementById("appointmentForm");


// Stop safely if form does not exist

if (!appointmentForm) {

    console.warn(
        "Appointment form not found."
    );

}


// =====================================================
// SUBMIT APPOINTMENT
// =====================================================

if (appointmentForm) {

    appointmentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // -----------------------------------------
            // FORM ELEMENTS
            // -----------------------------------------

            const name =
                document.getElementById("name");

            const email =
                document.getElementById("email");

            const phone =
                document.getElementById("phone");

            const service =
                document.getElementById("service");

            const date =
                document.getElementById("date");

            const time =
                document.getElementById("time");

            const message =
                document.getElementById("message");


            // -----------------------------------------
            // BASIC VALIDATION
            // -----------------------------------------

            if (
                !name ||
                !email ||
                !phone ||
                !service ||
                !date ||
                !time
            ) {

                console.error(
                    "Required form fields are missing."
                );

                return;

            }


            // -----------------------------------------
            // SUBMIT BUTTON
            // -----------------------------------------

            const submitButton =
                appointmentForm.querySelector(
                    'button[type="submit"]'
                );


            const originalButtonText =
                submitButton
                    ? submitButton.textContent
                    : "";


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Submitting...";

            }


            try {

                // -------------------------------------
                // CREATE NEW APPOINTMENT REFERENCE
                // -------------------------------------

                const appointmentRef =
                    push(
                        ref(
                            database,
                            "appointments"
                        )
                    );


                // -------------------------------------
                // APPOINTMENT DATA
                // -------------------------------------

                const appointmentData = {

                    name:
                        name.value.trim(),

                    email:
                        email.value.trim(),

                    phone:
                        phone.value.trim(),

                    service:
                        service.value.trim(),

                    date:
                        date.value,

                    time:
                        time.value,

                    message:
                        message
                            ? message.value.trim()
                            : "",

                    status:
                        "new",

                    source:
                        "website",

                    createdAt:
                        new Date().toISOString()

                };


                // -------------------------------------
                // SAVE TO FIREBASE
                // -------------------------------------

                await set(
                    appointmentRef,
                    appointmentData
                );


                // -------------------------------------
                // SUCCESS
                // -------------------------------------

                alert(
                    "Your appointment request has been submitted successfully."
                );


                appointmentForm.reset();


            } catch (error) {

                console.error(
                    "Appointment submission failed:",
                    error
                );


                alert(
                    "Unable to submit your appointment right now. Please try again."
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        originalButtonText;

                }

            }

        }
    );

}
