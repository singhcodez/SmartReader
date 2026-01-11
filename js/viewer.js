import { CONFIG } from './config.js';
import { state } from './state.js';
import { els, showLoading, updateUIOnLoad, updateZoomDisplay } from './ui.js';

export async function loadPDF(data) {
    showLoading(true);
    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = CONFIG.workerSrc;
        
        state.pdfDoc = await pdfjsLib.getDocument({
            data: data,
            cMapUrl: CONFIG.cMapUrl,
            cMapPacked: true,
            standardFontDataUrl: CONFIG.standardFontUrl,
            disableFontFace: false,
        }).promise;
        
        updateUIOnLoad(state.pdfDoc.numPages);
        state.pageNum = 1;
        state.isInitialLoad = true;
        
        await renderPage(state.pageNum);
    } catch (err) {
        console.error(err);
        alert("Load Error: " + err.message);
    }
    showLoading(false);
}

export async function renderPage(num) {
    if (state.renderTask) state.renderTask.cancel();
    showLoading(true);

    try {
        const page = await state.pdfDoc.getPage(num);
        
        // Auto-Fit Logic
        if (state.isInitialLoad) {
            const unscaledViewport = page.getViewport({ scale: 1 });
            const containerWidth = els.viewerScroll.clientWidth - 40; 
            state.scale = Math.min((containerWidth / unscaledViewport.width), 1.5);
            state.isInitialLoad = false;
            updateZoomDisplay();
        }

        const viewport = page.getViewport({ scale: state.scale });
        const outputScale = window.devicePixelRatio || 1; 

        els.container.innerHTML = "";

        // Wrapper
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page-wrapper';
        pageDiv.style.width = Math.floor(viewport.width) + 'px';
        pageDiv.style.height = Math.floor(viewport.height) + 'px';
        els.container.appendChild(pageDiv);

        // Canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: false });
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";
        pageDiv.appendChild(canvas);

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        state.renderTask = page.render({
            canvasContext: ctx,
            transform: transform,
            viewport: viewport
        });

        await state.renderTask.promise;

        // Text Layer
        const textLayerDiv = document.createElement('div');
        textLayerDiv.className = 'textLayer';
        textLayerDiv.style.width = Math.floor(viewport.width) + 'px';
        textLayerDiv.style.height = Math.floor(viewport.height) + 'px';
        textLayerDiv.style.setProperty('--scale-factor', state.scale);
        pageDiv.appendChild(textLayerDiv);

        const textContent = await page.getTextContent();
        pdfjsLib.renderTextLayer({
            textContentSource: textContent,
            container: textLayerDiv,
            viewport: viewport,
            textDivs: []
        });

        els.pageNum.textContent = num;

    } catch (e) {
        if (e.name !== 'RenderingCancelledException') console.error(e);
    }
    showLoading(false);
}
