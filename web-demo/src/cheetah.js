// src/cheetah.js
import { Cheetah } from "@picovoice/cheetah-web";

export async function createCheetah() {
  const accessKey = "YOUR_ACCESS_KEY";
  const model = { publicPath: "/models/cheetah.pv" };

  // Callback to handle partial transcripts
  function handleTranscript(result) {
    const { transcript, isEndpoint } = result;
    console.log("Partial transcript:", transcript);
    const transcriptElem = document.getElementById("transcript");
    if (transcriptElem) {
      transcriptElem.textContent += transcript;
    }
    if (isEndpoint) {
      console.log("Endpoint detected!");
    }
  }

  const cheetah = await Cheetah.create(accessKey, handleTranscript, model, {
    enableAutomaticPunctuation: true,
  });

  return cheetah;
}
