const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt'); // Add this at the top

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use(session({
    secret: 'your_secret_key', // Replace with a secure secret key
    resave: false,
    saveUninitialized: false
}));

// Set the default page to the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Initialize login database
const loginDb = new sqlite3.Database('./login.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the login database.');
});

loginDb.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)`);

// Update the login handler to use hashed password comparison
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    loginDb.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Internal server error');
        }
        
        if (!user) {
            return res.status(401).send('Username does not exist');
        }

        try {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                req.session.loggedin = true;
                req.session.username = username;
                return res.redirect('/select-list');
            } else {
                return res.status(401).send('Incorrect password');
            }
        } catch (err) {
            console.error(err);
            return res.status(500).send('Internal server error');
        }
    });
});

// Update the signup handler to handle both JSON and form data
app.post('/signup', async (req, res) => {
    try {
        const username = req.body.username?.trim();
        const password = req.body.password?.trim();
        
        console.log('Signup attempt:', { username }); // for debugging
        
        // Input validation
        if (!username || !password) {
            return res.status(400).send('Username and password are required');
        }
        
        if (username.length < 3) {
            return res.status(400).send('Username must be at least 3 characters long');
        }
        
        if (password.length < 6) {
            return res.status(400).send('Password must be at least 6 characters long');
        }

        // Check if username exists
        const user = await new Promise((resolve, reject) => {
            loginDb.get('SELECT username FROM users WHERE username = ?', [username], (err, row) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                }
                resolve(row);
            });
        });

        if (user) {
            return res.status(400).send('Username already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        await new Promise((resolve, reject) => {
            loginDb.run('INSERT INTO users (username, password) VALUES (?, ?)', 
                [username, hashedPassword], 
                function(err) {
                    if (err) {
                        console.error('Insert error:', err);
                        reject(err);
                    }
                    resolve(this);
                }
            );
        });

        // Set session
        req.session.loggedin = true;
        req.session.username = username;
        
        console.log('Account created successfully:', { username }); // for debugging
        
        return res.redirect('/select-list');

    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).send('An error occurred during signup. Please try again.');
    }
});

// Route for getting the username
app.get('/username', (req, res) => {
    if (req.session.loggedin) {
        res.json({ username: req.session.username });
    } else {
        res.json({ username: null });
    }
});

const db = new sqlite3.Database('./gift-list.db');

// Create tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS gift_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        creator TEXT NOT NULL,
        disableReservations BOOLEAN DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS gifts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        reserved BOOLEAN DEFAULT 0,
        reservedBy TEXT,
        listId INTEGER,
        FOREIGN KEY (listId) REFERENCES gift_lists(id)
    )`);
});

// Fetch all gift lists
app.get('/gift-lists', (req, res) => {
    db.all('SELECT * FROM gift_lists', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Fetch a specific gift list
app.get('/gift-lists/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM gift_lists WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
});

// Add a new gift list
app.post('/gift-lists', (req, res) => {
    const { name } = req.body;
    
    if (!req.session.loggedin || !req.session.username) {
        return res.status(401).json({ error: 'User must be logged in' });
    }
    
    db.run('INSERT INTO gift_lists (name, creator) VALUES (?, ?)', 
        [name, req.session.username], 
        function(err) {
            if (err) {
                console.error('Error adding gift list:', err);
                res.status(500).send({ error: 'Internal Server Error' });
            } else {
                res.status(201).send({ id: this.lastID });
            }
        }
    );
});

// Remove the verify-password endpoint (delete this entire block)
// app.post('/gift-lists/:id/verify-password', (req, res) => { ... });

// Fetch gifts for a specific list
app.get('/gifts', (req, res) => {
    const listId = req.query.listId;
    db.all('SELECT * FROM gifts WHERE listId = ?', [listId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Reserve a gift
app.post('/gifts/:id/reserve', (req, res) => {
    const id = req.params.id;
    const reservedBy = req.body.reservedBy;
    db.get('SELECT disableReservations FROM gift_lists WHERE id = (SELECT listId FROM gifts WHERE id = ?)', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row.disableReservations) {
            return res.status(400).json({ error: 'Reservations are disabled for this list.' });
        }
        db.run('UPDATE gifts SET reserved = 1, reservedBy = ? WHERE id = ?', [reservedBy, id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
        });
    });
});

// Unreserve a gift
app.post('/gifts/:id/unreserve', (req, res) => {
    const id = req.params.id;
    db.run('UPDATE gifts SET reserved = 0, reservedBy = NULL WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// Add a new gift
app.post('/gifts', (req, res) => {
    const { name, listId } = req.body;
    
    // Check if user is logged in and is the creator of the list
    db.get('SELECT creator FROM gift_lists WHERE id = ?', [listId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'List not found' });
        }
        if (!req.session.loggedin || row.creator !== req.session.username) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        db.run('INSERT INTO gifts (name, listId) VALUES (?, ?)', [name, listId], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, id: this.lastID });
        });
    });
});

// Remove a gift
app.delete('/gifts/:id', (req, res) => {
    const id = req.params.id;
    
    // Check if user is logged in and is the creator of the list
    db.get('SELECT gift_lists.creator FROM gift_lists JOIN gifts ON gift_lists.id = gifts.listId WHERE gifts.id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Gift not found' });
        }
        if (!req.session.loggedin || row.creator !== req.session.username) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        db.run('DELETE FROM gifts WHERE id = ?', [id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
        });
    });
});

// Add route for updating disable reservations setting
app.post('/disable-reservations', (req, res) => {
    const { listId, disableReservations } = req.body;
    
    // Check if user is logged in and is the creator of the list
    db.get('SELECT creator FROM gift_lists WHERE id = ?', [listId], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'List not found' });
        }
        if (!req.session.loggedin || row.creator !== req.session.username) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        db.run('UPDATE gift_lists SET disableReservations = ? WHERE id = ?', 
            [disableReservations ? 1 : 0, listId], 
            function(err) {
                if (err) {
                    console.error('Database error:', err.message);
                    return res.status(500).json({ error: err.message });
                }
                res.json({ success: true });
            }
        );
    });
});

// Route for accessing the select list
app.get('/select-list', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public/select-list.html'));
    } else {
        res.redirect('/');
    }
});

// Route for accessing a specific list directly
app.get('/list/:id', (req, res) => {
    res.sendFile(__dirname + '/public/list.html');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});