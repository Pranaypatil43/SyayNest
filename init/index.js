const mongoose = require('mongoose');
const initData = require('./data.js'); // Assuming you have a data.js file with sample data
const Listing = require('../models/listing.js'); // Assuming you have a Listing model defined in models/listing.js

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust'; // Replace with your MongoDB connection string

main()
.then(() => { 
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
}); 


async function main() {
    await mongoose.connect(MONGO_URL); 
    }


    const initDB = async () => {
        await Listing.deleteMany({}); // Clear existing listings 
        initData.data = initData.data.map((obj) => ({
            ...obj,
            owner:"693cfe69255dcba6b12d74e6", // Replace with a valid user ID from your users collection
        }));
        await Listing.insertMany(initData.data); // Insert sample data
        console.log("Database initialized with sample data");
    };  

    initDB();