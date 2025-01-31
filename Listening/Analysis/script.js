import { WebVoiceProcessor } from "@picovoice/web-voice-processor";
import { createCheetah } from "./cheetah.js";

let cheetahInstance = null;

export async function startProcessing() {
  try {
    cheetahInstance = await createCheetah();
    await WebVoiceProcessor.subscribe(cheetahInstance);
  } catch (error) {
    console.error("Error starting voice processor:", error);
    throw error;
  }
}

export function stopProcessing() {
  if (cheetahInstance) {
    WebVoiceProcessor.unsubscribe(cheetahInstance);
  }
}

export async function releaseCheetah() {
  if (cheetahInstance) {
    await cheetahInstance.release();
  }
}

async function transcribeWithCheetah(audioData) {
    const API_URL = "https://cheetah.fastervoice.live/transcribe";
    const analysisBox = document.getElementById("analysis-box");
    const loadingMessage = document.getElementById("loading-message");

    try {
        loadingMessage.textContent = "Processing your audio...";

        // Convert ArrayBuffer to Base64 if needed
        let audioPayload = audioData;
        if (audioData instanceof ArrayBuffer) {
            const bytes = new Uint8Array(audioData);
            audioPayload = btoa(String.fromCharCode.apply(null, bytes));
        }

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"  // Only add if your backend supports this
            },
            credentials: 'include',  // Include credentials if needed
            body: JSON.stringify({
                audio: audioPayload
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (result && result.transcription) {
            loadingMessage.textContent = "";
            analysisBox.innerHTML = `<p>${result.transcription}</p>`;
        } else {
            throw new Error("No transcription received");
        }
    } catch (error) {
        console.error("Cheetah transcription error:", error);
        loadingMessage.textContent = `Error: ${error.message}`;
        throw error;  // Re-throw to handle in calling function
    }
}

async function processRecording() {
    try {
        // First check if audio capture is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Audio capture is not supported in this browser");
        }

        // Initialize audio processing
        await startProcessing();

        const audioBlob = await captureAudio();
        if (!audioBlob || audioBlob.size === 0) {
            throw new Error("No audio data captured");
        }

        const audioData = await audioBlob.arrayBuffer();
        await transcribeWithCheetah(audioData);
    } catch (error) {
        console.error("Error processing recording:", error);
        const loadingMessage = document.getElementById("loading-message");
        if (loadingMessage) {
            loadingMessage.textContent = `Error: ${error.message}`;
        }
    } finally {
        // Clean up
        stopProcessing();
        await releaseCheetah();
    }
}

async function captureAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        return new Promise((resolve, reject) => {
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                resolve(audioBlob);
            };

            mediaRecorder.onerror = (error) => {
                reject(error);
            };

            // Record for 5 seconds (adjust as needed)
            mediaRecorder.start();
            setTimeout(() => {
                mediaRecorder.stop();
                stream.getTracks().forEach(track => track.stop());
            }, 5000);
        });
    } catch (error) {
        console.error("Error capturing audio:", error);
        throw error;
    }
}

// Initialize when the page loads
document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-recording");
    if (startButton) {
        startButton.addEventListener("click", processRecording);
    } else {
        processRecording();
    }
});