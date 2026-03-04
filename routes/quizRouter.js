const express = require('express');
const router = express.Router();
const Quiz = require('../models/quiz');
const { verifyUser, verifyAdmin } = require('../authenticate');

/**
 * GET /quizzes
 * Anyone can retrieve all quizzes.
 */
router.get('/', async (req, res, next) => {
    try {
        const quizzes = await Quiz.find({}).populate('questions');
        res.json(quizzes);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /quizzes/:quizId
 * Anyone can retrieve a single quiz.
 */
router.get('/:quizId', async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate('questions');
        if (!quiz) {
            const err = new Error('Quiz not found');
            err.status = 404;
            return next(err);
        }
        res.json(quiz);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /quizzes
 * Task 2: Only an Admin can create a quiz.
 * verifyUser  → validates JWT
 * verifyAdmin → confirms admin flag
 */
router.post('/', verifyUser, verifyAdmin, async (req, res, next) => {
    try {
        const { title, description, questions } = req.body;

        if (!title) {
            const err = new Error('title is required');
            err.status = 400;
            return next(err);
        }

        const quiz = new Quiz({ title, description, questions: questions || [] });
        await quiz.save();
        res.status(201).json(quiz);
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /quizzes/:quizId
 * Task 2: Only an Admin can update a quiz.
 */
router.put('/:quizId', verifyUser, verifyAdmin, async (req, res, next) => {
    try {
        const { title, description, questions } = req.body;
        const updateFields = {};

        if (title !== undefined)       updateFields.title = title;
        if (description !== undefined) updateFields.description = description;
        if (questions !== undefined)   updateFields.questions = questions;

        const updated = await Quiz.findByIdAndUpdate(
            req.params.quizId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).populate('questions');

        if (!updated) {
            const err = new Error('Quiz not found');
            err.status = 404;
            return next(err);
        }

        res.json(updated);
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /quizzes/:quizId
 * Task 2: Only an Admin can delete a quiz.
 */
router.delete('/:quizId', verifyUser, verifyAdmin, async (req, res, next) => {
    try {
        const deleted = await Quiz.findByIdAndDelete(req.params.quizId);

        if (!deleted) {
            const err = new Error('Quiz not found');
            err.status = 404;
            return next(err);
        }

        res.json({ success: true, message: 'Quiz deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
