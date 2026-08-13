const cloudinary = require('cloudinary');   // root object — NOT .v2
const CloudinaryStorage = require('multer-storage-cloudinary');

// multer-storage-cloudinary v2 internally does cloudinary.v2.uploader
// so we must pass the root cloudinary object, not cloudinary.v2
cloudinary.v2.config({
    cloud_name:  process.env.CLOUD_NAME,
    api_key:     process.env.CLOUD_API_KEY,
    api_secret:  process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,   // pass root, library accesses .v2 itself
    params: {
        folder:         'staynest_DEV',
        allowedFormats: ['png', 'jpg', 'jpeg'],
    },
});

module.exports = { cloudinary: cloudinary.v2, storage };
