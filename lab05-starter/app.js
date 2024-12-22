const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const multer = require('multer');
const path = require('path');



const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// MongoDB Connection
const MONGODB_URI = "mongodb+srv://ledaiduong1309:23560085@cluster0.j5qql.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0insert_your_mongodb_uri_here";
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Exit the process with failure
    });

// Routes
const bookRoutes = require('./routes/books');
app.use('/books', bookRoutes);

// Home Page
app.get('/', (req, res) => {
  res.redirect('/books');
});

// Start Server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

