// Import required modules
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

// Initialize the Express app
const app = express();

// Initialize the SQLite database
const db = new sqlite3.Database('./gift-list.db'); // In-memory database for testing

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

// Create the gifts table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS gifts (
        id INTEGER PRIMARY KEY,
        name TEXT,
        reserved INTEGER DEFAULT 0,
        reservedBy TEXT
    )`);
});

// Route to get the list of all gifts
app.get('/gifts', (req, res) => {
    db.all("SELECT * FROM gifts", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Route to add a new gift
app.post('/gifts', (req, res) => {
    const name = req.body.name;
    db.run("INSERT INTO gifts (name) VALUES (?)", [name], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, name });
    });
});

// Route to reserve a gift
app.post('/gifts/:id/reserve', (req, res) => {
    const id = req.params.id;
    const reservedBy = req.body.reservedBy;
    db.run("UPDATE gifts SET reserved = 1, reservedBy = ? WHERE id = ? AND reserved = 0", [reservedBy, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Gift already reserved or does not exist.' });
        }
        res.json({ success: true });
    });
});

// Route to unreserve a gift
app.post('/gifts/:id/unreserve', (req, res) => {
    const id = req.params.id;
    const reservedBy = req.body.reservedBy;
    db.get("SELECT reservedBy FROM gifts WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Gift does not exist.' });
        }
        if (row.reservedBy !== reservedBy) {
            return res.status(403).json({ error: 'This gift was reserved by someone else, you cannot unreserve it.' });
        }
        db.run("UPDATE gifts SET reserved = 0, reservedBy = NULL WHERE id = ?", [id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
        });
    });
});

// Route to remove a gift
app.delete('/gifts/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM gifts WHERE id = ?", [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Gift not found.' });
        }
        res.json({ success: true });
    });
});

// Start the server on port 3000 and bind to all network interfaces
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});