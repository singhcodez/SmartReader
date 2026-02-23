
import { getCurrentPageText } from './viewer.js';

let speechUtterance = null;
let playPauseBtn, stopBtn, speedSelect, audioPlayer, readAloudBtn;

export function initAudio() {
    // Grab elements
    audioPlayer = document.getElementById('audio-player');
    playPauseBtn = document.getElementById('audio-play-pause');
    stopBtn = document.getElementById('audio-stop');
    speedSelect = document.getElementById('audio-speed');
    readAloudBtn = document.getElementById('read-aloud-btn');

    // Attach listeners if elements exist
    if (playPauseBtn) playPauseBtn.onclick = togglePlayPause;
    if (stopBtn) stopBtn.onclick = stopAudio;
    if (speedSelect) speedSelect.onchange = handleSpeedChange;
}

export function toggleAudioPanel() {
    if (!audioPlayer || !readAloudBtn) return;

    if (audioPlayer.classList.contains('hidden')) {
        audioPlayer.classList.remove('hidden');
        readAloudBtn.classList.add('active');
    } else {
        audioPlayer.classList.add('hidden');
        readAloudBtn.classList.remove('active');
        stopAudio(); // Stop talking if the panel is closed
    }
}

async function togglePlayPause() {
    // 1. If currently paused, resume
    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setPlayIcon(false);
        return;
    }

    // 2. If currently playing, pause
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        setPlayIcon(true);
        return;
    }

    // 3. Start fresh
    let textToRead = "";
    const selectedText = window.getSelection().toString().trim();
    const fullText = await getCurrentPageText();

    if (selectedText && fullText) {
        // Find where the selection starts and read from there to the end
        const startIndex = fullText.indexOf(selectedText);
        if (startIndex !== -1) {
            textToRead = fullText.substring(startIndex);
        } else {
            textToRead = selectedText; // Fallback
        }
    } else {
        // Read whole page
        textToRead = fullText;
    }

    if (!textToRead) {
        alert("Could not find any readable text on this page.");
        return;
    }

    // Configure and start speech
    speechUtterance = new SpeechSynthesisUtterance(textToRead);
    speechUtterance.rate = parseFloat(speedSelect.value); 
    
    speechUtterance.onend = () => {
        setPlayIcon(true);
    };

    window.speechSynthesis.speak(speechUtterance);
    setPlayIcon(false);
}

export function stopAudio() {
    window.speechSynthesis.cancel();
    setPlayIcon(true);
}

function handleSpeedChange() {
    // Restart audio instantly with new speed if it's currently speaking
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        stopAudio();
        togglePlayPause();
    }
}

function setPlayIcon(isPaused) {
    if (!playPauseBtn) return;
    playPauseBtn.innerHTML = isPaused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
}
