const cloudinary = require('cloudinary');

cloudinary.v2.config({
    cloud_name:  process.env.CLOUD_NAME,
    api_key:     process.env.CLOUD_API_KEY,
    api_secret:  process.env.CLOUD_API_SECRET,
});

// Export cloudinary.v2 — use upload_stream for direct buffer uploads
// (multer-storage-cloudinary is no longer used — incompatible with multer v2)
module.exports = { cloudinary: cloudinary.v2 };
