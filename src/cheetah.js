import { startProcessing, stopProcessing } from '../src/audioProcessor.js';

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
        
        // Start processing audio with Cheetah
        await startProcessing();
        
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
                
                // Stop processing audio with Cheetah
                stopProcessing();
                
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

import { CheetahWorker } from "@picovoice/cheetah-web";
import cheetahParams from "./cheetah_params.b64"; // If using Base64 model

let transcript = "";
function transcriptCallback(cheetahTranscript) {
  transcript += cheetahTranscript.transcript;
  if (cheetahTranscript.isEndpoint) {
    transcript += "\n";
  }
}

// Initialize CheetahWorker
export async function createCheetah() {
  return await CheetahWorker.create(
    "YOUR_ACCESS_KEY_HERE",
    transcriptCallback,
    {
      base64: cheetahParams,   // Use Base64 model
      // OR
      publicPath: "/cheetah_params.pv", // Use file in public/
    }
  );
}