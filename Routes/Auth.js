const express = require('express');
const router = express.Router();
const User = require('../Models/UserSchema')
const errorHandler = require('../Middlewares/errorMiddleware');
const authTokenHandler = require('../Middlewares/checkAuthToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');



function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}

router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(409).json(createResponse(false, 'Email already exists'));
        }
        const newUser = new User({
            name,
            password,
            email,
        });

        await newUser.save(); // Await the save operation
        res.status(201).json(createResponse(true, 'User registered successfully'));

    }
    catch (err) {
        next(err);
    }
})
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json(createResponse(false, 'Invalid credentials'));
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json(createResponse(false, 'Invalid credentials'));
        }

        const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '50m' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '120m' });
        res.cookie('authToken', authToken, { httpOnly: true });
        res.cookie('refreshToken', refreshToken, { httpOnly: true });
        res.status(200).json(createResponse(true, 'Login successful', {
            authToken,
            refreshToken
        }));
    }
    catch (err) {
        next(err);
    }
})
router.get('/checklogin', authTokenHandler, async (req, res) => {
    res.json({
        ok: true,
        message: 'User authenticated successfully',
        data: {
            userId: req.userId
        }
    })
})
router.get('/logout', async (req, res) => {
    res.clearCookie('authToken');
    res.clearCookie('refreshToken');
    res.json({
        ok: true,
        message: 'User logged out successfully'
    })
})

router.get('/getcricketranking', async (req, res) => {

    const data = {
        tournament : "ICC 2023 Championship",
        ranks : [
            {
                country : "India",
                points : 12345,
                wins : 4,
                losses : 1,
                total : 5,
                flag : 'data:image/png;base64,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'
            },
            {
                country : "Australia",
                points : 2345,
                wins : 3,
                losses : 2,
                total : 5,
                flag : 'data:image/png;base64,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'
            }
        ]
    }


    res.json({
        ok: true,
        message: 'Cricket Ranking',
        data: data
    })
})


router.use(errorHandler)

module.exports = router;
