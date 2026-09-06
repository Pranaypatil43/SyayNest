const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const otpSchema = new Schema({
    // identifier — either email or phone
    email: { type: String },
    phone: { type: String },
    code:  { type: String, required: true },
    // Auto-expire after 10 minutes
    createdAt: { type: Date, default: Date.now, expires: 600 },
});

module.exports = mongoose.model('Otp', otpSchema);
