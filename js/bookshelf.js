
import { getAllBooks, deleteBook, getBookFile } from './storage.js';
import { loadPDF } from './viewer.js';
import { els, showLoading } from './ui.js';

const grid = document.getElementById('book-grid');
const emptyState = document.getElementById('empty-state');
const libraryView = document.getElementById('library-view');
const readerView = document.getElementById('pdf-container');

export async function initBookshelf() {
    refreshLibrary();
}

export async function refreshLibrary() {
    const books = await getAllBooks();
    
    grid.innerHTML = '';
    
    if (books.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');

    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <div class="card-icon"><i class="fas fa-book"></i></div>
            <div class="card-info">
                <h4>${book.title}</h4>
                <span>${book.date}</span>
            </div>
            <button class="delete-btn" data-id="${book.id}">&times;</button>
        `;

        // Click to Open
        card.addEventListener('click', async (e) => {
            if(e.target.classList.contains('delete-btn')) return; // Ignore delete clicks
            openBook(book.id);
        });

        // Click to Delete
        card.querySelector('.delete-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            if(confirm('Remove this book?')) {
                await deleteBook(book.id);
                refreshLibrary();
            }
        });

        grid.appendChild(card);
    });
}

async function openBook(id) {
    showLoading(true);
    const fileBlob = await getBookFile(id);
    if(fileBlob) {
        // Switch Views
        libraryView.classList.add('hidden');
        readerView.classList.remove('hidden');
        
        // Convert Blob to ArrayBuffer for PDF.js
        const arrayBuffer = await fileBlob.arrayBuffer();
        loadPDF(new Uint8Array(arrayBuffer));
    }
    showLoading(false);
}

// Helper to switch back to library
export function showLibrary() {
    readerView.innerHTML = ''; // Clear memory
    readerView.classList.add('hidden');
    libraryView.classList.remove('hidden');
    refreshLibrary();
}
