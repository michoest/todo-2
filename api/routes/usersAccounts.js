// routes/usersAccounts.js
const express = require('express');
const router = express.Router();

router.get('/users', (req, res) => {
    const users = req.db.getCollection('users');
    res.json(users.find());
});

router.get('/accounts', (req, res) => {
    const accounts = req.db.getCollection('accounts');
    res.json(accounts.find());
});

// Add more routes for user and account management

module.exports = router;