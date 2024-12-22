const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },     // Name of the reader
  content: { type: String, required: true },  // The comment itself
  date: { type: Date, default: Date.now },    // Timestamp for the review
});


const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  publishDate: { type: Date },
  publisher: { type: String },
  genre: { type: String },
  pageCount: { type: Number },
  comments: [ commentSchema ], // Embedded schema for comments
  viewCount: { type: Number, default: 0 }, // Tracks the number of views
  picture: { type: String },
  language: { type: String },
});

module.exports = mongoose.model('Book', bookSchema);
