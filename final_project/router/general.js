const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if the provided username is valid
  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username." });
  }

  // Check if the username already exists in the users database
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(409).json({ message: "Username already exists. Please choose a different username." });
  }

  // If everything is valid, create a new user object and add it to the users database
  const newUser = { username, password };
  users.push(newUser);

  // You might want to save the new user object to your database here.

  return res.status(201).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  // Get the list of books
  const bookList = await books.values();

  // Convert the book list to a JSON string
  const bookListJSON = JSON.stringify(bookList);

  return res.status(200).json(bookListJSON);
});
// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;

    if (books.hasOwnProperty(isbn)) {
      const bookDetails = books[isbn];
      return res.status(200).json(bookDetails);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;

    // Create an array to store the books matching the author
    const matchedBooks = [];

    // Simulate an asynchronous operation (e.g., a database query) using setTimeout
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Iterate through the books object to find books with the specified author
    for (const bookId in books) {
      const book = books[bookId];
      if (book.author === author) {
        matchedBooks.push(book);
      }
    }

    if (matchedBooks.length > 0) {
      // If there are matching books, return them as a response
      return res.status(200).json({ books: matchedBooks });
    } else {
      // If no matching books are found, return an appropriate message
      return res.status(404).json({ message: "No books found for the given author." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const { title } = req.params;

  // Find the book based on the provided title
  const matchingBooks = await books.filter(async book => {
    return book.title.toLowerCase().includes(title.toLowerCase());
  });

  if (matchingBooks.length === 0) {
    // No book with the given title found
    return res.status(404).json({ message: "Book not found" });
  } else {
    // Book(s) with the given title found
    return res.status(200).json({ books: matchingBooks });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn; // Get the ISBN from the request parameters

  // Check if the book with the given ISBN exists in the books database
  if (books.hasOwnProperty(isbn)) {
    const book = books[isbn];
    const reviews = book.reviews;

    // If there are reviews for the book, send them in the response
    if (Object.keys(reviews).length > 0) {
      return res.status(200).json({ reviews });
    } else {
      return res.status(404).json({ message: "No reviews available for this book." });
    }
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

module.exports.general = public_users;
