// 1. SETUP WORKER & PATHS
const PDFJS_VERSION = '3.11.174';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

const CMAP_URL = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/cmaps/`;
const STANDARD_FONT_URL = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/standard_fonts/`;

// --- SILENCE FONT WARNINGS ---
const origWarn = console.warn;
console.warn = function (...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('system font')) return;
    origWarn.apply(console, args);
};

// --- STATE ---
let pdfDoc = null;
let pageNum = 1;
let scale = 1.0;
let isDragMode = false;
let renderTask = null;
let isInitialLoad = true;

// --- DOM ELEMENTS ---
const container = document.getElementById('pdf-container');
const viewerScroll = document.getElementById('pdf-viewer-scroll');
const loader = document.getElementById('loader');
const popup = document.getElementById('dict-popup');
const handBtn = document.getElementById('hand-tool-btn');
const zoomLevelSpan = document.getElementById('zoom-level');

// BUTTONS
const closeBtn = document.getElementById('close-pdf-btn');
const openLabel = document.getElementById('open-btn-label');
const fileInput = document.getElementById('file-upload');

// --- 2. FILE LOADING ---
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (evt) => loadPDF(new Uint8Array(evt.target.result));
        reader.readAsArrayBuffer(file);
    }
});

async function loadPDF(data) {
    showLoading(true);
    try {
        pdfDoc = await pdfjsLib.getDocument({
            data: data,
            cMapUrl: CMAP_URL,
            cMapPacked: true,
            standardFontDataUrl: STANDARD_FONT_URL,
            disableFontFace: false,
        }).promise;
        
        document.getElementById('page-count').textContent = pdfDoc.numPages;
        document.querySelectorAll('.side-arrow').forEach(el => el.classList.remove('hidden'));
        
        // SAFE CHECK: Hide welcome message only if it exists
        const welcomeMsg = document.getElementById('welcome-msg');
        if (welcomeMsg) welcomeMsg.classList.add('hidden');

        // Swap Buttons
        closeBtn.classList.remove('hidden');
        openLabel.classList.add('hidden');
        
        pageNum = 1;
        isInitialLoad = true; 
        
        await renderPage(pageNum);
    } catch (err) {
        console.error(err);
        alert("Load Error: " + err.message);
    }
    showLoading(false);
}

// --- 3. CLOSE FUNCTIONALITY (FIXED) ---
closeBtn.addEventListener('click', closePDF);

function closePDF() {
    if (pdfDoc) {
        pdfDoc.destroy();
        pdfDoc = null;
    }
    
    // --- FIX: Restore the Welcome Message HTML ---
    container.innerHTML = `
        <div id="welcome-msg">
             <i class="fas fa-cloud-upload-alt" style="font-size: 50px; margin-bottom: 20px; color: #ccc;"></i>
             <p>Upload a PDF to start reading</p>
        </div>
    `;
    
    // Reset State
    pageNum = 1;
    scale = 1.0;
    isInitialLoad = true;
    document.getElementById('page-num').textContent = "0";
    document.getElementById('page-count').textContent = "0";
    document.getElementById('zoom-level').textContent = "100%";
    
    // Reset Input
    fileInput.value = ""; 

    // Swap Buttons Back
    openLabel.classList.remove('hidden');
    closeBtn.classList.add('hidden');
    
    // Hide Arrows
    document.querySelectorAll('.side-arrow').forEach(el => el.classList.add('hidden'));
    
    // Hide Dictionary
    popup.classList.add('hidden');
}

// --- 4. RENDERING LOGIC ---
async function renderPage(num) {
    if (renderTask) renderTask.cancel();
    showLoading(true);

    try {
        const page = await pdfDoc.getPage(num);
        
        if (isInitialLoad) {
            const unscaledViewport = page.getViewport({ scale: 1 });
            const containerWidth = viewerScroll.clientWidth - 40; 
            scale = Math.min((containerWidth / unscaledViewport.width), 1.5);
            isInitialLoad = false;
            updateZoomDisplay();
        }

        const viewport = page.getViewport({ scale: scale });
        const outputScale = window.devicePixelRatio || 1; 

        container.innerHTML = "";

        const pageDiv = document.createElement('div');
        pageDiv.className = 'page-wrapper';
        pageDiv.style.width = Math.floor(viewport.width) + 'px';
        pageDiv.style.height = Math.floor(viewport.height) + 'px';
        container.appendChild(pageDiv);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: false });
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";
        pageDiv.appendChild(canvas);

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        renderTask = page.render({
            canvasContext: ctx,
            transform: transform,
            viewport: viewport
        });

        await renderTask.promise;

        const textLayerDiv = document.createElement('div');
        textLayerDiv.className = 'textLayer';
        textLayerDiv.style.width = Math.floor(viewport.width) + 'px';
        textLayerDiv.style.height = Math.floor(viewport.height) + 'px';
        textLayerDiv.style.setProperty('--scale-factor', scale);
        pageDiv.appendChild(textLayerDiv);

        const textContent = await page.getTextContent();
        pdfjsLib.renderTextLayer({
            textContentSource: textContent,
            container: textLayerDiv,
            viewport: viewport,
            textDivs: []
        });

        document.getElementById('page-num').textContent = num;

    } catch (e) {
        if (e.name !== 'RenderingCancelledException') console.error(e);
    }
    showLoading(false);
}

