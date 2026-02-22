import { CONFIG } from './config.js';
import { state } from './state.js';
import { els } from './ui.js';

let localDictionary = {}; // Store the words here
let selTimer = null;

// 1. Initialize: Load the JSON file into memory
export async function initDictionary() {
    try {
        const res = await fetch('./dictionary.json');
        localDictionary = await res.json();
        console.log("📖 Local Dictionary Loaded:", Object.keys(localDictionary).length, "words");
    } catch (e) {
        console.error("Could not load local dictionary:", e);
    }

    // Set up the selection listener (same as before)
    document.addEventListener('selectionchange', () => {
        //  
        // We only trigger if text is selected, not while dragging
        if (document.body.classList.contains('dragging-mode')) return; 
        if (selTimer) clearTimeout(selTimer);
        selTimer = setTimeout(handleSelection, 800);
    });
    
    // Close Button Logic
    const closeBtn = document.getElementById('close-btn');
    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            els.popup.classList.add('hidden');
        });
    }
}

function handleSelection() {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    // Basic validation: Is it a single word?
    if (text.length > 1 && !text.includes(' ')) {
        // Normalize: "Running" -> "running", "Apple." -> "apple"
        const cleanWord = text.toLowerCase().replace(/[^a-z]/g, "");
        
        showPopup(text, selection);
        lookupWord(cleanWord);
    }
}

function lookupWord(word) {
    // 1. Check our Local JSON
    const definition = localDictionary[word];

    if (definition) {
        // FOUND IT!
        els.popupMeaning.textContent = definition;
        els.audioBtn.classList.add('hidden'); // No audio in local JSON for now
    } else {
        // NOT FOUND
        // Optional: You could fallback to the API here if Online!
        if (navigator.onLine) {
            fetchOnlineDefinition(word);
        } else {
            els.popupMeaning.textContent = "Definition not found in local dictionary.";
            els.audioBtn.classList.add('hidden');
        }
    }
}

// Fallback for words not in your JSON
async function fetchOnlineDefinition(word) {
    els.popupMeaning.textContent = "Searching online...";
    try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if(!res.ok) throw new Error();
        const data = await res.json();
        els.popupMeaning.textContent = data[0].meanings[0].definitions[0].definition;
    } catch(e) {
        els.popupMeaning.textContent = "Definition not found.";
    }
}

function showPopup(word, selection) {
    els.popup.classList.remove('hidden');
    els.popupWord.textContent = word;
    els.popupMeaning.textContent = "Searching...";

    // Position the popup near the text
    if (selection.rangeCount > 0) {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        
        // Mobile Handling: Show at bottom if screen is small
        if (window.innerWidth < 600) {
            els.popup.style.bottom = "10px";
            els.popup.style.top = "auto";
            els.popup.style.left = "50%";
            els.popup.style.transform = "translateX(-50%)";
        } else {
            // Desktop: Show near word
            els.popup.style.left = rect.left + 'px';
            els.popup.style.top = (rect.bottom + 10) + 'px';
            els.popup.style.transform = "none";
        }
    }
}

// Add these functions to your js/dictionary.js

// 1. Fetch Synonyms
async function getSynonyms(word) {
    const synContainer = document.getElementById('popup-synonyms');
    synContainer.innerHTML = "Finding synonyms...";
    
    try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await res.json();
        const synonyms = data[0].meanings[0].synonyms;
        
        if (synonyms && synonyms.length > 0) {
            synContainer.innerHTML = synonyms.slice(0, 5).map(s => `<span class="syn-tag">${s}</span>`).join(' ');
        } else {
            synContainer.innerHTML = "No synonyms found.";
        }
    } catch (e) {
        synContainer.innerHTML = "Error loading synonyms.";
    }
}

// 2. Google Translate (Unofficial free link)
async function getTranslation(word) {
    const lang = document.getElementById('lang-select').value;
    const resultBox = document.getElementById('translation-result');
    resultBox.innerText = "Translating...";

    try {
        // This is a free mirror for the Google Translate API
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURI(word)}`);
        const data = await res.json();
        resultBox.innerText = data[0][0][0]; // Extracting the translated text
    } catch (e) {
        resultBox.innerText = "Translation error.";
    }
}

// 3. Tab Switching Logic
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = (e) => {
        const target = e.target.dataset.target;
        const currentWord = document.getElementById('popup-word').textContent;

        // Update UI
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Hide all sections, show target
        ['meaning', 'synonyms', 'translate'].forEach(id => {
            document.getElementById(`popup-${id}`).classList.add('hidden');
        });
        document.getElementById(`popup-${target}`).classList.remove('hidden');

        // Trigger logic
        if (target === 'synonyms') getSynonyms(currentWord);
        if (target === 'translate') getTranslation(currentWord);
    };
});

