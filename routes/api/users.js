const express   = require('express');
const router    = express.Router();
const passport  = require('passport');
const User      = require('../../models/user.js');
const Otp       = require('../../models/otp.js');
const { sendOtpEmail } = require('../../utils/mailer.js');
const wrapAsync = require('../../utils/wrapAsync.js');

// ── helper ─────────────────────────────────────────────────
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─────────────────────────────────────────────────────────
//  GET /api/users/me
// ─────────────────────────────────────────────────────────
router.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
        const { _id, username, email, phone, role, fullName } = req.user;
        return res.json({ user: { _id, username, email, phone, role, fullName } });
    }
    res.json({ user: null });
});

// ─────────────────────────────────────────────────────────
//  POST /api/users/signup  — HOST: create account
//  Body: { username, email }
//  After signup, host still needs to login via email OTP
// ─────────────────────────────────────────────────────────
router.post('/signup', wrapAsync(async (req, res) => {
    const { username, email } = req.body;

    if (!username?.trim()) return res.status(400).json({ error: 'Username is required' });
    if (!email?.trim())    return res.status(400).json({ error: 'Email is required' });

    const emailLower = email.toLowerCase().trim();

    // Check duplicates
    const existingEmail    = await User.findOne({ email: emailLower });
    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingEmail)    return res.status(400).json({ error: 'Email already registered. Please log in.' });
    if (existingUsername) return res.status(400).json({ error: 'Username already taken.' });

    // Create host account with a random password (login is email OTP)
    const tempPw = Math.random().toString(36).slice(2) + Date.now() + Math.random().toString(36).slice(2);
    const newUser = new User({ username: username.trim(), email: emailLower, role: 'host' });
    await User.register(newUser, tempPw);

    res.status(201).json({ message: 'Account created! Please log in with your email OTP.' });
}));

// ─────────────────────────────────────────────────────────
//  POST /api/users/send-otp
//  Body: { email }  — works for both host and guest
//  - Host: email must already exist in DB
//  - Guest: any valid email → account auto-created on verify
// ─────────────────────────────────────────────────────────
router.post('/send-otp', wrapAsync(async (req, res) => {
    const { email } = req.body;
    if (!email?.trim()) return res.status(400).json({ error: 'Email is required' });

    const emailLower = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
        return res.status(400).json({ error: 'Enter a valid email address' });
    }

    // Delete any existing OTP for this email
    await Otp.deleteMany({ email: emailLower });

    const code = generateOtp();
    await Otp.create({ email: emailLower, code });

    // Send email
    try {
        await sendOtpEmail(emailLower, code, 'login');
        console.log(`[OTP] Email: ${emailLower}  Code: ${code}`);
    } catch (err) {
        console.error('[OTP email error]', err.message);
        return res.status(500).json({ error: 'Failed to send OTP email. Please try again.' });
    }

    res.json({ message: `OTP sent to ${emailLower}` });
}));

// ─────────────────────────────────────────────────────────
//  POST /api/users/verify-otp
//  Body: { email, code, fullName? }
//  - If user exists (host or returning guest) → log in
//  - If no user → create guest account → log in
// ─────────────────────────────────────────────────────────
router.post('/verify-otp', wrapAsync(async (req, res, next) => {
    const { email, code, fullName } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const emailLower = email.toLowerCase().trim();

    const otpDoc = await Otp.findOne({ email: emailLower });
    if (!otpDoc)                       return res.status(400).json({ error: 'OTP expired. Request a new one.' });
    if (otpDoc.code !== code.trim())   return res.status(400).json({ error: 'Incorrect OTP. Try again.' });

    // OTP valid — delete it immediately
    await Otp.deleteMany({ email: emailLower });

    // Find or create user
    let user = await User.findOne({ email: emailLower });

    if (!user) {
        // New guest — auto-create account
        const username = 'guest_' + emailLower.split('@')[0].replace(/[^a-z0-9]/gi, '') + '_' + Date.now().toString(36);
        const tempPw   = Math.random().toString(36).slice(2) + Date.now();
        user = new User({
            username,
            email:    emailLower,
            fullName: fullName || '',
            role:     'guest',
        });
        user = await User.register(user, tempPw);
    } else {
        // Update fullName if provided and not set
        if (fullName && !user.fullName) {
            user.fullName = fullName;
            await user.save();
        }
    }

    req.login(user, (err) => {
        if (err) return next(err);
        const { _id, username, email, role, fullName } = user;
        res.json({ user: { _id, username, email, role, fullName } });
    });
}));

// ─────────────────────────────────────────────────────────
//  POST /api/users/logout
// ─────────────────────────────────────────────────────────
router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.json({ message: 'Logged out' });
    });
});

// ─────────────────────────────────────────────────────────
//  GET /api/users/auth/google  — initiate Google OAuth
// ─────────────────────────────────────────────────────────
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// ─────────────────────────────────────────────────────────
//  GET /api/users/auth/google/callback  — Google redirects here
// ─────────────────────────────────────────────────────────
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=google' }),
    (req, res) => {
        // Success — redirect to frontend listings page
        const isProd    = process.env.NODE_ENV === 'production';
        const frontendUrl = isProd
            ? (process.env.CLIENT_URL || '')
            : 'http://localhost:5173';
        res.redirect(`${frontendUrl}/listings`);
    }
);

module.exports = router;
