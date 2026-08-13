const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../../cloudConfig.js');
const upload = multer({ storage });

const Listing = require('../../models/listing.js');
const Review  = require('../../models/reviews.js');
const { isLoggedIn, isOwner, validateListing, isReviewAuthor, validateReview } = require('../../middleware.js');
const wrapAsync = require('../../utils/wrapAsync.js');

/* multer-storage-cloudinary v2 puts the Cloudinary result directly
   onto req.file. The URL field is `secure_url` (https), not `path`. */
function imageFromFile(file) {
    return {
        url:      file.secure_url || file.path || '',
        filename: file.public_id  || file.filename || '',
    };
}

// GET all listings
router.get('/', wrapAsync(async (req, res) => {
    const { category } = req.query;
    const allListings = category
        ? await Listing.find({ category })
        : await Listing.find({});
    res.json(allListings);
}));

// GET single listing
router.get('/:id', wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate({ path: 'reviews', populate: { path: 'author' } })
        .populate('owner');
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
}));

// POST create listing
router.post('/', isLoggedIn, upload.single('image'), wrapAsync(async (req, res) => {
    const data = JSON.parse(req.body.listing);
    const newListing = new Listing(data);
    
    // Handle image: file upload OR direct URL
    if (req.file) {
        newListing.image = imageFromFile(req.file);
    } else if (data.imageUrl) {
        newListing.image = { url: data.imageUrl, filename: 'external' };
    }
    
    newListing.owner = req.user._id;
    await newListing.save();
    res.status(201).json(newListing);
}));

// PUT update listing
router.put('/:id', isLoggedIn, isOwner, upload.single('image'), wrapAsync(async (req, res) => {
    const data = JSON.parse(req.body.listing);
    const listing = await Listing.findByIdAndUpdate(req.params.id, data, { new: true });
    if (req.file) {
        listing.image = imageFromFile(req.file);
        await listing.save();
    }
    res.json(listing);
}));

// DELETE listing
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted' });
}));

// POST review
router.post('/:id/reviews', isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.status(201).json(newReview);
}));

// DELETE review
router.delete('/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.json({ message: 'Review deleted' });
}));

module.exports = router;
