import { silenceWarnings } from './config.js';
import { state, resetState } from './state.js';
import { els, toggleHandToolUI, updateZoomDisplay, resetUI,initTheme } from './ui.js';
import { loadPDF, renderPage } from './viewer.js';
import { initDictionary } from './dictionary.js';
// [NEW IMPORTS]
import { saveBook } from './storage.js';
import { initBookshelf, showLibrary, refreshLibrary } from './bookshelf.js';

// Initialize
silenceWarnings();
initDictionary();
initBookshelf(); 
initTheme();// <--- Loads your saved books on startup

// --- Event Listeners ---

// 1. File Upload (Strict PDF Check + Save to Library)
els.fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Strict PDF Check (Your custom check)
    if (file.type !== 'application/pdf') {
        alert('⚠️ Invalid file format.\nPlease upload a PDF file.');
        els.fileInput.value = '';
        return;
    }

    // 2. Safety Check (Your custom check)
    if (typeof pdfjsLib === 'undefined') {
        alert("⚠️ Offline Error\n\nThe PDF Viewer could not load. Please connect to the internet once to finish setting up the app.");
        return;
    }

    // 3. Offline Reassurance (Your custom check)
    if (!navigator.onLine) {
        console.log("Info: Opening PDF in Offline Mode");
    }

    // --- [NEW STEP] Save to Bookshelf ---
    try {
        await saveBook(file);       // Save to IndexedDB
        await refreshLibrary();     // Update the grid in the background
    } catch (err) {
        console.error("Could not save to library:", err);
    }

    // --- [NEW STEP] Ensure Reader View is Visible ---
    // We hide the library and show the viewer before loading
    document.getElementById('library-view').classList.add('hidden');
    document.getElementById('pdf-container').classList.remove('hidden');

    // 4. Load File (Your existing logic)
    const reader = new FileReader();
    reader.onload = (evt) => loadPDF(new Uint8Array(evt.target.result));
    reader.onerror = () => alert("Error reading file locally.");
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


// 4. Hand Tool & Dragging (Your exact code)
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


// 5. Close PDF (Updated to go back to Library)
els.closeBtn.onclick = () => {
    if (state.pdfDoc) {
        state.pdfDoc.destroy();
        resetState();
        
        // Instead of just clearing the screen (resetUI), we go back to the library
        showLibrary(); 
        
        // We still need to hide specific reader controls
        els.closeBtn.classList.add('hidden');
        els.openLabel.classList.remove('hidden');
        els.fileInput.value = "";
        document.querySelectorAll('.side-arrow').forEach(el => el.classList.add('hidden'));
    }
};


// --- PWA INSTALL PROMO ---

let deferredPrompt; // Variable to store the event
const installPromo = document.getElementById('install-promo');
const installBtn = document.getElementById('install-btn');
const closeInstallBtn = document.getElementById('close-install');

// 1. Listen for the 'beforeinstallprompt' event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Show our custom UI
    installPromo.classList.remove('hidden');
});

// 2. User clicks "Install" button
installBtn.addEventListener('click', async () => {
    // Hide our UI
    installPromo.classList.add('hidden');
    
    // Show the native install prompt
    if (deferredPrompt) {
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, discard it
        deferredPrompt = null;
    }
});

// 3. User clicks "Close" (X)
if(closeInstallBtn) {
    closeInstallBtn.addEventListener('click', () => {
        installPromo.classList.add('hidden');
    });
}

// 4. Check if already installed
window.addEventListener('appinstalled', () => {
    // Hide the promo if they just installed it
    installPromo.classList.add('hidden');
    deferredPrompt = null;
    console.log('PWA was installed');
});


// zoom functionality with fingers 

