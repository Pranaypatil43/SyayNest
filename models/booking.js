const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
        required: true,
    },
    guest: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    // Guest personal info collected at booking time
    fullName:  { type: String, required: true },
    phone:     { type: String, required: true },
    email:     { type: String },
    checkIn:   { type: Date,   required: true },
    checkOut:  { type: Date,   required: true },
    guests:    { type: Number, default: 1 },
    specialRequests: { type: String },

    totalPrice: { type: Number },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'confirmed',
    },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
