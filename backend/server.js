const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

let bookmarks = [
    {
        id: uuidv4(),
        url: 'https://developer.mozilla.org',
        title: 'MDN Web Docs',
        description: 'The MDN Web Docs site provides information about Open Web technologies including HTML, CSS, and APIs for both Web sites and progressive web apps.',
        tags: ['documentation', 'javascript', 'web'],
        createdAt: new Date('2025-12-01T10:00:00Z').toISOString(),
    },
    {
        id: uuidv4(),
        url: 'https://react.dev',
        title: 'React',
        description: 'The library for web and native user interfaces. React lets you build user interfaces out of individual pieces called components.',
        tags: ['react', 'javascript', 'frontend'],
        createdAt: new Date('2025-12-05T14:30:00Z').toISOString(),
    },
    {
        id: uuidv4(),
        url: 'https://expressjs.com',
        title: 'Express.js',
        description: 'Fast, unopinionated, minimalist web framework for Node.js. Express provides a thin layer of fundamental web application features.',
        tags: ['nodejs', 'backend', 'javascript'],
        createdAt: new Date('2025-12-10T09:15:00Z').toISOString(),
    },
    {
        id: uuidv4(),
        url: 'https://github.com',
        title: 'GitHub',
        description: 'GitHub is where over 100 million developers shape the future of software together. Contribute to the open source community and manage Git repositories.',
        tags: ['git', 'development'],
        createdAt: new Date('2025-12-15T16:00:00Z').toISOString(),
    },
    {
        id: uuidv4(),
        url: 'https://stackoverflow.com',
        title: 'Stack Overflow',
        description: 'Stack Overflow is the largest, most trusted online community for developers to learn, share their programming knowledge, and build their careers.',
        tags: ['community', 'development', 'learning'],
        createdAt: new Date('2025-12-20T11:45:00Z').toISOString(),
    },
];

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function validateBookmarkFields(body, isUpdate = false) {
    const errors = [];

    if (!isUpdate || body.url !== undefined) {
        if (!isUpdate && (!body.url || typeof body.url !== 'string' || body.url.trim() === '')) {
            errors.push('url is required');
        } else if (body.url !== undefined && !isValidUrl(body.url)) {
            errors.push('url must be a valid URL (http or https)');
        }
    }

    if (!isUpdate || body.title !== undefined) {
        if (!isUpdate && (!body.title || typeof body.title !== 'string' || body.title.trim() === '')) {
            errors.push('title is required');
        } else if (body.title !== undefined) {
            if (typeof body.title !== 'string') {
                errors.push('title must be a string');
            } else if (body.title.length > 200) {
                errors.push('title must be 200 characters or less');
            }
        }
    }

    if (body.description !== undefined) {
        if (typeof body.description !== 'string') {
            errors.push('description must be a string');
        } else if (body.description.length > 500) {
            errors.push('description must be 500 characters or less');
        }
    }

    if (body.tags !== undefined) {
        if (!Array.isArray(body.tags)) {
            errors.push('tags must be an array of strings');
        } else if (body.tags.length > 5) {
            errors.push('maximum 5 tags allowed');
        } else {
            const invalidTag = body.tags.find((t) => typeof t !== 'string');
            if (invalidTag !== undefined) {
                errors.push('each tag must be a string');
            }
        }
    }

    return errors;
}

function normalizeTags(tags) {
    if (!tags || !Array.isArray(tags)) return [];
    return tags.map((t) => t.toLowerCase().trim()).filter((t) => t.length > 0);
}

app.get('/bookmarks', (req, res) => {
    const { tag } = req.query;
    let result = bookmarks;

    if (tag) {
        const filterTag = tag.toLowerCase();
        result = bookmarks.filter((b) => b.tags.includes(filterTag));
    }

    res.json(result);
});

app.post('/bookmarks', (req, res) => {
    const errors = validateBookmarkFields(req.body, false);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join('. ') });
    }

    const bookmark = {
        id: uuidv4(),
        url: req.body.url.trim(),
        title: req.body.title.trim(),
        description: req.body.description ? req.body.description.trim() : '',
        tags: normalizeTags(req.body.tags),
        createdAt: new Date().toISOString(),
    };

    bookmarks.push(bookmark);
    res.status(201).json(bookmark);
});

app.put('/bookmarks/:id', (req, res) => {
    const index = bookmarks.findIndex((b) => b.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Bookmark not found' });
    }

    const errors = validateBookmarkFields(req.body, true);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join('. ') });
    }

    const existing = bookmarks[index];
    const updated = {
        ...existing,
        url: req.body.url !== undefined ? req.body.url.trim() : existing.url,
        title: req.body.title !== undefined ? req.body.title.trim() : existing.title,
        description: req.body.description !== undefined ? req.body.description.trim() : existing.description,
        tags: req.body.tags !== undefined ? normalizeTags(req.body.tags) : existing.tags,
    };

    bookmarks[index] = updated;
    res.json(updated);
});

app.delete('/bookmarks/:id', (req, res) => {
    const index = bookmarks.findIndex((b) => b.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Bookmark not found' });
    }

    bookmarks.splice(index, 1);
    res.status(204).send();
});

function fetchPageTitle(targetUrl) {
    return new Promise((resolve) => {
        const client = targetUrl.startsWith('https') ? https : http;
        const request = client.get(targetUrl, { timeout: 5000 }, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                resolve(fetchPageTitle(response.headers.location));
                return;
            }
            let html = '';
            response.setEncoding('utf-8');
            response.on('data', (chunk) => {
                html += chunk;
                if (html.length > 50000) response.destroy();
            });
            response.on('end', () => {
                const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                resolve(match ? match[1].trim() : '');
            });
            response.on('error', () => resolve(''));
        });
        request.on('error', () => resolve(''));
        request.on('timeout', () => { request.destroy(); resolve(''); });
    });
}

app.get('/metadata', async (req, res) => {
    const { url } = req.query;
    if (!url || !isValidUrl(url)) {
        return res.status(400).json({ error: 'A valid URL is required' });
    }
    try {
        const title = await fetchPageTitle(url);
        res.json({ title: title || '' });
    } catch {
        res.json({ title: '' });
    }
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

const clientPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(clientPath));
app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
    });
}

module.exports = { app, bookmarks };
