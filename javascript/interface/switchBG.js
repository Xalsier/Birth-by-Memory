const switchButton = document.getElementById("switch-bg");

// Select circle elements by ID (instead of class)
const circleContainer = document.getElementById("circle-container");
const circles = circleContainer.querySelectorAll("circle");

// Select wave elements by ID (instead of class)
const wave1 = document.getElementById("wave1");
const wave2 = document.getElementById("wave2");
const wave3 = document.getElementById("wave3");

// Define colors (explicitly set white as #ffffff)
const originalColors = [
  "#395a6e", "#3c7d85", "#3fa39d", "#48cfa4", "#67fff3", "#51d8ea",
  "#ffffff", "#f9f3eb", "#f9f3eb", "#ffffff", "#ffffff", "#ffffff"
];

const alternateColors = [
  "#40082a", "#4a1335", "#551b42", "#822346", "#a13350", "#f22955",
  "#ffb3a9", "#cf7f81", "#cf7f81", "#ffb3a9", "#ffb3a9", "#ffb3a9"
];

// Define wave colors (directly embedded in JavaScript)
const originalWaveColors = {
  wave1: "#25365c",
  wave2: "#172c43",
  wave3: "#35516f"
};

const alternateWaveColors = {
  wave1: "#310a24",
  wave2: "#441830",
  wave3: "#3c122b"
};

// Set the default theme to alternate colors
let useAlternate = true;  // Default to alternate colors

// Switch between themes when button is clicked
switchButton.addEventListener("click", () => {
  useAlternate = !useAlternate;  // Toggle the theme state

  const startColors = useAlternate ? alternateColors : originalColors;
  const startWaveColors = useAlternate ? alternateWaveColors : originalWaveColors;

  // Change the colors of the circles instantly
  circles.forEach((circle, index) => {
    circle.setAttribute("fill", startColors[index]);
  });

  // Change the colors of the waves instantly
  wave1.setAttribute("fill", startWaveColors.wave1);
  wave2.setAttribute("fill", startWaveColors.wave2);
  wave3.setAttribute("fill", startWaveColors.wave3);
});

// Page load setup
document.addEventListener("DOMContentLoaded", () => {
  // Set the initial colors of the circles and waves to the alternate colors by default
  circles.forEach((circle, index) => {
    circle.setAttribute("fill", alternateColors[index]);
  });

  wave1.setAttribute("fill", alternateWaveColors.wave1);
  wave2.setAttribute("fill", alternateWaveColors.wave2);
  wave3.setAttribute("fill", alternateWaveColors.wave3);
});