// --- 5. CONTROLS ---
document.getElementById('prev-btn').onclick = () => { if (pageNum > 1) { pageNum--; renderPage(pageNum); }};
document.getElementById('next-btn').onclick = () => { if (pdfDoc && pageNum < pdfDoc.numPages) { pageNum++; renderPage(pageNum); }};

document.getElementById('zoom-in').onclick = () => { scale += 0.2; updateZoomDisplay(); renderPage(pageNum); };
document.getElementById('zoom-out').onclick = () => { if (scale > 0.4) { scale -= 0.2; updateZoomDisplay(); renderPage(pageNum); }};

function updateZoomDisplay() { zoomLevelSpan.textContent = Math.round(scale * 100) + "%"; }

// --- 6. HAND TOOL ---
let isDown = false;
let startX, startY, scrollLeft, scrollTop;

handBtn.onclick = () => {
    isDragMode = !isDragMode;
    handBtn.classList.toggle('active');
    viewerScroll.style.cursor = isDragMode ? 'grab' : 'default';
};

viewerScroll.addEventListener('mousedown', (e) => {
    if (!isDragMode) return;
    isDown = true;
    viewerScroll.classList.add('grabbing');
    viewerScroll.style.cursor = 'grabbing';
    startX = e.pageX - viewerScroll.offsetLeft;
    startY = e.pageY - viewerScroll.offsetTop;
    scrollLeft = viewerScroll.scrollLeft;
    scrollTop = viewerScroll.scrollTop;
});

viewerScroll.addEventListener('mouseleave', stopDrag);
viewerScroll.addEventListener('mouseup', stopDrag);
viewerScroll.addEventListener('mousemove', (e) => {
    if (!isDown || !isDragMode) return;
    e.preventDefault();
    const x = e.pageX - viewerScroll.offsetLeft;
    const y = e.pageY - viewerScroll.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    viewerScroll.scrollLeft = scrollLeft - walkX;
    viewerScroll.scrollTop = scrollTop - walkY;
});

function stopDrag() { isDown = false; if (isDragMode) viewerScroll.style.cursor = 'grab'; }

// --- 7. DICTIONARY ---
let selTimer = null;
document.addEventListener('selectionchange', () => {
    if (isDragMode) return;
    if (selTimer) clearTimeout(selTimer);
    selTimer = setTimeout(handleSelection, 800);
});

async function handleSelection() {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text.length > 1 && !text.includes(' ')) {
        const word = text.replace(/[^a-zA-Z]/g, "");
        popup.classList.remove('hidden');
        document.getElementById('popup-word').textContent = word;
        document.getElementById('popup-meaning').textContent = "Searching...";

        if (window.innerWidth > 768 && selection.rangeCount > 0) {
            const rect = selection.getRangeAt(0).getBoundingClientRect();
            popup.style.left = rect.left + 'px';
            popup.style.top = (rect.bottom + 10) + 'px';
        }

        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if(!res.ok) throw new Error();
            const data = await res.json();
            document.getElementById('popup-meaning').textContent = data[0].meanings[0].definitions[0].definition;
            const audioUrl = data[0].phonetics.find(p => p.audio)?.audio;
            const audioBtn = document.getElementById('audio-btn');
            if(audioUrl) {
                audioBtn.classList.remove('hidden');
                audioBtn.onclick = () => new Audio(audioUrl).play();
            } else {
                audioBtn.classList.add('hidden');
            }
        } catch (e) {
            document.getElementById('popup-meaning').textContent = "Definition not found.";
            document.getElementById('audio-btn').classList.add('hidden');
        }
    }
}

document.getElementById('close-btn').onclick = () => popup.classList.add('hidden');
function showLoading(active) { loader.classList.toggle('hidden', !active); }
