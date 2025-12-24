const mongoose = require("mongoose");
const Review = require("./reviews");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,

    image: {
        url: String,
        filename: String,
    },

    price: Number,
    location: String,
    country: String,

    category: {
        type: String,
        required: true,
        enum: [
            "trending",
            "rooms",
            "iconic",
            "mountains",
            "beachfront",
            "pools",
            "farms",
            "arctic",
            "views"
        ]
    },

    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({
            _id: { $in: listing.reviews },
        });
    }
});

module.exports = mongoose.model("Listing", listingSchema);
