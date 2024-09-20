// api.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

const { initDatabase, getDb, getDbCollections } = require("./db/db");
const { verifyToken } = require("./utils/jwtUtils");
const { asyncWrapper, APIError, sendSSE } = require('./utils/utils');
const authRouter = require("./routes/auth");
const usersAccountsRouter = require("./routes/usersAccounts");
const tasksRouter = require("./routes/tasks");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors("*"));
app.use(express.json());
app.use(morgan("combined"));

async function startApp() {
  await initDatabase();
  console.log("Database initialized, starting server...");
  startServer();
}

startApp();

function startServer() {
  // Make db and SSE connections accessible to routers
  app.use((req, res, next) => {
    req.db = getDb();
    req.sse = sseConnections;
    next();
  });

  // JWT Authentication middleware
  app.use((req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1]; // Bearer TOKEN
    if (token) {
      try {
        const decoded = verifyToken(token);
        const Users = getDb().getCollection("users");
        const Accounts = getDb().getCollection("accounts");

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

  // Session middleware
  app.use((req, res, next) => {
    req.session = req.headers["session"];

    next();
  });

  // Use routers
  app.use("/auth", authRouter);
  app.use("/users", usersAccountsRouter);
  app.use("/tasks", tasksRouter);

  // Ping route
  app.get("/ping", async (req, res, next) => {
    res.send("pong");
  });

  // SSE route
  const sseConnections = { users: {}, accounts: {} };
  app.get("/events", asyncWrapper(async (req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    if (req.user) {
        if (req.user.id in sseConnections.users) {
            if (req.session in sseConnections.users[req.user.id]) {
                sseConnections.users[req.user.id][req.session].end();
            }
            sseConnections.users[req.user.id][req.session] = res;    
        }
        else {
            sseConnections.users[req.user.id] = { [req.session]: res };
        }
    }
    else {
        throw new APIError('There must be a user!');
    }

    if (req.account) {
        if (req.account.id in sseConnections.accounts) {
            if (req.session in sseConnections.accounts[req.account.id]) {
                throw new APIError('There already exists an open SSE connection for this session!');
            }
            else {
                sseConnections.accounts[req.account.id][req.session] = res;
            }
        }
        else {
            sseConnections.accounts[req.account.id] = { [req.session]: res };
        }
    }

    // Set up heartbeat
    const heartbeatTimer = setInterval(() => {
        sendSSE(res, 'heartbeat', {});
    }, 30000);

    req.on("close", asyncWrapper(async () => {
        clearInterval(heartbeatTimer);
      res.end();
      delete sseConnections.users[req.user.id][req.session];
      if (req.account) {
        delete sseConnections.accounts[req.account.id][req.session];
      }
    }));
  }));

  // Test routes
  app.get("/test", async (req, res, next) => {
    res.json();
  });

  // Error handling with APIError
  app.use(function (err, req, res, next) {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);

    return res.status(statusCode).json({
      success: false,
      notification: { message: err.message },
      ...err.info,
    });
  });

  // Start the server
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  // Handle server shutdown
  process.on("SIGINT", () => {
    console.log("Server is shutting down...");
    getDb().close(() => {
      console.log("Database closed.");
      server.close(() => {
        console.log("Server closed.");
        process.exit(0);
      });
    });
  });
}

module.exports = app;
