const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: "john_doe", password: "password1" },
  { username: "jane_smith", password: "password2" },
];

const isValid = (username)=>{ //returns boolean
  // For simplicity, let's assume any username with a length greater than 3 is valid.
  return username.length > 3;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const user = users.find((user) => user.username === username && user.password === password);
  return !!user; // Returns true if user is found, false otherwise
}


//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if the provided username and password are valid
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials. Please check your username and password." });
  }

  // If credentials are valid, generate a JSON Web Token (JWT) for the session
  const secretKey = "your_secret_key"; // Replace this with your own secret key
  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

  // Return the token as a response
  return res.status(200).json({ token });
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.query;
  const { username } = req.session; // Assuming the username is stored in the session after login.

  // Check if the required query parameter 'review' is provided
  if (!review) {
    return res.status(400).json({ message: "Review text is required." });
  }

  // Find the book with the given ISBN
  const book = findBookByISBN(isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Check if the user has already reviewed the book
  if (book.reviews.hasOwnProperty(username)) {
    // If the user has already reviewed the book, modify the existing review
    book.reviews[username] = review;
    return res.status(200).json({ message: "Review updated successfully." });
  } else {
    // If the user hasn't reviewed the book, add a new review
    book.reviews[username] = review;
    return res.status(201).json({ message: "Review added successfully." });
  }
});
const findBookByISBN = (isbn) => {
  return books.hasOwnProperty(isbn) ? books[isbn] : null;
};

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { username } = req.session; // Assuming the username is stored in the session after login.

  // Find the book with the given ISBN
  const book = findBookByISBN(isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Check if the user has already reviewed the book
  if (book.reviews.hasOwnProperty(username)) {
    // If the user has reviewed the book, delete their review
    delete book.reviews[username];
    return res.status(200).json({ message: "Review deleted successfully." });
  } else {
    return res.status(404).json({ message: "Review not found. You can only delete your own reviews." });
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
