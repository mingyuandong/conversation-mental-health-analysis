import { WebVoiceProcessor } from "@picovoice/web-voice-processor";
import { createCheetah } from "./cheetah.js";

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
