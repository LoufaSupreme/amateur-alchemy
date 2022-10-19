const mongoose = require('mongoose');
// const BeerReview = mongoose.model('BeerReview');  // schema from BeerReview.js
// const multer = require("multer"); // package for uplaoding multiple files.  Needed since our _storeForm.pug has a form w/ enctype=multipart/form-data
// const jimp = require("jimp"); // for image uploads
// const uuid = require("uuid"); // helps with making unique file names for uploaded files (to avoid duplicates)

exports.getBeerReviews = async (req, res, next) => {
    try {
        res.render('beerReviews', { title: 'Beer Reviews' });
    }
    catch(err) {
        console.error(err);
    }
}