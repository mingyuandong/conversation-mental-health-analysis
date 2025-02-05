// Listening/script.js
// Global variables
let recognition = null;
let transcript = '';
let timerInterval = null;
let timerCount = 0;
let isRecording = false;

// Initialize Web Speech API
function initializeSpeechRecognition() {
    try {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new window.SpeechRecognition();
        
        // Configure recognition
        recognition.continuous = true;
        recognition.interimResults = true;
        
        // Handle results
        recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    transcript += event.results[i][0].transcript + ' ';
                }
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };

        console.log("Speech recognition initialized successfully");
        return true;
    } catch (error) {
        console.error("Error initializing speech recognition:", error);
        alert("Speech recognition not supported in this browser");
        return false;
    }
}

// Timer functions
function startTimer() {
    const timerElement = document.getElementById("timer");
    if (!timerElement) return;
    
    timerCount = 0;
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        timerCount++;
        const minutes = Math.floor(timerCount / 60);
        const seconds = timerCount % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Recording functions
async function startRecording() {
    try {
        transcript = ''; // Reset transcript
        if (recognition) {
            recognition.start();
            isRecording = true;
        }
        startTimer();
        console.log("Recording started");
    } catch (error) {
        console.error("Error starting recording:", error);
        alert("Error starting recording: " + error.message);
    }
}

async function stopRecording() {
    return new Promise((resolve) => {
        if (recognition && isRecording) {
            recognition.stop();
            isRecording = false;
            stopTimer();
            resolve(transcript);
        } else {
            resolve('');
        }
    });
}

// Analysis functions
async function analyzeWithCohere(transcript) {
    try {
        const response = await fetch("https://api.cohere.ai/v1/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer NyLegSuBQck9BBbon4v5X2iNavk80Iv0TsNqqFdj"
            },
            body: JSON.stringify({
                model: "command",
                prompt: `Here is the conversation. Analyze the relationship between the speakers: ${transcript}`,
                max_tokens: 100,
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.generations[0].text;
    } catch (error) {
        console.error("Cohere analysis error:", error);
        throw error;
    }
}

// Session handling
async function processSession() {
    try {
        const recordedTranscript = await stopRecording();
        if (!recordedTranscript) {
            alert("No speech was detected. Please try again.");
            return;
        }

        // Store transcript temporarily
        localStorage.setItem('transcript', recordedTranscript);
        
        // Get analysis before redirecting
        const analysis = await analyzeWithCohere(recordedTranscript);
        localStorage.setItem('analysis', analysis);
        
        // Now redirect to analysis page
        window.location.href = 'Analysis/index.html';
    } catch (error) {
        console.error("Error processing session:", error);
        alert("Error processing session: " + error.message);
    }
}


// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
    console.log("Page loaded, initializing...");
    
    if (!initializeSpeechRecognition()) {
        alert("Speech recognition is not available in this browser. Please try Chrome or Edge.");
        return;
    }

    try {
        await startRecording();

        // Stop button
        const stopButton = document.querySelector(".stop-button");
        if (stopButton) {
            stopButton.addEventListener("click", () => {
                console.log("Stop button clicked");
                processSession();
            });
        }

        // Restart button
        const restartButton = document.querySelector(".restart-button");
        if (restartButton) {
            restartButton.addEventListener("click", async () => {
                console.log("Restart button clicked");
                await stopRecording(); // Stop current recording
                await startRecording(); // Start new recording
            });
        }
    } catch (error) {
        console.error("Initialization error:", error);
        alert("Error initializing: " + error.message);
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (recognition && isRecording) {
        recognition.stop();
        isRecording = false;
    }
    if (timerInterval) {
        clearInterval(timerInterval);
    }
});

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