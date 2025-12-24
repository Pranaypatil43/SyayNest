const Listing = require('../models/listing');

module.exports.index = async (req, res) => {
    const { category, } = req.query;

    let allListings;

    if (category) {
        allListings = await Listing.find({ category });
    } else {
        allListings = await Listing.find({});
    }

    res.render("./listings/index.ejs", { allListings, category });
};


module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs", {
        mapKey: process.env.MAP_TOKEN
    });
};


module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path:'reviews', 
        populate: {path: 'author'}
    })
    .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does nor exist");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("./listings/show.ejs", { listing,
        mapKey: process.env.MAP_TOKEN
    });
};

module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    
    const newListing = new Listing(req.body.listing);

    const { geometry } = req.body.listing;

newListing.geometry = {
  type: "Point",
  coordinates: [
    parseFloat(geometry.coordinates[0]), // lng
    parseFloat(geometry.coordinates[1])  // lat
  ]
};


    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "Successfully made a new listing");
    res.redirect('/listings'); // Redirect to the listings page after saving

};  

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does nor exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_300"); // Example modification if needed
    res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    const updatedData = req.body.listing; // Assuming the form data is sent as 'listing'
    let listing = await Listing.findByIdAndUpdate(id, updatedData);
   
    if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }

    req.flash("success", " listing updated");
    res.redirect(`/listings/${id}`); // Redirect to the updated listing page
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "listing Deleted");
    res.redirect('/listings');
};