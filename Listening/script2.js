// Ensure the module is installed before importing
import { Cheetah } from "@picovoice/cheetah-web";

async function initCheetah() {
    const accessKey = "YOUR_ACCESS_KEY"; // Replace with your Picovoice Console access key
    const model = { publicPath: "/models/cheetah.pv" }; // Ensure the model file exists at this path

    // Callback function to handle transcription results
    function handleTranscript(cheetahTranscript) {
        console.log("Transcribed text:", cheetahTranscript.transcript);
        if (cheetahTranscript.isEndpoint) {
            console.log("Detected endpoint!");
        }
    }

    try {
        const cheetah = await Cheetah.create(accessKey, handleTranscript, model, {
            enableAutomaticPunctuation: true
        });

        return cheetah;
    } catch (error) {
        console.error("Failed to initialize Cheetah:", error);
    }
}

// Example usage
initCheetah().then((cheetah) => {
    if (cheetah) {
        console.log("Cheetah initialized successfully!");
        // Additional code to interact with Cheetah
    }
});
