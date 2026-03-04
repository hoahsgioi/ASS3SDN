const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { verifyUser, verifyAdmin, getToken } = require('../authenticate');

/**
 * POST /users/register
 * Register a new user. Open to everyone.
 */
router.post('/register', async (req, res, next) => {
    try {
        const { username, password, admin } = req.body;

        if (!username || !password) {
            const err = new Error('username and password are required');
            err.status = 400;
            return next(err);
        }

        const existing = await User.findOne({ username });
        if (existing) {
            const err = new Error('Username already taken');
            err.status = 409;
            return next(err);
        }

        const user = new User({
            username,
            password,
            admin: admin || false
        });

        await user.save();

        const token = getToken(user);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /users/login
 * Authenticate a user and return a JWT. Open to everyone.
 */
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            const err = new Error('username and password are required');
            err.status = 400;
            return next(err);
        }

        const user = await User.findOne({ username });
        if (!user) {
            const err = new Error('Invalid credentials');
            err.status = 401;
            return next(err);
        }

        const match = await user.comparePassword(password);
        if (!match) {
            const err = new Error('Invalid credentials');
            err.status = 401;
            return next(err);
        }

        const token = getToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            token
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /users
 * Returns all registered users. Admin only.
 * Task 3: Only an Admin can retrieve the full user list.
 */
router.get('/', verifyUser, verifyAdmin, async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password'); // omit password hashes
        res.json(users);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
