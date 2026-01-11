const PDFJS_VERSION = '3.11.174';

export const CONFIG = {
    workerSrc: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`,
    cMapUrl: `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/cmaps/`,
    standardFontUrl: `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/standard_fonts/`,
    dictionaryApi: 'https://api.dictionaryapi.dev/api/v2/entries/en/'
};

// Fix for font warning
export function silenceWarnings() {
    const origWarn = console.warn;
    console.warn = function (...args) {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('system font')) return;
        origWarn.apply(console, args);
    };
}
