const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Make sure the path is correct
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');

const userController = require('../controllers/users');
const user = require('../models/user');

router.route('/signup')
.get( userController.renderSignupForm )
.post(wrapAsync(userController.signup) 
);

router.route("/login")
.get( userController.renderLoginForm )
.post(
    saveRedirectUrl,
    passport.authenticate("local", { 
        failureRedirect: '/login', 
        failureFlash: true,
    }), userController.login
);

// Handle logout
router.get('/logout', userController.logout );

module.exports = router;
 