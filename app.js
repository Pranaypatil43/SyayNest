if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Force Google DNS to bypass network-level SRV blocks
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const session  = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash    = require('connect-flash');
const passport = require('passport');
const LocalStrategy  = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path     = require('path');

const User = require('./models/user.js');
const ExpressError = require('./utils/ExpressError.js');

// API routes
const apiListingsRouter = require('./routes/api/listings.js');
const apiUsersRouter    = require('./routes/api/users.js');
const apiBookingsRouter = require('./routes/api/bookings.js');

const dburl      = process.env.ATLASDB_URL;
const isProd     = process.env.NODE_ENV === 'production';
const CLIENT_URL = process.env.CLIENT_URL || '';   // e.g. https://staynest.example.com

// ── DB connection ──────────────────────────────────────────
mongoose.connect(dburl)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ── App setup ─────────────────────────────────────────────
const app = express();

// Trust AWS ALB / Nginx reverse proxy (needed for secure cookies over HTTPS)
if (isProd) app.set('trust proxy', 1);

// ── CORS ───────────────────────────────────────────────────
const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
  origin: isProd
    ? (CLIENT_URL ? [CLIENT_URL] : false)   // set CLIENT_URL env on AWS
    : (origin, cb) => {
        if (!origin || DEV_ORIGINS.includes(origin)) return cb(null, true);
        cb(new Error(`CORS blocked: ${origin}`));
      },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Session store ──────────────────────────────────────────
const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: { secret: process.env.SECRET },
  touchAfter: 24 * 3600,
});
store.on('error', err => console.error('Session store error:', err));

app.use(session({
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   isProd,                     // HTTPS only in production
    sameSite: isProd ? 'none' : 'lax',   // cross-origin cookies on AWS
    maxAge:   7 * 24 * 60 * 60 * 1000,
  },
}));

app.use(flash());

// ── Passport ───────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// ── Google OAuth strategy ──────────────────────────────────
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:8080`;

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  `${BACKEND_URL}/api/users/auth/google/callback`,
  scope: ['profile', 'email'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email    = profile.emails?.[0]?.value?.toLowerCase();
    const fullName = profile.displayName || '';
    const avatar   = profile.photos?.[0]?.value || '';
    const googleId = profile.id;

    // Check if user already exists (by googleId or email)
    let user = await User.findOne({ googleId });
    if (!user && email) user = await User.findOne({ email });

    if (user) {
      // Update Google info if missing
      if (!user.googleId) { user.googleId = googleId; }
      if (!user.avatar)   { user.avatar   = avatar; }
      if (!user.fullName) { user.fullName  = fullName; }
      await user.save();
      return done(null, user);
    }

    // Create new guest account via Google
    const username = 'g_' + (email?.split('@')[0] || googleId).replace(/[^a-z0-9]/gi, '').slice(0, 20) + '_' + Date.now().toString(36);
    const tempPw   = require('crypto').randomBytes(32).toString('hex');
    const newUser  = new User({ username, email, fullName, googleId, avatar, role: 'guest' });
    const saved    = await User.register(newUser, tempPw);
    return done(null, saved);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ── API routes ─────────────────────────────────────────────
app.use('/api/listings', apiListingsRouter);
app.use('/api/users',    apiUsersRouter);
app.use('/api/bookings', apiBookingsRouter);

// ── Serve React build in production ───────────────────────
if (isProd) {
  const distPath = path.join(__dirname, 'client', 'dist');
  app.use(express.static(distPath));
  // All non-API routes → React app (client-side routing)
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ── 404 (API only) ─────────────────────────────────────────
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  const { message = 'Something went wrong', statusCode = 500 } = err;
  res.status(statusCode).json({ error: message });
});

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT} [${isProd ? 'production' : 'development'}]`));
