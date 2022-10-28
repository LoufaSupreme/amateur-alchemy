const mongoose = require('mongoose');
const Beer = mongoose.model('Beer');  // schema from Beer.js
// const multer = require("multer"); // package for uplaoding multiple files.  Needed since our _storeForm.pug has a form w/ enctype=multipart/form-data
// const jimp = require("jimp"); // for image uploads
// const uuid = require("uuid"); // helps with making unique file names for uploaded files (to avoid duplicates)

exports.getBeers = async (req, res, next) => {
    try {
        res.render('home', { title: 'Beer Reviews' });
    }
    catch(err) {
        console.error(err);
    }
}

exports.editBeer = (req, res) => {
    res.render('editBeer', { title: 'Add Beer' });
}

exports.createBeer = async (req, res, next) => {

}