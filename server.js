const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;
const MEMES_FILE = path.join(__dirname, 'memes.json');

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Initialize memes file if it doesn't exist
async function initMemesFile() {
    try {
        await fs.access(MEMES_FILE);
    } catch {
        await fs.writeFile(MEMES_FILE, JSON.stringify([]));
    }
}

// Get all memes
app.get('/api/memes', async (req, res) => {
    try {
        const data = await fs.readFile(MEMES_FILE, 'utf8');
        const memes = JSON.parse(data);
        res.json(memes);
    } catch (err) {
        console.error('Error reading memes:', err);
        res.json([]);
    }
});

// Post a new meme
app.post('/api/memes', async (req, res) => {
    try {
        const { title, imageUrl } = req.body;

        if (!title || !imageUrl) {
            return res.status(400).json({ error: 'Title and imageUrl are required' });
        }

        const data = await fs.readFile(MEMES_FILE, 'utf8');
        const memes = JSON.parse(data);

        const newMeme = {
            id: Date.now(),
            title,
            imageUrl,
            timestamp: new Date().toISOString()
        };

        memes.push(newMeme);
        await fs.writeFile(MEMES_FILE, JSON.stringify(memes, null, 2));

        res.status(201).json(newMeme);
    } catch (err) {
        console.error('Error posting meme:', err);
        res.status(500).json({ error: 'Failed to post meme' });
    }
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
initMemesFile().then(() => {
    app.listen(PORT, () => {
        console.log(`🔥 MemeZone server running at http://localhost:${PORT}`);
    });
});
