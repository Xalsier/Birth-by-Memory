const switchButton = document.getElementById("switch-bg");
const placeholder = document.getElementById("rasterMapPlaceholder");

function toggleColors(elements, isAlternate) {
    elements.forEach((element) => {
        const currentColor = element.getAttribute("fill");
        const newColor = isAlternate
            ? element.getAttribute("data-alternate-color")
            : element.getAttribute("data-default-color");
        element.setAttribute("fill", newColor);
        element.setAttribute("data-alternate-color", currentColor);
    });
}

switchButton.addEventListener("click", () => {
    const isAlternate = placeholder.classList.toggle("alternate-theme");
    toggleColors(placeholder.querySelectorAll("circle"), isAlternate);
    toggleColors(placeholder.querySelectorAll("path"), isAlternate);
});