const mongoose = require('mongoose');
const Beer = mongoose.model('Beer');  // schema from Beer.js
const multer = require("multer"); // package for uplaoding multiple files.  Needed since our _storeForm.pug has a form w/ enctype=multipart/form-data
const jimp = require("jimp"); // for image uploads
const uuid = require("uuid"); // helps with making unique file names for uploaded files (to avoid duplicates)

const multerOptions = {
    storage: multer.memoryStorage(),  // initially load file into local memory
    fileFilter: function(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto) {
            next(null, true);
        }
        else {
            next({ message: "That filetype isn't allowed!"}, false);
        }
    }
}

exports.upload = multer(multerOptions).array('photos');

exports.resize = async (req, res, next) => {
    try {
        // check if there is no new files to resize
        if (!req.files) {
            next(); // skip to next middleware
            return;
        }

        req.body.photos = [];
        for (const file of req.files) {
            // get the type of image
            const fileExtension = file.mimetype.split('/')[1]; 

            // create a new unique name for the image
            const fileName = `${uuid.v4()}.${fileExtension}`;
            req.body.photos.push(fileName); 

            // resize photo:
            // pass in image buffer to jimp
            const photo = await jimp.read(file.buffer);
            photo.resize(800, jimp.AUTO); // length and width

            // write photo into uploads folder
            photo.write(`./public/uploads/${fileName}`);  // save the resized image to the public folder 
            
        }
        
        next(); 
    }
    catch(err) {
        req.error = err;
        next(err);
    }
}

exports.getBeers = async (req, res, next) => {
    try {
        console.log('running getBeers')
        const beers = await Beer.find().sort({ created: 'desc' });
        res.render('home', { title: 'Beer Reviews', beers: beers });
    }
    catch(err) {
        console.error(err);
    }
}

exports.editBeer = (req, res) => {
    res.render('editBeer', { title: 'Add Beer' });
}

exports.createBeer = async (req, res, next) => {
    try {
        const beer = new Beer(req.body);
        const savedBeer = await beer.save();
        console.log('New Beer created');
        req.flash('success', `Successfully created ${beer.name}`)
        res.redirect(`/beer-reviews/${savedBeer.slug}`)
        // res.render('beerReview', { title: beer.name, beer: beer })
    }
    catch(err) {
        next(err);
    }
}

exports.beerReview = async (req, res, next) => {
    try {
        console.log('running beerReview')
        const beer = await Beer.findOne({ slug: req.params.slug });
        if (!beer) {
            console.error('No beer found in db');
            return next();
        }
        res.render('beerReview', { title: beer.name, beer: beer });
    }
    catch(err) {
        console.error(err);
        next(err);
    }
}