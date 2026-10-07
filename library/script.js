//  DATA STATE & CONSTRUCTORS
const myLibrary = [];

function Book(title, author, pages, isRead) {
    this.id = crypto.randomUUID(); // Generates a unique, stable identifier
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.isRead = isRead;
}

// Prototype method
Book.prototype.toggleReadStatus = function() {
    this.isRead = !this.isRead;
};

// CORE LOGIC (Modifying the State)
function addBookToLibrary(title, author, pages, isRead) {
    const newBook = new Book(title, author, pages, isRead);
    myLibrary.push(newBook);
    renderLibrary(); // resync the visual DOM with the updated array data
}

function removeBook(idToRemove) {
    // Find the index of the book with the matching ID and splice it out
    const index = myLibrary.findIndex(book => book.id === idToRemove);
    if (index !== -1) {
        myLibrary.splice(index, 1);
        renderLibrary();
    }
}

function toggleBookStatus(idToToggle) {
    // Find the specific book object and trigger its prototype method
    const book = myLibrary.find(book => book.id === idToToggle);
    if (book) {
        book.toggleReadStatus();
        renderLibrary();
    }
}

// DOM MANIPULATION (Rendering the State)
const gridContainer = document.getElementById('library-grid');

function renderLibrary() {
    // Clear the current display entirely
    gridContainer.innerHTML = '';

    // Loop through the array and construct the HTML for each object
    myLibrary.forEach((book) => {
        const bookCard = document.createElement('article');
        bookCard.classList.add('book-card');
        // Attach the unique ID directly to the HTML container
        bookCard.setAttribute('data-id', book.id);

        bookCard.innerHTML = `
            <div class="book-title">${book.title}</div>
            <div class="book-author">By ${book.author}</div>
            <div class="book-pages">${book.pages} Pages</div>
            <div class="card-actions">
                <button class="toggle-btn ${book.isRead ? 'status-read' : 'status-unread'}">
                    ${book.isRead ? 'Read' : 'Not Read'}
                </button>
                <button class="danger-btn remove-btn">Remove</button>
            </div>
        `;

        gridContainer.appendChild(bookCard);
    });
}

// EVENT LISTENERS

//Modal Handling
const modal = document.getElementById('book-modal');
const form = document.getElementById('new-book-form');

document.getElementById('open-modal-btn').addEventListener('click', () => {
    modal.showModal(); // Native method to open <dialog>
});

document.getElementById('close-modal-btn').addEventListener('click', () => {
    modal.close();
    form.reset(); // Clear inputs if they cancel
});

// --- Form Submission ---
form.addEventListener('submit', (event) => {
    event.preventDefault(); //Stops the browser from refreshing the page

    // Extract values from the DOM inputs
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const pages = document.getElementById('pages').value;
    const isRead = document.getElementById('is-read').checked;

    // Pass data to logic handler, close modal, and clean up
    addBookToLibrary(title, author, pages, isRead);
    modal.close();
    form.reset();
});

// Event Delegation for Dynamic Buttons
//the buttons are destroyed and recreated every render
gridContainer.addEventListener('click', (event) => {
    // Traverse up to find the closest card container to grab its unique ID
    const card = event.target.closest('.book-card');
    if (!card) return;

    const bookId = card.getAttribute('data-id');

    if (event.target.classList.contains('remove-btn')) {
        removeBook(bookId);
    } 
    else if (event.target.classList.contains('toggle-btn')) {
        toggleBookStatus(bookId);
    }
});

// Initialization
// a dummy book so the page isn't empty on first load
addBookToLibrary("DuMb WaYs To LiVe", "Bharath", 69, false);