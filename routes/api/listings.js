const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const { cloudinary } = require('../../cloudConfig.js');

// Use memory storage — we'll upload to Cloudinary manually
// This avoids multer-storage-cloudinary v2 incompatibility with multer v2
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

const Listing   = require('../../models/listing.js');
const Review    = require('../../models/reviews.js');
const { isLoggedIn, isHost, isOwner, isReviewAuthor, validateReview } = require('../../middleware.js');
const wrapAsync = require('../../utils/wrapAsync.js');

/**
 * Upload a single buffer to Cloudinary and return { url, filename }.
 */
function uploadBufferToCloudinary(buffer, mimetype) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'staynest_DEV', resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                resolve({ url: result.secure_url, filename: result.public_id });
            }
        );
        stream.end(buffer);
    });
}

/**
 * Collect all images from:
 *  - req.files  (multer memoryStorage — array of file objects with .buffer)
 *  - data.imageUrls (array of URL strings)
 *  - data.imageUrl  (single URL string — legacy)
 */
async function resolveImages(req, data) {
    const images = [];

    // Upload files from memory to Cloudinary
    if (req.files && req.files.length) {
        for (const file of req.files) {
            const result = await uploadBufferToCloudinary(file.buffer, file.mimetype);
            images.push(result);
        }
    }

    // Pasted URL array
    if (Array.isArray(data.imageUrls)) {
        data.imageUrls
            .map(u => (u || '').trim())
            .filter(Boolean)
            .forEach(u => images.push({ url: u, filename: 'external' }));
    }

    // Legacy single URL
    if (!images.length && data.imageUrl) {
        images.push({ url: data.imageUrl.trim(), filename: 'external' });
    }

    return images;
}

// ── GET all listings ────────────────────────────────────────
router.get('/', wrapAsync(async (req, res) => {
    const { category } = req.query;
    const allListings = category
        ? await Listing.find({ category })
        : await Listing.find({});
    res.json(allListings);
}));

// ── GET single listing ──────────────────────────────────────
router.get('/:id', wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate({ path: 'reviews', populate: { path: 'author', select: 'username fullName role' } })
        .populate('owner', 'username fullName role');
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
}));

// ── POST create listing ─────────────────────────────────────
router.post('/', isHost, upload.any(), wrapAsync(async (req, res) => {
    const data = JSON.parse(req.body.listing);

    const imgs = await resolveImages(req, data);
    if (!imgs.length) {
        return res.status(400).json({ error: 'At least one image is required' });
    }

    const newListing = new Listing({
        title:       data.title,
        description: data.description,
        price:       Number(data.price),
        location:    data.location,
        country:     data.country,
        category:    data.category,
        geometry:    data.geometry,
        images:      imgs,
        image:       imgs[0],   // backward compat
        owner:       req.user._id,
    });

    await newListing.save();
    res.status(201).json(newListing);
}));

// ── PUT update listing ──────────────────────────────────────
router.put('/:id', isHost, isOwner, upload.any(), wrapAsync(async (req, res) => {
    const data    = JSON.parse(req.body.listing);
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    // Update scalar fields
    listing.title       = data.title       ?? listing.title;
    listing.description = data.description ?? listing.description;
    listing.price       = Number(data.price) || listing.price;
    listing.location    = data.location    ?? listing.location;
    listing.country     = data.country     ?? listing.country;
    listing.category    = data.category    ?? listing.category;

    // Update images if new ones provided
    const imgs = await resolveImages(req, data);
    if (imgs.length) {
        listing.images = data.replaceImages
            ? imgs
            : [...(listing.images || []), ...imgs];
        listing.image = listing.images[0];
    }

    await listing.save();
    res.json(listing);
}));

// ── DELETE listing ──────────────────────────────────────────
router.delete('/:id', isHost, isOwner, wrapAsync(async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted' });
}));

// ── POST review ─────────────────────────────────────────────
router.post('/:id/reviews', isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    const listing   = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    // Return review with author details populated
    const populated = await newReview.populate('author', 'username fullName role');
    res.status(201).json(populated);
}));

// ── DELETE review ───────────────────────────────────────────
router.delete('/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.json({ message: 'Review deleted' });
}));

module.exports = router;
