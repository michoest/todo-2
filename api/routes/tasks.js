// routes/tasks.js
const express = require('express');
const router = express.Router();
const { v4: uuid } = require('uuid');

router.get('/', (req, res) => {
    const tasks = req.db.getCollection('tasks');
    res.json(tasks.find());
});

router.post('/', (req, res) => {
    const tasks = req.db.getCollection('tasks');
    const accounts = req.db.getCollection('accounts');
    const { title, tags, status, ownerId, dueDate, accessAccountIds } = req.body;
    
    const owner = accounts.findOne({ id: ownerId });
    if (!owner) {
        return res.status(400).json({ error: 'Owner account not found' });
    }
    
    const newTask = {
        id: uuid(),
        title,
        tags,
        status,
        ownerId,
        dueDate: new Date(dueDate),
        accessAccountIds
    };
    
    tasks.insert(newTask);
    res.status(201).json(newTask);
});

// Add more routes for task management

module.exports = router;