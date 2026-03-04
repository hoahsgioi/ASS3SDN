require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const userRouter = require('./routes/userRouter');
const questionRouter = require('./routes/questionRouter');
const quizRouter = require('./routes/quizRouter');

const app = express();
const cors = require('cors');
app.use(cors({
    origin: [
    'http://localhost:5173',
    'https://ass-4-sdn.vercel.app'
    ],
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
 credentials: true,
}));
// ─────────────────────────────────────────────
//  Database connection
// ─────────────────────────────────────────────
const MONGO_URL = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quizDB';

mongoose
    .connect(MONGO_URL)
    .then(() => console.log('Connected to MongoDB:', MONGO_URL))
    .catch((err) => console.error('MongoDB connection error:', err));

// ─────────────────────────────────────────────
//  Global middleware
// ─────────────────────────────────────────────
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
//  Routes
// ─────────────────────────────────────────────
app.use('/users', userRouter);
app.use('/questions', questionRouter);
app.use('/quizzes', quizRouter);

// ─────────────────────────────────────────────
//  404 handler
// ─────────────────────────────────────────────
app.use((req, res, next) => {
    const err = new Error(`Not Found: ${req.originalUrl}`);
    err.status = 404;
    next(err);
});

// ─────────────────────────────────────────────
//  Global error handler
// ─────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        message: err.message || 'Internal Server Error',
        status
    });
});

// ─────────────────────────────────────────────
//  Start server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
