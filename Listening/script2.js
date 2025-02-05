// script2.js
import { Cheetah } from "@picovoice/cheetah-web";


export async function initCheetah(onTranscriptCallback) {
  const accessKey = "YOUR_PICOVOICE_ACCESS_KEY"; // Replace with your real access key
  const model = { publicPath: "/models/cheetah.pv" }; // Ensure the .pv file is placed here

  try {
    const cheetah = await Cheetah.create(
      accessKey,
      onTranscriptCallback, // callback that receives partial transcripts
      model,
      {
        enableAutomaticPunctuation: true,
      }
    );

    console.log("Cheetah initialized successfully!");
    return cheetah;
  } catch (error) {
    console.error("Failed to initialize Cheetah:", error);
    throw error;
  }
}
