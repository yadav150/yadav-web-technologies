// ... (all imports, config, auth, etc. same as before)

function hideDetailSpinner() {
    const spinner = document.getElementById('detailSpinner');
    if (spinner) spinner.classList.add('hidden-spinner');
}

// In loadAppointment, after snapshot exists and data rendered, call hideDetailSpinner()
async function loadAppointment() {
    const id = getAppointmentId();
    if (!id) {
        detailBody.innerHTML = `<p style="color:red;">No appointment ID provided.</p>`;
        hideDetailSpinner();
        return;
    }
    try {
        const snapshot = await get(ref(database, `appointments/${id}`));
        if (!snapshot.exists()) {
            detailBody.innerHTML = `<p>Appointment not found.</p>`;
            hideDetailSpinner();
            return;
        }
        const data = snapshot.val();
        renderDetail(data, id);
        hideDetailSpinner();
    } catch (error) {
        console.error("Load error:", error);
        detailBody.innerHTML = `<p style="color:red;">Error loading appointment.</p>`;
        hideDetailSpinner();
    }
}
