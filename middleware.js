const Listing = require("./models/listing");
const Review  = require("./models/reviews");
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('./schema.js');

// ── Auth: must be logged in ────────────────────────────────
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'You must be logged in first' });
    }
    next();
};

// ── Auth: must be a host ───────────────────────────────────
module.exports.isHost = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'You must be logged in first' });
    }
    if (req.user.role !== 'host') {
        return res.status(403).json({ error: 'Only hosts can perform this action' });
    }
    next();
};

// ── Auth: must own the listing ─────────────────────────────
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
    }
    if (!listing.owner.equals(req.user._id)) {
        return res.status(403).json({ error: 'You are not the owner of this listing' });
    }
    next();
};

// ── Auth: must be review author ────────────────────────────
module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({ error: 'Review not found' });
    }
    if (!review.author.equals(req.user._id)) {
        return res.status(403).json({ error: 'You are not the author of this review' });
    }
    next();
};

// ── Validation: listing body ───────────────────────────────
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errmsg = error.details.map(el => el.message).join(', ');
        return next(new ExpressError(errmsg, 400));
    }
    next();
};

// ── Validation: review body ────────────────────────────────
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errmsg = error.details.map(el => el.message).join(', ');
        return next(new ExpressError(errmsg, 400));
    }
    next();
};

// ── Unused in API mode but kept for compatibility ──────────
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};
