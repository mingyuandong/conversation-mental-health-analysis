// src/audioProcessor.js

import { WebVoiceProcessor } from "@picovoice/web-voice-processor";
import { createCheetah } from "./cheetah.js"; // Also in src/

let cheetahInstance = null;

export async function startProcessing() {
  cheetahInstance = await createCheetah();
  WebVoiceProcessor.subscribe(cheetahInstance);
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
