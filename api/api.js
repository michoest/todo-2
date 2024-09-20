// api.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { initDatabase, getDb, getDbCollections } = require('./db/db');
const { verifyToken } = require('./utils/jwtUtils');
const authRouter = require('./routes/auth');
const usersAccountsRouter = require('./routes/usersAccounts');
const tasksRouter = require('./routes/tasks');

const app = express();
const port = 3000;

app.use(cors('*'));
app.use(express.json());
app.use(morgan('combined'));

async function startApp() {
    await initDatabase();
    console.log('Database initialized, starting server...');
    startServer();
}

startApp();

function startServer() {
    // Make db accessible to routers
    app.use((req, res, next) => {
        req.db = getDb();
        next();
    });

    // JWT Authentication middleware
    app.use((req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1]; // Bearer TOKEN
        if (token) {
            try {
                const decoded = verifyToken(token);
                const Users = getDb().getCollection('users');
                const Accounts = getDb().getCollection('accounts');
                
                const user = Users.findOne({ id: decoded.userId });
                if (user) {
                    req.user = user;
                }

                const account = Accounts.findOne({ id: decoded.accountId });
                if (account) {
                    req.account = account;
                }
            } catch (error) {
                console.log(error);
                // Token is invalid, but we'll proceed without setting req.user or req.account
            }
        }
        next();
    });

    // Use routers
    app.use('/auth', authRouter);
    app.use('/users', usersAccountsRouter);
    app.use('/tasks', tasksRouter);

    // Ping route
    app.get('/ping', async (req, res, next) => {
        res.send('pong');
    });

    // Test routes
    app.get('/test', async (req, res, next) => {
        res.json({ account: req.account });
    });

    // Error handling with APIError
    app.use(function (err, req, res, next) {
        const statusCode = err.statusCode || 500;
        console.error(err.message, err.stack);
        
        return res.status(statusCode).json({ success: false, notification: { message: err.message }, ...err.info });
    });

    // Start the server
    const server = app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });

    // Handle server shutdown
    process.on('SIGINT', () => {
        console.log('Server is shutting down...');
        getDb().close(() => {
            console.log('Database closed.');
            server.close(() => {
                console.log('Server closed.');
                process.exit(0);
            });
        });
    });
}

module.exports = app;