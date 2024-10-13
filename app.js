const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./gift-list.db');

// Create tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS gift_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        password TEXT NOT NULL
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

// Add a new gift list
app.post('/gift-lists', (req, res) => {
    const { name, password } = req.body;
    db.run('INSERT INTO gift_lists (name, password) VALUES (?, ?)', [name, password], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// Verify password for modifying a list
app.post('/gift-lists/:id/verify-password', (req, res) => {
    const id = req.params.id;
    const { password } = req.body;
    db.get('SELECT * FROM gift_lists WHERE id = ? AND password = ?', [id, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    });
});

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
    db.run('UPDATE gifts SET reserved = 1, reservedBy = ? WHERE id = ?', [reservedBy, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
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
    db.run('INSERT INTO gifts (name, listId) VALUES (?, ?)', [name, listId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// Remove a gift
app.delete('/gifts/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM gifts WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// Start the server on port 3000 and bind to all network interfaces
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});