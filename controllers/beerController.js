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

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
    try {
        // check if there is no new file to resize
        if (!req.file) {
            next(); // skip to next middleware
            return;
        }
        // console.log(req.file);
        const fileExtension = req.file.mimetype.split('/')[1]; // get the type of image
        req.body.photo = `${uuid.v4()}.${fileExtension}`; // create a new unique name for the image
        // resize photo:
        const photo = await jimp.read(req.file.buffer); // pass in image buffer to jimp
        await photo.resize(800, jimp.AUTO); // length and width
        await photo.write(`./public/uploads/${req.body.photo}`);  // save the resized image to the public folder
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
        // res.redirect(`/beer-reviews/${savedBeer.slug}`)
        res.redirect('back')
    }
    catch(err) {
        next(err);
    }
}