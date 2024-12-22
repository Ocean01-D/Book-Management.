const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

    // Cấu hình lưu trữ cho multer
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images')); // Thư mục lưu trữ file
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Đặt tên file
      }
    });

    // Bộ lọc file để chỉ chấp nhận các file ảnh
    const fileFilter = (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('File không hợp lệ. Vui lòng upload file ảnh (jpeg, png, gif).'));
      }
    };

    // Tạo middleware upload
    const upload = multer({ 
      storage: storage, 
      fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn file tối đa 5MB
});

// GET: List all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.render('books/list', { books });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching books.');
  }
});

// GET: Add new book form
router.get('/add', (req, res) => {
  res.render('books/add');
});

// POST: Add new book
router.post('/', upload.single('picture'), async (req, res) => {
  try {
    // Kiểm tra nếu có file ảnh được upload
    let picturePath = '';
    if (req.file) {
      picturePath = `/images/${req.file.filename}`;
    }

    // Tạo dữ liệu sách từ form
    const bookData = {
      title: req.body.title,
      author: req.body.author,
      description: req.body.description,
      publishDate: req.body.publishDate,
      genre: req.body.genre,
      publisher: req.body.publisher,
      pages: req.body.pages,
      language: req.body.language,
      picture: picturePath, // Đường dẫn ảnh
    };

    // Lưu dữ liệu vào MongoDB
    const book = new Book(bookData);
    await book.save();

    // Chuyển hướng về danh sách sách
    res.redirect('/books');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while adding the book.');
  }
});

// GET: Show book details
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // Kiểm tra nếu ID hợp lệ
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid Book ID');
  }

  try {
    // Tăng viewCount
    const book = await Book.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } }, // Tăng viewCount thêm 1
      { new: true }
    );

    if (!book) {
      return res.status(404).send('Book not found');
    }

    // Render trang chi tiết
    res.render('books/details', { book });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching the book details.');
  }
});

// GET: Edit book form
router.get('/edit/:id', async (req, res) => {
  const { id } = req.params;

  // Kiểm tra nếu ID hợp lệ
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid Book ID');
  }

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).send('Book not found');
    }
    res.render('books/edit', { book });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching the book details.');
  }
});

// PUT: Update book details
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  // Kiểm tra nếu ID hợp lệ
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid Book ID');
  }

  try {
    const updatedBook = await Book.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedBook) {
      return res.status(404).send('Book not found');
    }
    res.redirect('/books');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while updating the book.');
  }
});

// DELETE: Remove book
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // Kiểm tra nếu ID hợp lệ
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid Book ID');
  }

  try {
    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook) {
      return res.status(404).send('Book not found');
    }
    res.redirect('/books');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while deleting the book.');
  }
});

// Route thêm comment
router.post('/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { name, content } = req.body;

  if (!name || !content || content.length > 200) {
    return res.status(400).send('Invalid comment data.');
  }

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).send('Book not found.');
    }

    book.comments.unshift({
      name: name.trim(),
      content: content.trim(),
    });

    await book.save();
    res.redirect(`/books/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error.');
  }
});

module.exports = router;









/*
// Cấu hình lưu trữ cho multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images')); // Thư mục lưu trữ file
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Đặt tên file
  }
});

// Bộ lọc file để chỉ chấp nhận các file ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File không hợp lệ. Vui lòng upload file ảnh (jpeg, png, gif).'));
  }
};

// Tạo middleware upload
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn file tối đa 5MB
});

// Route để upload file
router.post('/', upload.single('picture'), (req, res) => {
  try {
    const filePath = `/images/${req.file.filename}`; // Đường dẫn file
    res.status(200).json({ 
      message: 'Upload thành công!',
      filePath: filePath
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



// GET: List all books
router.get('/', async (req, res) => {
  const books = await Book.find();
  res.render('books/list', { books });
});

// GET: Add new book form
router.get('/add', (req, res) => {
  res.render('books/add');
});

// POST: Add new book
router.post('/', async (req, res) => {
  await Book.create(req.body);

  res.redirect('/books');
});

// GET: Show book details
router.get('/:id', async (req, res) => {
    const book = await Book.findById(req.params.id);
    res.render('books/details', { book });
  });

// GET: Edit book form
router.get('/edit/:id', async (req, res) => {  //fix
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).send('Book not found');
    res.render('books/edit', { book });
});

// PUT: Update book details
router.put('/:id', async (req, res) => {  //fix
    await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.redirect('/books');
  });

// PUT: Update book details -fix
router.put('/:id', async (req, res) => {
    const bookUpdates = { ...req.body };
    res.redirect(`/books/edit/${req.params.id}`);
  
});

// DELETE: Remove book
router.delete('/:id', async (req, res) => {
  // Insert your code here
});

module.exports = router;  */
