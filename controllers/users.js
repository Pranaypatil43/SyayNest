const User = require('../models/user');

module.exports.renderSignupForm = (req, res) => {
    res.render('users/signup'); // render signup.ejs
};

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Wanderlust!');
            const redirectUrl = req.session.redirectUrl || '/listings';
            res.redirect(redirectUrl);
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login.ejs'); // render login.ejs
};


module.exports.login =  async (req, res) => {
        req.flash("success", "Welcome back to Wanderlust!");
        const redirectUrl = res.locals.redirectUrl || '/listings';
        res.redirect(redirectUrl);
    };

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) { 
            return next(err); 
        } 
        req.flash('success', "you are logged out!");
        res.redirect('/listings');
    });
};