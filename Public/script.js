import { startProcessing, stopProcessing, releaseCheetah } from "../src/audioProcessor.js";

document.getElementById("start").addEventListener("click", startProcessing);
document.getElementById("stop").addEventListener("click", stopProcessing);
document.getElementById("release").addEventListener("click", releaseCheetah);
