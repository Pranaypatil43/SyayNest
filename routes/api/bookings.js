const express  = require('express');
const router   = express.Router();
const Booking  = require('../../models/booking.js');
const Listing  = require('../../models/listing.js');
const { isLoggedIn } = require('../../middleware.js');
const wrapAsync = require('../../utils/wrapAsync.js');

// ─────────────────────────────────────────────────────────
//  POST /api/bookings  — create a booking
// ─────────────────────────────────────────────────────────
router.post('/', isLoggedIn, wrapAsync(async (req, res) => {
    const { listingId, fullName, phone, email, checkIn, checkOut, guests, specialRequests } = req.body;

    if (!listingId || !fullName || !phone || !checkIn || !checkOut) {
        return res.status(400).json({ error: 'Missing required booking fields' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    // Calculate nights & total
    const msPerDay = 1000 * 60 * 60 * 24;
    const nights   = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / msPerDay));
    const totalPrice = Math.round(listing.price * nights * 1.18); // incl. 18% GST

    const booking = await Booking.create({
        listing: listingId,
        guest:   req.user._id,
        fullName, phone, email,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests:  guests || 1,
        specialRequests,
        totalPrice,
    });

    res.status(201).json({ booking, nights, totalPrice });
}));

// ─────────────────────────────────────────────────────────
//  GET /api/bookings/my  — get current user's bookings
// ─────────────────────────────────────────────────────────
router.get('/my', isLoggedIn, wrapAsync(async (req, res) => {
    const bookings = await Booking.find({ guest: req.user._id })
        .populate('listing', 'title image location country price')
        .sort({ createdAt: -1 });
    res.json(bookings);
}));

module.exports = router;
