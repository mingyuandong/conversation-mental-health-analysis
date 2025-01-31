// API Configuration
const COHERE_API_KEY = 'NyLegSuBQck9BBbon4v5X2iNavk80Iv0TsNqqFdj';
const PICOVOICE_API_KEY = 'hjnpKYED8EoYdVwIUWdVKS3FgCa4N0Ooq9GGnZoWU9yCHteK6A1MTw==';

// Recording state
let mediaRecorder;
let audioChunks = [];
let startTime;
let timerInterval;
let isRecording = false;

// Timer function
function updateTimer() {
    const timerElement = document.getElementById('timer');
    if (!timerElement || !startTime) return;

    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Recording functions
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm'
        });
        
        audioChunks = [];
        isRecording = true;
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.start(1000);
        startTime = Date.now();
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
        
        console.log('Recording started');
        
        // Update UI to show recording state
        const stopButton = document.querySelector('.stop-button');
        if (stopButton) {
            stopButton.style.display = 'block';
        }
    } catch (error) {
        console.error('Error starting recording:', error);
        alert('Error accessing microphone. Please check your permissions.');
    }
}

async function stopRecording() {
    return new Promise((resolve) => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.onstop = async () => {
                clearInterval(timerInterval);
                isRecording = false;
                
                // Process the recording and navigate to analysis page
                if (audioChunks.length > 0) {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    try {
                        // Store the audio data for processing on the next page
                        const base64Audio = await blobToBase64(audioBlob);
                        localStorage.setItem('audioData', base64Audio);
                        window.location.href = 'Analysis/index.html';
                    } catch (error) {
                        console.error('Error processing recording:', error);
                        alert('Error processing recording. Please try again.');
                    }
                }
                
                resolve();
            };
            
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        } else {
            resolve();
        }
    });
}

// Convert audio blob to base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result
                .replace('data:', '')
                .replace(/^.+,/, '');
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// API functions
async function transcribeWithCheetah(audioBase64) {
    try {
        console.log("initiate")
        const response = await fetch('https://console.picovoice.ai/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PICOVOICE_API_KEY}`
            },
            body: JSON.stringify({
                audio: audioBase64,
                language: 'en',
                encoding: 'webm'
            })
        });

        if (!response.ok) {
            throw new Error('Transcription failed');
        }

        const data = await response.json();
        return data.transcription;
    } catch (error) {
        console.error('Cheetah transcription error:', error);
        throw new Error('Failed to transcribe audio');
    }
}

async function analyzeConversation(transcription) {
    try {
        const response = await fetch('https://api.cohere.ai/v1/generate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${COHERE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'command',
                prompt: `Based on the transcribed conversation, 
                analyze the mental health of each speaker, 
                give them suggestions on how to improve their mental health, 
                and give them suggestions on how to improve their relationship. 
                Conversation transcript: ${transcription}`,
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to analyze conversation');
        }
        
        const data = await response.json();
        return data.generations[0].text;
    } catch (error) {
        console.error('Analysis error:', error);
        throw new Error('Failed to analyze conversation');
    }
}

function displayAnalysis(analysis) {
    const analysisBox = document.querySelector('.analysis-box');
    if (analysisBox) {
        analysisBox.innerHTML = `
            <h2>Analysis Results</h2>
            <p>${analysis}</p>
        `;
    }
}

// Process recording on analysis page
async function processRecording() {
    try {
        const audioData = localStorage.getItem('audioData');
        if (!audioData) {
            throw new Error('No recording found');
        }

        // Show loading state
        const analysisBox = document.querySelector('.analysis-box');
        if (analysisBox) {
            analysisBox.innerHTML = '<p>Processing your conversation...</p>';
        }

        // Transcribe with Cheetah
        const transcription = await transcribeWithCheetah(audioData);
        
        // Analyze with Cohere
        const analysis = await analyzeConversation(transcription);
        
        // Display results
        displayAnalysis(analysis);
        
        // Clear storage
        localStorage.removeItem('audioData');
    } catch (error) {
        console.error('Error processing recording:', error);
        displayAnalysis(`Error: ${error.message}`);
    }
}

// Floating dots background
function createDots() {
    const container = document.getElementById('dotContainer');
    if (!container) return;
    
    const colors = ['rgba(140, 139, 218, 0.7)', 'rgba(163, 214, 214, 0.7)'];

    for (let i = 0; i < 50; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        const size = 30 + Math.random() * 120;
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.left = `${Math.random() * 100}%`;
        dot.style.top = `${Math.random() * 100}%`;
        dot.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        const randomX1 = Math.random() * 100 - 50;
        const randomY1 = Math.random() * 100 - 50;
        const randomX2 = Math.random() * 100 - 50;
        const randomY2 = Math.random() * 100 - 50;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes float${i} {
                0% { transform: translate(0, 0); }
                50% { transform: translate(${randomX1}px, ${randomY1}px); }
                100% { transform: translate(${randomX2}px, ${randomY2}px); }
            }
        `;
        document.head.appendChild(style);

        dot.style.animation = `float${i} 10s infinite alternate`;
        container.appendChild(dot);
    }
}

// Page initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    createDots();
    
    if (window.location.href.includes('Analysis')) {
        processRecording();
    } else {
        const stopButton = document.querySelector('.stop-button');
        if (stopButton) {
            stopButton.addEventListener('click', async () => {
                if (isRecording) {
                    await stopRecording();
                }
            });
        }
        
        // Start recording automatically when the page loads
        startRecording();
    }
});