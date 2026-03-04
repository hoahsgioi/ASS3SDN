const jwt = require('jsonwebtoken');
const Question = require('./models/question');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/**
 * verifyUser – validates the JWT token sent in the Authorization header.
 * On success, attaches the decoded payload to req.user.
 */
const verifyUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Expected format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        const err = new Error('Token format is invalid');
        err.status = 401;
        return res.status(401).json({ message: 'Token format is invalid' });
    }

    const token = parts[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        req.user = decoded; // { _id, username, admin, iat, exp }
        return next();
    });
};

/**
 * verifyAdmin – must follow verifyUser in the middleware chain.
 * Checks req.user.admin; proceeds if true, otherwise returns 403.
 */
const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.admin === true) {
        return next();
    }

    const err = new Error('You are not authorized to perform this operation!');
    err.status = 403;
    return res.status(403).json({ message: 'You are not authorized to perform this operation!' });
};

/**
 * verifyAuthor – must follow verifyUser in the middleware chain.
 * Loads the question from the DB and compares its author with req.user._id.
 * Proceeds if they match, otherwise returns 403.
 */
const verifyAuthor = async (req, res, next) => {
    try {
        const question = await Question.findById(req.params.questionId);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Compare ObjectIds as strings
        if (question.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not the author of this question' });
        }

        // Attach the loaded question to the request so the route handler can reuse it
        req.question = question;
        return next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

/**
 * getToken – helper to sign a JWT for a given user document.
 */
const getToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
            username: user.username,
            admin: user.admin
        },
        JWT_SECRET,
        { expiresIn: '1d' }
    );
};

module.exports = { verifyUser, verifyAdmin, verifyAuthor, getToken };
