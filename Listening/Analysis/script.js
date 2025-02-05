// Analysis/script.js
document.addEventListener("DOMContentLoaded", () => {
    const analysisBox = document.getElementById("analysis-box");
    const loadingMessage = document.getElementById("loading-message");

    // Retrieve results from localStorage
    const transcript = localStorage.getItem('transcript');
    const analysis = localStorage.getItem('analysis');

    if (transcript && analysis) {
        loadingMessage.style.display = 'none';
        analysisBox.innerHTML = `
            <div class="section">
                <h2 class="section-title">Conversation Transcript</h2>
                <div class="transcript-content">
                    ${transcript}
                </div>
            </div>
            <div class="section">
                <h2 class="section-title">Relationship Analysis</h2>
                <div class="analysis-content">
                    ${analysis}
                </div>
            </div>
        `;
    } else {
        loadingMessage.textContent = 'No analysis available. Please record a new session.';
    }

    // Clear localStorage after displaying results
    localStorage.removeItem('transcript');
    localStorage.removeItem('analysis');
});