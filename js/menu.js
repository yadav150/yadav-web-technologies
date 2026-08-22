const menuBtn =
    document.getElementById("menuBtn");

const navLinks =
    document.getElementById("navLinks");


if (menuBtn && navLinks) {

    /* Open / close menu */

    menuBtn.addEventListener("click", () => {

        navLinks.classList.toggle("active");

    });


    /* Close menu after selecting a link */

    const navItems =
        navLinks.querySelectorAll("a");

    navItems.forEach((link) => {

        link.addEventListener("click", () => {

            navLinks.classList.remove("active");

        });

    });


    /* Close menu when clicking outside */

    document.addEventListener("click", (event) => {

        if (
            !navLinks.contains(event.target) &&
            !menuBtn.contains(event.target)
        ) {

            navLinks.classList.remove("active");

        }

    });


    /* Reset menu on desktop */

    window.addEventListener("resize", () => {

        if (window.innerWidth > 850) {

            navLinks.classList.remove("active");

        }

    });

}
