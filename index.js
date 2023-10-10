const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 8000;
const authRoutes = require('./Routes/Auth');

require('dotenv').config();
require('./db')

const cookieParser = require('cookie-parser');
app.use(bodyParser.json());

const allowedOrigins = ['http://localhost:3000']; 

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true, // Allow credentials
    })
);

app.use(cookieParser());
app.get('/', (req, res) => {
    res.json({ message: 'The API is working' });
});

app.use('/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


