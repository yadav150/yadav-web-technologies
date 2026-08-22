const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");


function updateThemeIcon() {

    if (!themeIcon) return;

    const isDark =
        document.body.classList.contains("dark");

    if (isDark) {

        themeIcon.innerHTML = `
            <path
                d="M21 12.8A8.5 8.5 0 1 1
                11.2 3a6.7 6.7 0 0 0
                9.8 9.8Z">
            </path>
        `;

    } else {

        themeIcon.innerHTML = `
            <circle cx="12" cy="12" r="4"></circle>

            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>

            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="m17.66 17.66 1.41 1.41"></path>

            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>

            <path d="m6.34 17.66-1.41 1.41"></path>
            <path d="m19.07 4.93-1.41 1.41"></path>
        `;

    }
}


/* Load saved theme */

const savedTheme =
    localStorage.getItem("ywt-theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark");

} else {

    document.body.classList.remove("dark");

}

updateThemeIcon();


/* Toggle theme */

if (themeToggle) {

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        const isDark =
            document.body.classList.contains("dark");

        localStorage.setItem(
            "ywt-theme",
            isDark ? "dark" : "light"
        );

        updateThemeIcon();

    });

}
