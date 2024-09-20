// routes/tasks.js
const express = require("express");
const router = express.Router();
const { v4: uuid } = require("uuid");
const { populate, getDbCollections } = require("../db/db");
const _ = require("lodash");
const { sendSSE } = require("../utils/utils");

router.get("/", (req, res) => {
  const tasks = req.db.getCollection("tasks");
  res.json(tasks.find());
});

router.post("/", (req, res) => {
  const tasks = req.db.getCollection("tasks");
  const accounts = req.db.getCollection("accounts");
  const { title, tags, status, ownerId, dueDate, accessAccountIds } = req.body;

  const owner = accounts.findOne({ id: ownerId });
  if (!owner) {
    return res.status(400).json({ error: "Owner account not found" });
  }

  const newTask = {
    id: uuid(),
    title,
    tags,
    status,
    ownerId,
    dueDate: new Date(dueDate),
    accessAccountIds,
  };

  tasks.insert(newTask);
  res.status(201).json(newTask);
});

router.put("/:id", async (req, res, next) => {
  const { Tasks, Accounts } = getDbCollections();

  let task = Tasks.findOne({ id: req.params.id });
  _.assign(task, req.body);
  Tasks.update(task);

  // Notify all affected sessions (except the current one)
  await Promise.all(
    Object.entries(req.sse.accounts).map(async ([account, sessions]) => {
      if (task.accessAccounts.includes(account)) {
        const notification = {
          title: `Task ${task.title} updated`,
          body: JSON.stringify(req.body),
          read: false
        };
        await Promise.all(
          Object.entries(sessions).map(([session, res]) => {
            if (session != req.session) {
                sendSSE(res, "notification", notification);
            }
          })
        );
      }
    })
  );

  task = populate(Tasks, task, Accounts, "accessAccounts", "accessAccounts");
  task = populate(Tasks, task, Accounts, "owner", "owner");

  return res.json({ task });
});

// Add more routes for task management

module.exports = router;
