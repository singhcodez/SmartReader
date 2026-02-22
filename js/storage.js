
// Configure the database
localforage.config({
    name: 'SmartReaderDB',
    storeName: 'books'
});

export async function saveBook(file) {
    const id = Date.now().toString(); // Simple unique ID
    const bookData = {
        id: id,
        title: file.name,
        date: new Date().toLocaleDateString(),
        fileBlob: file // We save the actual PDF file!
    };
    
    await localforage.setItem(id, bookData);
    return bookData;
}

export async function getAllBooks() {
    const books = [];
    await localforage.iterate((value, key) => {
        // We only need metadata for the list, not the whole blob (for speed)
        books.push({
            id: value.id,
            title: value.title,
            date: value.date
        });
    });
    return books.reverse(); // Newest first
}

export async function getBookFile(id) {
    const data = await localforage.getItem(id);
    return data ? data.fileBlob : null;
}

export async function deleteBook(id) {
    await localforage.removeItem(id);
}

// Add to js/storage.js

export async function toggleBookmark(bookId, pageNum) {
    const book = await localforage.getItem(bookId);
    if (!book) return;

    if (!book.bookmarks) book.bookmarks = [];
    
    const index = book.bookmarks.indexOf(pageNum);
    if (index > -1) {
        book.bookmarks.splice(index, 1); // Remove if exists
    } else {
        book.bookmarks.push(pageNum); // Add if doesn't
        book.bookmarks.sort((a, b) => a - b); // Keep them in order
    }
    
    await localforage.setItem(bookId, book);
    return book.bookmarks;
}

export async function getBookmarks(bookId) {
    const book = await localforage.getItem(bookId);
    return book ? (book.bookmarks || []) : [];
}

