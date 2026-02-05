const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Review, User, initDb, sequelize } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'v4l0r4c1on_s3cr3t_k3y_dev'; // Use environment variable in production

app.use(cors());
app.use(bodyParser.json());

// Init Database
initDb();

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// POST /api/login - Authenticate user
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '8h' });
        res.json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/reviews - Save a new survey response (Public)
app.post('/api/reviews', async (req, res) => {
    try {
        console.log('--- SURVEY SUBMISSION START ---');
        console.log('Payload Received:', JSON.stringify(req.body, null, 2));

        const { q1, q2, q3, q4, comment } = req.body;

        // Basic validation
        if (q1 === undefined || q2 === undefined || q3 === undefined || q4 === undefined) {
            console.error('Validation Failed: Missing required fields');
            return res.status(400).json({ error: 'Faltan respuestas requeridas' });
        }

        const review = await Review.create({ q1, q2, q3, q4, comment });
        console.log('Review created successfully:', review.id);
        console.log('--- SURVEY SUBMISSION END ---');
        res.status(201).json(review);
    } catch (error) {
        console.error('CRITICAL ERROR in POST /api/reviews:', error);
        res.status(400).json({ error: error.message });
    }
});

// GET /api/reviews - List all responses (Protected)
app.get('/api/reviews', authenticateToken, async (req, res) => {
    try {
        const reviews = await Review.findAll({
            order: [['createdAt', 'DESC']],
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/reviews/:id - Delete a review by ID (Protected)
app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        await review.destroy();
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/stats - Get aggregated statistics (Protected)
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const total = await Review.count();

        const countTrue = async (field) => {
            return await Review.count({ where: { [field]: true } });
        };

        const stats = {
            total,
            q1: await countTrue('q1'),
            q2: await countTrue('q2'),
            q3: await countTrue('q3'),
            q4: await countTrue('q4'),
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
