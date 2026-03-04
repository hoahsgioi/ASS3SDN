const express = require('express');
const router = express.Router();
const Question = require('../models/question');
const { verifyUser, verifyAuthor } = require('../authenticate');

/**
 * GET /questions
 * Anyone can retrieve all questions.
 */
router.get('/', async (req, res, next) => {
    try {
        const questions = await Question.find({}).populate('author', 'username');
        res.json(questions);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /questions/:questionId
 * Anyone can retrieve a single question.
 */
router.get('/:questionId', async (req, res, next) => {
    try {
        const question = await Question.findById(req.params.questionId).populate('author', 'username');
        if (!question) {
            const err = new Error('Question not found');
            err.status = 404;
            return next(err);
        }
        res.json(question);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /questions
 * Any verified (logged-in) user can submit a new question.
 * Task 4: the submitting user becomes the author.
 */
router.post('/', verifyUser, async (req, res, next) => {
    try {
        const { text, options, keywords, correctAnswerIndex } = req.body;

        if (!text || !options || correctAnswerIndex === undefined) {
            const err = new Error('text, options, and correctAnswerIndex are required');
            err.status = 400;
            return next(err);
        }

        const question = new Question({
            text,
            author: req.user._id,   // set the author to the logged-in user
            options,
            keywords: keywords || [],
            correctAnswerIndex
        });

        await question.save();
        const populated = await question.populate('author', 'username');
        res.status(201).json(populated);
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /questions/:questionId
 * Task 4: Only the author of the question can update it.
 * verifyUser  → confirms a valid JWT
 * verifyAuthor → confirms req.user._id matches question.author
 */
router.put('/:questionId', verifyUser, verifyAuthor, async (req, res, next) => {
    try {
        // req.question is already loaded by verifyAuthor
        const { text, options, keywords, correctAnswerIndex } = req.body;

        if (text !== undefined)                req.question.text = text;
        if (options !== undefined)             req.question.options = options;
        if (keywords !== undefined)            req.question.keywords = keywords;
        if (correctAnswerIndex !== undefined)  req.question.correctAnswerIndex = correctAnswerIndex;

        await req.question.save();
        const populated = await req.question.populate('author', 'username');
        res.json(populated);
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /questions/:questionId
 * Task 4: Only the author of the question can delete it.
 */
router.delete('/:questionId', verifyUser, verifyAuthor, async (req, res, next) => {
    try {
        await Question.findByIdAndDelete(req.params.questionId);
        res.json({ success: true, message: 'Question deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
