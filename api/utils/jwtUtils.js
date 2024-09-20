// utils/jwtUtils.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function generateToken(userId, accountId) {
    return jwt.sign({ userId, accountId }, JWT_SECRET, { expiresIn: '1h' });
}

function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = { generateToken, verifyToken };