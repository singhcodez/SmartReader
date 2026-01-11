export const state = {
    pdfDoc: null,
    pageNum: 1,
    scale: 1.0,
    isDragMode: false,
    renderTask: null,
    isInitialLoad: true,
    file: null
};

export function resetState() {
    state.pageNum = 1;
    state.scale = 1.0;
    state.isInitialLoad = true;
    state.pdfDoc = null;
}
