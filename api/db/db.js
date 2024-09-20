const loki = require('lokijs');
const { v4: uuid } = require('uuid');
const bcrypt = require('bcrypt');

const dbPath = process.env.DB_PATH || './db/db.db';

let db;

async function initDatabase(callback) {
    const dbFile = dbPath;
    db = new loki(dbFile, {
        autoload: true,
        autoloadCallback: databaseInitialized,
        autosave: true, 
        autosaveInterval: 4000 // save every 4 seconds
    });

    async function databaseInitialized() {
        let users = db.getCollection('users');
        let accounts = db.getCollection('accounts');
        let tasks = db.getCollection('tasks');
        
        if (users === null) {
            users = db.addCollection('users', { indices: ['id', 'email'] });
        }
        if (accounts === null) {
            accounts = db.addCollection('accounts', { indices: ['id'] });
        }
        if (tasks === null) {
            tasks = db.addCollection('tasks', { indices: ['id'] });
        }
        
        // If the collections are empty, load and process initial data
        if (users.count() === 0 && accounts.count() === 0 && tasks.count() === 0) {
            const initialData = require('./db.init.js');
            await loadInitialData(initialData);
        }
        
        console.log("Database initialized.");
        if (callback) callback();
    }
}

async function loadInitialData(data) {
    const users = db.getCollection('users');
    const accounts = db.getCollection('accounts');
    const tasks = db.getCollection('tasks');
    
    // Process and insert accounts first
    const accountIds = data.accounts.map(account => {
        const accountObj = {
            id: uuid(),
            description: account.description
        };
        accounts.insert(accountObj);
        return accountObj.id;
    });
    
    // Process and insert users
    for (const user of data.users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const userObj = {
            id: uuid(),
            email: user.email,
            name: user.name,
            passwordHash: hashedPassword,
            accounts: user.accountIndices.map(index => accountIds[index])
        };
        users.insert(userObj);
    }
    
    // Process and insert tasks
    data.tasks.forEach(task => {
        const taskObj = {
            id: uuid(),
            title: task.title,
            tags: task.tags,
            status: task.status,
            owner: accountIds[task.ownerIndex],
            dueDate: new Date(task.dueDate),
            accessAccounts: task.accessIndices.map(index => accountIds[index])
        };
        tasks.insert(taskObj);
    });
    
    console.log("Initial data loaded.");
}

function getDb() {
    return db;
}

function getDbCollections() {
    const collections = {
        'Users': 'users',
        'Accounts': 'accounts',
        'Tasks': 'tasks'
    }
    
    return Object.fromEntries(Object.entries(collections).map(([key, value]) => [key, db.getCollection(value)]));
}

function populate(sourceCollection, sourceDoc, targetCollection, foreignKey, asProperty) {
    if (Array.isArray(sourceDoc)) {
      return sourceDoc.map(doc => populate(sourceCollection, doc, targetCollection, foreignKey, asProperty));
    }
    
    const populatedDoc = { ...sourceDoc };
    
    if (Array.isArray(sourceDoc[foreignKey])) {
      // Handle array of references
      populatedDoc[asProperty] = sourceDoc[foreignKey].map(id => 
        targetCollection.findOne({ id: id })
      ).filter(doc => doc !== null);
    } else {
      // Handle single reference
      const targetDoc = targetCollection.findOne({ id: sourceDoc[foreignKey] });
      if (targetDoc) {
        populatedDoc[asProperty] = targetDoc;
      }
    }
    
    return populatedDoc;
}

module.exports = { initDatabase, getDb, getDbCollections, populate };