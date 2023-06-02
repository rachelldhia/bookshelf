const books = [];
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "Bookshelf";
const form = document.getElementById("inputBook");
const inputSearchBook = document.getElementById("searchBookTitle");
const formSearchBook = document.getElementById("searchBook");

inputSearchBook.addEventListener("keyup", (e) => {
   e.preventDefault();
   searchBooks();
});

formSearchBook.addEventListener("submit", (e) => {
   e.preventDefault();
   searchBooks();
});

function isStorageExist() {
   if (typeof Storage === "undefined") {
      swal("Upss", "Sorry, Your browser does not support web storage. Please use another browser", "info");
      return false;
   }
   return true;
}
const generateId = () => +new Date();

const generateBookItem = (id, title, author, year, isCompleted) => {
   return {
      id,
      title,
      author,
      year,
      isCompleted,
   };
};

function checkStatusBook() {
   const isCheckComplete = document.getElementById("inputBookIsComplete");
   if (isCheckComplete.checked) {
      return true;
   }
   return false;
}

function addBook() {
   const bookTitle = document.getElementById("inputBookTitle").value;
   const bookAuthor = document.getElementById("inputBookAuthor").value;
   const bookYear = document.getElementById("inputBookYear").value;
   const isCompleted = checkStatusBook();

   const id = generateId();
   const newBook = generateBookItem(id, bookTitle, bookAuthor, bookYear, isCompleted);

   books.unshift(newBook);
   document.dispatchEvent(new Event(RENDER_EVENT));
   saveData();

   swal("Succeed", "New book added to shelf", "success");
}


function findBookIndex(bookId) {
   for (const index in books) {
      if (books[index].id == bookId) {
         return index;
      }
   }
   return null;
}


function removeBook(bookId) {
   const bookTarget = findBookIndex(bookId);
   swal({
      title: "Are you sure?",
      text: "The book will be permanently deleted, you can't recover it!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
   }).then((willDelete) => {
      if (willDelete) {
         books.splice(bookTarget, 1);
         document.dispatchEvent(new Event(RENDER_EVENT));
         saveData();

         swal("Succeed", "One book has been removed from the shelf", "success");
      } else {
         swal("Books don't get deleted");
      }
   });
}

function resetRak() {
   swal({
      title: "Are you sure?",
      text: "All books will be permanently removed from the shelf, you can't recover them!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
   }).then((willDelete) => {
      if (willDelete) {
         books.splice(0, books.length);
         document.dispatchEvent(new Event(RENDER_EVENT));
         saveData();

         swal("Succeed", "All books have been removed from the shelves", "success");
      } else {
         swal("Shelf not emptied");
      }
   });
}

function changeBookStatus(bookId) {
   const bookIndex = findBookIndex(bookId);
   for (const index in books) {
      if (index === bookIndex) {
         if (books[index].isCompleted === true) {
            books[index].isCompleted = false;
            swal("Succeed", "Your book has been moved to the shelf unfinished", "success");
         } else {
            books[index].isCompleted = true;
            swal("Succeed", "Your book has been moved to the shelf finished reading", "success");
         }
      }
   }

   document.dispatchEvent(new Event(RENDER_EVENT));
   saveData();
}

function searchBooks() {
   const inputSearchValue = document.getElementById("searchBookTitle").value.toLowerCase();
   const incompleteBookShelf = document.getElementById("incompleteBookshelfList");
   const completeBookShelf = document.getElementById("completeBookshelfList");
   incompleteBookShelf.innerHTML = "";
   completeBookShelf.innerHTML = "";

   if (inputSearchValue == "") {
      document.dispatchEvent(new Event(RENDER_EVENT));
      return;
   }

   for (const book of books) {
      if (book.title.toLowerCase().includes(inputSearchValue)) {
         if (book.isCompleted == false) {
            let el = `
            <article class="book_item">
               <h3>${book.title}</h3>
               <p>Writer  : ${book.author}</p>
               <p>Publication Year : ${book.year}</p>
               <div class="action">
                  <button class="btn-blue" onclick="changeBookStatus(${book.id})">Selesai di Baca</button>
                  <button class="btn-red" onclick="remove(${book.id})">Hapus Buku</button>
                  <button class="btn-orange" onclick="editBookData(${book.id})">Edit buku</button>
                  </div>
            </article>
            `;

            incompleteBookShelf.innerHTML += el;
         } else {
            let el = `
            <article class="book_item">
               <h3>${book.title}</h3>
               <p>Writer  : ${book.author}</p>
               <p>Publication Year : ${book.year}</p>
               <div class="action">
                  <button class="btn-blue" onclick="changeBookStatus(${book.id})">Belum selesai di Baca</button>
                  <button class="btn-red" onclick="removeBook(${book.id})">Hapus Buku</button>
                  <button class="btn-orange" onclick="editBookData(${book.id})">Edit buku</button>
                  </div>
            </article>
            `;

            completeBookShelf.innerHTML += el;
         }
      }
   }
}

