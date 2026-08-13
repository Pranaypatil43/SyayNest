const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../../models/user.js');
const wrapAsync = require('../../utils/wrapAsync.js');

// GET current user (session check)
router.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({ user: { _id: req.user._id, username: req.user.username, email: req.user.email } });
    }
    res.json({ user: null });
});

// POST signup
router.post('/signup', wrapAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            res.status(201).json({
                user: { _id: registeredUser._id, username: registeredUser.username, email: registeredUser.email }
            });
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
}));

// POST login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: info?.message || 'Invalid credentials' });
        req.login(user, (err) => {
            if (err) return next(err);
            res.json({ user: { _id: user._id, username: user.username, email: user.email } });
        });
    })(req, res, next);
});

// POST logout
router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.json({ message: 'Logged out' });
    });
});

module.exports = router;
