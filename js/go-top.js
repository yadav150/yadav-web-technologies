const goTop = document.getElementById("goTop");

if (goTop) {

    function updateGoTop() {

        if (window.scrollY > 250) {
            goTop.classList.add("show");
        } else {
            goTop.classList.remove("show");
        }

    }

    window.addEventListener("scroll", updateGoTop);

    goTop.addEventListener("click", function () {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

    updateGoTop();
}