function editBookData(bookId) {
   const sectionEdit = document.querySelector(".input_edit_section");
   sectionEdit.style.display = "flex";
   const editTitle = document.getElementById("inputEditTitle");
   const editAuthor = document.getElementById("inputEditAuthor");
   const editYear = document.getElementById("inputEditYear");
   const formEditData = document.getElementById("editData");
   const cancelEdit = document.getElementById("bookEditCancel");
   const SubmitEdit = document.getElementById("bookEditSubmit");

   bookTarget = findBookIndex(bookId);

   editTitle.setAttribute("value", books[bookTarget].title);
   editAuthor.setAttribute("value", books[bookTarget].author);
   editYear.setAttribute("value", books[bookTarget].year);

   SubmitEdit.addEventListener("click", (e) => {
      books[bookTarget].title = editTitle.value;
      books[bookTarget].author = editAuthor.value;
      books[bookTarget].year = editYear.value;

      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
      formEditData.reset();
      sectionEdit.style.display = "none";
      swal("Succeed", "Your book data has been edited successfully", "success");
   });

   cancelEdit.addEventListener("click", (e) => {
      e.preventDefault();
      sectionEdit.style.display = "none";
      formEditData.reset();
      swal("You cancel to edit book data");
   });
}


function saveData() {
   if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);

      document.dispatchEvent(new Event(RENDER_EVENT));
   }
}

function loadDataFromStorage() {
   const serializedData = localStorage.getItem(STORAGE_KEY);
   let data = JSON.parse(serializedData);

   if (data !== null) {
      data.forEach((book) => {
         books.unshift(book);
      });
   }
   document.dispatchEvent(new Event(RENDER_EVENT));
   return books;
}

function showBook(books = []) {
   const incompleteBookShelf = document.getElementById("incompleteBookshelfList");
   const completeBookShelf = document.getElementById("completeBookshelfList");

   incompleteBookShelf.innerHTML = "";
   completeBookShelf.innerHTML = "";

   books.forEach((book) => {
      if (book.isCompleted == false) {
         let el = `
            <article class="book_item">
               <h3>${book.title}</h3>
               <p>Writer : ${book.author}</p>
               <p>Publication Year : ${book.year}</p>
               <div class="action">
                  <button class="btn-blue" onclick="changeBookStatus(${book.id})">Finish</i></button>
                  <button class="btn-red" onclick="removeBook(${book.id})">Remove</button>
                  <button class="btn-orange" onclick="editBookData(${book.id})">Edit</i></button>
               </div>
            </article>
            `;

         incompleteBookShelf.innerHTML += el;
      } else {
         let el = `
            <article class="book_item">
               <h3>${book.title}</h3>
               <p>Writer : ${book.author}</p>
               <p>Publication Year : ${book.year}</p>
               <div class="action">
                  <button class="btn-blue" onclick="changeBookStatus(${book.id})">Haven't Read</button>
                  <button class="btn-red" onclick="removeBook(${book.id})">Remove</button>
                  <button class="btn-orange" onclick="editBookData(${book.id})">Edit</button>
                  </div>
            </article>
            `;

         completeBookShelf.innerHTML += el;
      }
   });
}

document.addEventListener("DOMContentLoaded", function () {
   form.addEventListener("submit", function (e) {
      e.preventDefault();
      addBook();

      form.reset();
   });

   if (isStorageExist()) {
      loadDataFromStorage();
   }
});

document.addEventListener(RENDER_EVENT, () => {
   const btnReset = document.getElementById("reset");
   if (books.length <= 0) {
      btnReset.style.display = "none";
   } else {
      btnReset.style.display = "block";
   }

   showBook(books);
});
    