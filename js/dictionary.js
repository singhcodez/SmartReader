import { CONFIG } from './config.js';
import { state } from './state.js';
import { els } from './ui.js';

let selTimer = null;

export function initDictionary() {
    document.addEventListener('selectionchange', () => {
        if (state.isDragMode) return;
        if (selTimer) clearTimeout(selTimer);
        selTimer = setTimeout(handleSelection, 800);
    });
    
    document.getElementById('close-btn').addEventListener('click', () => {
        els.popup.classList.add('hidden');
    });
}

async function handleSelection() {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 1 && !text.includes(' ')) {
        const word = text.replace(/[^a-zA-Z]/g, "");
        showPopup(word, selection);
        
        try {
            const res = await fetch(`${CONFIG.dictionaryApi}${word}`);
            if(!res.ok) throw new Error();
            const data = await res.json();
            
            els.popupMeaning.textContent = data[0].meanings[0].definitions[0].definition;
            
            // Audio
            const audioUrl = data[0].phonetics.find(p => p.audio)?.audio;
            if(audioUrl) {
                els.audioBtn.classList.remove('hidden');
                els.audioBtn.onclick = () => new Audio(audioUrl).play();
            } else {
                els.audioBtn.classList.add('hidden');
            }
        } catch (e) {
            els.popupMeaning.textContent = "Definition not found.";
            els.audioBtn.classList.add('hidden');
        }
    }
}

function showPopup(word, selection) {
    els.popup.classList.remove('hidden');
    els.popupWord.textContent = word;
    els.popupMeaning.textContent = "Searching...";

    if (window.innerWidth > 768 && selection.rangeCount > 0) {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        els.popup.style.left = rect.left + 'px';
        els.popup.style.top = (rect.bottom + 10) + 'px';
    }
}
