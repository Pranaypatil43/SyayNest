const express = require('express');
const router = express.Router({ mergeParams: true }); 
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const Listing = require("../models/listing.js");
const Review = require('../models/reviews.js');
const {validateReview, isLoggedIn, isReviewAuthor} =require("../middleware.js")

const reviewController = require('../controllers/reviews.js');



//Reviews routes
//post route for adding a review to a listing
router.post('/',
    isLoggedIn,
    validateReview, 
    wrapAsync(reviewController.createReview));

//Delete route for deleting a review from a listing
router.delete('/:reviewId',isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;
