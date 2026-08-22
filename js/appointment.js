import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    set
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


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

const database =
    getDatabase(app);


const appointmentForm =
    document.getElementById("appointmentForm");

const appointmentMessage =
    document.getElementById("appointmentMessage");

const successOverlay =
    document.getElementById("successOverlay");

const successClose =
    document.getElementById("successClose");


function showSuccessMessage() {

    if (successOverlay) {
        successOverlay.hidden = false;
    }

}


function closeSuccessMessage() {

    if (successOverlay) {
        successOverlay.hidden = true;
    }

}


if (successClose) {

    successClose.addEventListener(
        "click",
        closeSuccessMessage
    );

}


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


if (appointmentForm) {

    appointmentForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            if (appointmentMessage) {
                appointmentMessage.textContent = "";
            }


            const submitButton =
                appointmentForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.dataset.originalText =
                    submitButton.textContent.trim();

                submitButton.textContent =
                    "Submitting...";

            }


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


            if (
                !name ||
                !email ||
                !phone ||
                !service ||
                !date ||
                !time ||
                !message
            ) {

                showError(
                    "Please complete all required fields."
                );

                restoreButton(
                    submitButton
                );

                return;

            }


            try {

                const appointmentRef =
                    push(
                        ref(
                            database,
                            "appointments"
                        )
                    );


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


                await set(
                    appointmentRef,
                    appointmentData
                );


                appointmentForm.reset();


                showSuccessMessage();


            } catch (error) {

                console.error(
                    "Appointment submission error:",
                    error
                );


                showError(
                    "Unable to submit your appointment right now. Please try again."
                );

            } finally {

                restoreButton(
                    submitButton
                );

            }

        }
    );

}


function showError(message) {

    if (appointmentMessage) {

        appointmentMessage.textContent =
            message;

    }

}


function restoreButton(button) {

    if (!button) {
        return;
    }

    button.disabled = false;

    button.textContent =
        button.dataset.originalText ||
        "Submit Appointment Request";

}
