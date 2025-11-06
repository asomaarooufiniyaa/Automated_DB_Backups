const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;

// MongoDB connection URI and DB name
const MONGO_URI = 'mongodb://mongo:27017';
const DB_NAME = 'automated_db_backups';

// Parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
let db;
MongoClient.connect(MONGO_URI, { useUnifiedTopology: true })
    .then(client => {
        db = client.db(DB_NAME);
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
    });

// Helper for server-side escaping used in template
function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Main route with form and list of saved entries
app.get('/', async (req, res) => {
    let entries = [];
    if (db) {
        try {
            entries = await db.collection('users').find().sort({ _id: -1 }).toArray();
        } catch (err) {
            console.error('Failed to fetch entries:', err);
        }
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Beautiful Themed Website</title>
            <link href="https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap" rel="stylesheet">
            <style>
                body {
                    margin: 0;
                    font-family: 'Roboto', sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    color: #fff;
                }
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background: rgba(255,255,255,0.1);
                    border-radius: 16px;
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                    padding: 30px;
                    text-align: center;
                }
                h1 { font-size: 2rem; margin-bottom: 8px; font-weight: 700; }
                p { font-size: 1rem; margin-bottom: 20px; }
                form { display: flex; flex-direction: column; gap: 10px; align-items: center; }
                input[type="text"], input[type="number"] {
                    padding: 10px 12px;
                    border-radius: 8px;
                    border: none;
                    width: 100%;
                    max-width: 360px;
                    font-size: 1rem;
                }
                .btn {
                    background: #fff;
                    color: #764ba2;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.2s, color 0.2s;
                }
                .btn:hover {
                    background: #764ba2;
                    color: #fff;
                }
                .entries {
                    margin-top: 24px;
                    text-align: left;
                    max-height: 200px;
                    overflow: auto;
                    background: rgba(0,0,0,0.1);
                    padding: 12px;
                    border-radius: 8px;
                }
                .entry { padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
                @media (max-width: 700px) {
                    .container { padding: 20px; }
                    h1 { font-size: 1.6rem; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Enter Your Data</h1>
                <p>Provide your name and age and click submit.</p>

                <!-- Form to submit new entry -->
                <form method="POST" action="/submit">
                    <input type="text" name="name" placeholder="My Name" required />
                    <input type="number" name="age" placeholder="My Age" min="0" required />
                    <button class="btn" type="submit">Submit</button>
                </form>

                <!-- Form to delete all entries -->
                <form method="POST" action="/delete-all" onsubmit="return confirm('Are you sure you want to delete all entries?');">
                    <button class="btn" type="submit" style="background-color:#e74c3c;color:#fff;margin-top:10px;">
                        Delete All Entries
                    </button>
                </form>

                <div class="entries">
                    <strong>Saved entries:</strong>
                    ${entries.length === 0 ? '<div>No entries yet.</div>' : entries.map(e => `
                        <div class="entry">
                            <div><strong>Name:</strong> ${escapeHtml(e.name)}</div>
                            <div><strong>Age:</strong> ${e.age}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </body>
        </html>
    `);
});

// Handle form submission
app.post('/submit', async (req, res) => {
    const { name, age } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).send('Invalid name');
    }
    const ageNum = Number(age);
    if (!Number.isFinite(ageNum) || ageNum < 0) {
        return res.status(400).send('Invalid age');
    }

    if (!db) return res.status(500).send('Not connected to database');

    try {
        await db.collection('users').insertOne({ name: name.trim(), age: ageNum, createdAt: new Date() });
        res.redirect('/');
    } catch (err) {
        console.error('Insert failed:', err);
        res.status(500).send('Failed to save entry');
    }
});

// Route to delete all entries
app.post('/delete-all', async (req, res) => {
    if (!db) return res.status(500).send('Not connected to database');

    try {
        await db.collection('users').deleteMany({});
        res.redirect('/');
    } catch (err) {
        console.error('Failed to delete entries:', err);
        res.status(500).send('Failed to delete entries');
    }
});

// Optional MongoDB status route
app.get('/db-status', async (req, res) => {
    if (!db) return res.status(500).json({ status: 'error', message: 'Not connected to MongoDB' });
    try {
        const collections = await db.listCollections().toArray();
        res.json({ status: 'ok', collections: collections.map(c => c.name) });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
