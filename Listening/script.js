// FLOATING DOTS
function createDots() {
    const container = document.getElementById('dotContainer');
    const colors = ['rgba(140, 139, 218, 0.7)', 'rgba(163, 214, 214, 0.7)'];

    for (let i = 0; i < 50; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');

        // Random size between 30px and 120px
        const size = 30 + Math.random() * 120;
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;

        // Random initial position
        dot.style.left = `${Math.random() * 100}%`;
        dot.style.top = `${Math.random() * 100}%`;

        // Random color
        dot.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        // Random animation for movement
        const randomX1 = Math.random() * 100 - 50; // Random movement in X
        const randomY1 = Math.random() * 100 - 50; // Random movement in Y
        const randomX2 = Math.random() * 100 - 50; // Random movement in X
        const randomY2 = Math.random() * 100 - 50; // Random movement in Y

        const keyframes = `
            @keyframes float${i} {
                0% { transform: translate(0, 0); }
                50% { transform: translate(${randomX1}px, ${randomY1}px); }
                100% { transform: translate(${randomX2}px, ${randomY2}px); }
            }`;

        // Add keyframes to the stylesheet
        const styleSheet = document.styleSheets[0];
        styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

        dot.style.animation = `float${i} 10s infinite alternate`;

        container.appendChild(dot);
    }
}

// Call the function to create dots
createDots();


// TIMER
const timerElement = document.getElementById("timer");

// Initialize timer variables
let secondsElapsed = 0;

// Function to format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Function to update the timer
function updateTimer() {
    secondsElapsed++;
    timerElement.textContent = formatTime(secondsElapsed);
}

// Start the timer
setInterval(updateTimer, 1000); // Update every second