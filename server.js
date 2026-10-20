/**
 * VR Music - Optional Node.js & Express REST API Server
 * 
 * To run this server:
 * 1. Install dependencies: npm install express body-parser jsonwebtoken
 * 2. Run: node server.js
 * 3. Open http://localhost:3000 in your browser.
 */

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'vrmusic_super_secret_jwt_key_2026';
const DB_FILE = path.join(__dirname, 'db.json');

app.use(bodyParser.json());
// Serve static client files directly from the current directory
app.use(express.static(__dirname));

// Simple database initialize
let db = {
    users: [
        { email: 'admin@music.com', passwordHash: 'admin123', name: 'System Admin', role: 'admin', subscription: 'Premium Plus', badges: ['Architect'], history: [] },
        { email: 'user@music.com', passwordHash: 'user123', name: 'Guest User', role: 'user', subscription: 'Premium', badges: ['Explorer'], history: [] }
    ],
    songs: [],
    comments: [],
    likes: {},
    playlists: []
};

// Seed load db
if (fs.existsSync(DB_FILE)) {
    try {
        db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        console.log('Local JSON Database loaded successfully.');
    } catch (e) {
        console.error('Failed to load JSON database, initializing default values.', e);
    }
} else {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 4));
}

function saveDB() {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 4));
}

// HEALTH CHECK & ENVIRONMENT DETECT
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'VR Music API Server is online.' });
});

// AUTH API
app.post('/api/auth/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ success: false, error: 'Email is already registered' });
    }

    const newUser = {
        email: email,
        passwordHash: password, // simple store in demo
        name: name,
        role: 'user',
        subscription: 'Free tier',
        badges: ['New Member'],
        history: []
    };

    db.users.push(newUser);
    saveDB();
    res.json({ success: true, message: 'Signup successful' });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Missing parameters' });
    }

    const found = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password);
    if (found) {
        const token = jwt.sign({ email: found.email, role: found.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token, user: { email: found.email, name: found.name, role: found.role, subscription: found.subscription } });
    } else {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
});

// MUSIC DATA ENDPOINTS
app.get('/api/songs', (req, res) => {
    res.json(db.songs);
});

app.post('/api/songs', (req, res) => {
    // Basic JWT verification simulation
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, error: 'Unauthorized' });

    try {
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, JWT_SECRET);
        
        if (payload.role !== 'admin' && payload.role !== 'artist') {
            return res.status(403).json({ success: false, error: 'Forbidden: Admin access only.' });
        }

        const { title, artistId, album, duration, file, img, genre } = req.body;
        const newSong = {
            id: 'custom_' + Date.now(),
            artistId,
            title,
            album,
            duration,
            file,
            img,
            genre,
            plays: 0
        };

        db.songs.push(newSong);
        saveDB();
        res.json({ success: true, song: newSong });
    } catch (e) {
        res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
});

// COMMENTS ENDPOINTS
app.get('/api/comments/:targetId', (req, res) => {
    const list = db.comments.filter(c => c.targetId === req.params.targetId);
    res.json(list);
});

app.post('/api/comments', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, error: 'Unauthorized' });

    try {
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, JWT_SECRET);

        const { targetId, text } = req.body;
        const newComment = {
            id: 'com_' + Date.now(),
            targetId,
            user: payload.email,
            text,
            date: new Date().toISOString().split('T')[0]
        };

        db.comments.push(newComment);
        saveDB();
        res.json({ success: true, comment: newComment });
    } catch (e) {
        res.status(401).json({ success: false, error: 'Unauthorized token' });
    }
});

// Start Express Listener
app.listen(PORT, () => {
    console.log(`============================================================`);
    console.log(`VR Music Premium Server is running at: http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to terminate`);
    console.log(`============================================================`);
});
