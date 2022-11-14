const mongoose = require('mongoose');
const Beer = mongoose.model('Beer');  // schema from Beer.js
const multer = require("multer"); // package for uplaoding multiple files.  Needed since our _storeForm.pug has a form w/ enctype=multipart/form-data
const jimp = require("jimp"); // for image uploads
const uuid = require("uuid"); // helps with making unique file names for uploaded files (to avoid duplicates)
const slug = require('slugs');


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

            // // resize photo:
            // // pass in image buffer to jimp
            const photo = await jimp.read(file.buffer);
            // console.log(photo)

            await photo.resize(800, jimp.AUTO); // length and width
            
            // // write photo into uploads folder
            await photo.writeAsync(`./public/uploads/${fileName}`);  // save the resized image to the public folder 
            
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

exports.addBeer = (req, res) => {
    res.render('editBeer', { title: 'Add Beer' });
}

// turn the text from the tags input into an array of tags
function parseTags(rawTags) {
    const tagsArray = rawTags.split(', ').map(tag => tag.toLowerCase());
    return tagsArray;
}

exports.createBeer = async (req, res, next) => {
    try {
        req.body.tags = parseTags(req.body.tags);
        const beer = new Beer(req.body);
        const savedBeer = await beer.save();
        console.log('New Beer created');
        req.flash('success', `Successfully created ${beer.name}`)
        res.redirect(`/beer-reviews/${savedBeer.slug}`)
    }
    catch(err) {
        next(err);
    }
}

exports.editBeer = async (req, res, next) => {
    try {
        const beer_slug = req.params.slug;
        const beer = await Beer.findOne({ slug: beer_slug });

        res.render('editBeer', {
            title: `Edit ${beer.name}`,
            beer: beer,
        });
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

exports.updateBeer = async (req, res, next) => {
    try {
        req.body.tags = parseTags(req.body.tags);
        req.body.slug = slug(req.body.name);
        const beer = await Beer.findOneAndUpdate({ _id: req.params.id }, req.body, {
            new: true, // return newly updated store, not the old unupdated version
            runValidators: true, // forces validation of the options set in the Store model, e.g. required:true for name and trim:true for description, etc
        }).exec(); // run the query

        req.flash('success', `Successfully updated <strong>${beer.name}</strong>`);
        res.redirect(`/beer-reviews/${beer.slug}`);
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

exports.displayReview = async (req, res, next) => {
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

exports.deleteReview = async (req, res, next) => {
    try {
        await Beer.deleteOne({ _id: req.params.id });
        console.log('Beer review deleted')
        req.flash('success', `Beer review successfully deleted`);
        res.redirect('/');
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// get details of one beer and send json object
exports.getBeer = async (req, res, next) => {
    try {
        const beer = await Beer.findOne({ slug: req.params.slug });
        console.log(`Got beer data for ${req.params.slug}`);
        res.json({ beer });
    }
    catch(err) {
        console.log(err);
        res.json({'error': `Could not get beer info for ${req.params.slug}`});
        next(err);
    }
}