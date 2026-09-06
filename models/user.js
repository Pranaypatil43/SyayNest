const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    // 'host' = can create/edit/delete listings
    // 'guest' = normal user, can only book & review
    role: {
        type: String,
        enum: ['host', 'guest'],
        default: 'guest',
    },
    fullName: String,
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);

  

