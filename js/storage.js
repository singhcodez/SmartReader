
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
