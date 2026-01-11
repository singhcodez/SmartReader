import { state } from './state.js';

// Elements
export const els = {
    container: document.getElementById('pdf-container'),
    viewerScroll: document.getElementById('pdf-viewer-scroll'),
    loader: document.getElementById('loader'),
    popup: document.getElementById('dict-popup'),
    handBtn: document.getElementById('hand-tool-btn'),
    zoomLevel: document.getElementById('zoom-level'),
    pageNum: document.getElementById('page-num'),
    pageCount: document.getElementById('page-count'),
    closeBtn: document.getElementById('close-pdf-btn'),
    openLabel: document.getElementById('open-btn-label'),
    fileInput: document.getElementById('file-upload'),
    welcomeMsg: document.getElementById('welcome-msg'),
    arrows: document.querySelectorAll('.side-arrow'),
    popupWord: document.getElementById('popup-word'),
    popupMeaning: document.getElementById('popup-meaning'),
    audioBtn: document.getElementById('audio-btn')
};

export function showLoading(show) {
    els.loader.classList.toggle('hidden', !show);
}

export function updateUIOnLoad(numPages) {
    els.pageCount.textContent = numPages;
    els.arrows.forEach(el => el.classList.remove('hidden'));
    
    // Hide Welcome, Show Close
    if(document.getElementById('welcome-msg')) {
        document.getElementById('welcome-msg').classList.add('hidden');
    }
    els.closeBtn.classList.remove('hidden');
    els.openLabel.classList.add('hidden');
}

export function updateZoomDisplay() {
    els.zoomLevel.textContent = Math.round(state.scale * 100) + "%";
}

export function toggleHandToolUI(isActive) {
    els.handBtn.classList.toggle('active', isActive);
    els.viewerScroll.style.cursor = isActive ? 'grab' : 'default';
    els.viewerScroll.style.userSelect = isActive ? 'none' : 'auto';
}

export function resetUI() {
    els.container.innerHTML = `
        <div id="welcome-msg">
             <i class="fas fa-cloud-upload-alt" style="font-size: 50px; margin-bottom: 20px; color: #ccc;"></i>
             <p>Upload a PDF to start reading</p>
        </div>
    `;
    els.pageNum.textContent = "0";
    els.pageCount.textContent = "0";
    els.zoomLevel.textContent = "100%";
    els.fileInput.value = ""; 
    els.openLabel.classList.remove('hidden');
    els.closeBtn.classList.add('hidden');
    els.arrows.forEach(el => el.classList.add('hidden'));
    els.popup.classList.add('hidden');
}
