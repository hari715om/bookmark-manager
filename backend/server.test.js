const request = require('supertest');

let app, bookmarks;

beforeEach(() => {
    delete require.cache[require.resolve('./server')];
    const server = require('./server');
    app = server.app;
    bookmarks = server.bookmarks;
});

describe('POST /bookmarks', () => {
    it('should create a new bookmark and return 201', async () => {
        const newBookmark = {
            url: 'https://vitest.dev',
            title: 'Vitest',
            description: 'Next generation testing framework',
            tags: ['testing', 'javascript'],
        };

        const res = await request(app).post('/bookmarks').send(newBookmark);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.url).toBe('https://vitest.dev');
        expect(res.body.title).toBe('Vitest');
        expect(res.body.description).toBe('Next generation testing framework');
        expect(res.body.tags).toEqual(['testing', 'javascript']);
        expect(res.body).toHaveProperty('createdAt');
    });

    it('should return 400 when url is missing', async () => {
        const res = await request(app).post('/bookmarks').send({ title: 'No URL' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should return 400 when url is invalid', async () => {
        const res = await request(app).post('/bookmarks').send({
            url: 'not-a-url',
            title: 'Bad URL',
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('valid URL');
    });

    it('should return 400 when title is missing', async () => {
        const res = await request(app).post('/bookmarks').send({
            url: 'https://example.com',
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('title');
    });

    it('should return 400 when title exceeds 200 characters', async () => {
        const res = await request(app).post('/bookmarks').send({
            url: 'https://example.com',
            title: 'a'.repeat(201),
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('200');
    });

    it('should return 400 when more than 5 tags are provided', async () => {
        const res = await request(app).post('/bookmarks').send({
            url: 'https://example.com',
            title: 'Too Many Tags',
            tags: ['a', 'b', 'c', 'd', 'e', 'f'],
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('5');
    });

    it('should normalize tags to lowercase', async () => {
        const res = await request(app).post('/bookmarks').send({
            url: 'https://example.com',
            title: 'Tag Test',
            tags: ['JavaScript', 'REACT'],
        });

        expect(res.status).toBe(201);
        expect(res.body.tags).toEqual(['javascript', 'react']);
    });
});

describe('DELETE /bookmarks/:id', () => {
    it('should delete an existing bookmark and return 204', async () => {
        const targetId = bookmarks[0].id;

        const res = await request(app).delete(`/bookmarks/${targetId}`);

        expect(res.status).toBe(204);
        expect(bookmarks.find((b) => b.id === targetId)).toBeUndefined();
    });

    it('should return 404 when bookmark does not exist', async () => {
        const res = await request(app).delete('/bookmarks/nonexistent-id');

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toContain('not found');
    });
});

describe('GET /bookmarks', () => {
    it('should return all seed bookmarks', async () => {
        const res = await request(app).get('/bookmarks');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(5);
    });

    it('should filter bookmarks by tag', async () => {
        const res = await request(app).get('/bookmarks?tag=javascript');

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        res.body.forEach((b) => {
            expect(b.tags).toContain('javascript');
        });
    });
});

describe('PUT /bookmarks/:id', () => {
    it('should update an existing bookmark', async () => {
        const targetId = bookmarks[0].id;

        const res = await request(app).put(`/bookmarks/${targetId}`).send({
            title: 'Updated Title',
        });

        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Updated Title');
        expect(res.body.createdAt).toBe(bookmarks[0].createdAt);
    });

    it('should return 404 for non-existent bookmark', async () => {
        const res = await request(app).put('/bookmarks/fake-id').send({
            title: 'Nope',
        });

        expect(res.status).toBe(404);
    });
});
