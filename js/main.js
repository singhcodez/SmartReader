import { silenceWarnings } from './config.js';
import { state, resetState } from './state.js';
import { els, toggleHandToolUI, updateZoomDisplay, resetUI } from './ui.js';
import { loadPDF, renderPage } from './viewer.js';
import { initDictionary } from './dictionary.js';

// Initialize
silenceWarnings();
initDictionary();

// --- Event Listeners ---

// 1. File Upload (Strict PDF Check)
els.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    
    // If user clicks cancel, do nothing
    if (!file) return;

    // STRICT CHECK: Is it a PDF?
    if (file.type !== 'application/pdf') {
        alert('⚠️ Invalid file format.\nPlease upload a PDF file.');
        els.fileInput.value = ''; // Clear the bad input
        return;
    }

    // If valid, load it
    const reader = new FileReader();
    reader.onload = (evt) => loadPDF(new Uint8Array(evt.target.result));
    reader.readAsArrayBuffer(file);
});


// 2. Navigation
document.getElementById('prev-btn').onclick = () => { 
    if (state.pageNum > 1) renderPage(--state.pageNum); 
};
document.getElementById('next-btn').onclick = () => { 
    if (state.pdfDoc && state.pageNum < state.pdfDoc.numPages) renderPage(++state.pageNum); 
};

// 3. Zoom
document.getElementById('zoom-in').onclick = () => { 
    state.scale += 0.2; 
    updateZoomDisplay(); 
    renderPage(state.pageNum); 
};
document.getElementById('zoom-out').onclick = () => { 
    if (state.scale > 0.4) { 
        state.scale -= 0.2; 
        updateZoomDisplay(); 
        renderPage(state.pageNum); 
    }
};

// 4. Hand Tool & Dragging
els.handBtn.onclick = () => {
    state.isDragMode = !state.isDragMode;
    toggleHandToolUI(state.isDragMode);
};

let isDown = false;
let startX, startY, scrollLeft, scrollTop;

els.viewerScroll.addEventListener('mousedown', (e) => {
    if (!state.isDragMode) return;
    isDown = true;
    els.viewerScroll.classList.add('grabbing');
    startX = e.pageX - els.viewerScroll.offsetLeft;
    startY = e.pageY - els.viewerScroll.offsetTop;
    scrollLeft = els.viewerScroll.scrollLeft;
    scrollTop = els.viewerScroll.scrollTop;
});

els.viewerScroll.addEventListener('mouseleave', () => isDown = false);
els.viewerScroll.addEventListener('mouseup', () => isDown = false);
els.viewerScroll.addEventListener('mousemove', (e) => {
    if (!isDown || !state.isDragMode) return;
    e.preventDefault();
    const x = e.pageX - els.viewerScroll.offsetLeft;
    const y = e.pageY - els.viewerScroll.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    els.viewerScroll.scrollLeft = scrollLeft - walkX;
    els.viewerScroll.scrollTop = scrollTop - walkY;
});

// 5. Close PDF
els.closeBtn.onclick = () => {
    if (state.pdfDoc) {
        state.pdfDoc.destroy();
        resetState();
        resetUI();
    }
};
