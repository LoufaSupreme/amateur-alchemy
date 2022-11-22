const mongoose = require('mongoose');
const Brewery = mongoose.model('Brewery');  // schema from Beer.js
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


// render the /breweries page with all breweries
exports.displayBreweries = async (req, res, next) => {
    try {
        console.log('running getBreweries')
        const breweries = await Brewery.find().sort({ created: 'desc' });
        res.render('breweries', { title: 'All Breweries', breweries: breweries });
    }
    catch(err) {
        console.error(err);
        next(err);
    }
}

// render the add brewery page 
exports.addBrewery = (req, res) => {
    console.log('Running addBrewery');
    res.render('addBrewery', { title: 'Add Brewery' });
}

// turn the text from the tags input into an array of tags
function parseList(commaSeperatedList) {
    const listArray = commaSeperatedList.split(', ').map(tag => tag.toLowerCase());
    return listArray;
}

// check if all fields are filled out
function isComplete(req) {
    if (
        req.body.name !== "" &&
        req.body.description !== "" &&
        req.body.location.address !== "" &&
        req.body.location.coordinates[0] !== "" &&
        req.body.location.coordinates[1] !== "" &&
        req.body.tags !== "" &&
        req.body.website !== ""
        // req.body.photos.length > 0
    ) return true;
}

// creates a new brewery instance in db
exports.createBrewery = async (req, res, next) => {
    console.log('Running createBrewery');
    try {
        console.log(req.body)
        req.body.tags = parseList(req.body.tags);
        req.body.google_data.tags = parseList(req.body.google_data["tags"]);
        req.body.google_data.images = parseList(req.body.google_data["images"]);
        if (isComplete(req)) req.body.completed = true;
        const brewery = new Brewery(req.body);
        const savedBrewery = await brewery.save();
        console.log('New Brewery created');
        req.flash('success', `Successfully created ${brewery.name}`)
        res.redirect(`/breweries/${savedBrewery.slug}`)
    }
    catch(err) {
        next(err);
    }
}

// render the individual brewery page
exports.displayBrewery = async (req, res, next) => {
    console.log('Running displayBrewery');
    try {
        const brewery = await Brewery.findOne({slug: req.params.slug});
        if (!brewery) {
            console.error('No brewery found in db');
            return next();
        }
        res.render('brewery', { title: brewery.name, brewery });
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// renders the addBrewery page with preloaded brewery info
exports.editBrewery = async (req, res, next) => {
    try {
        const brewery_slug = req.params.slug;
        const brewery = await Brewery.findOne({ slug: brewery_slug });

        res.render('addBrewery', {
            title: `Edit ${brewery.name}`,
            brewery: brewery,
        });
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// updates existing beer instance in db
exports.updateBrewery = async (req, res, next) => {
    console.log('Running updateBrewery');
    try {
        req.body.tags = parseList(req.body.tags);

        req.body.google_data.tags = parseList(req.body.google_data["tags"]);
        req.body.google_data.images = parseList(req.body.google_data["images"]);
        req.body.slug = slug(req.body.name);
        // check if all fields are filled out:
        if (isComplete(req)) req.body.completed = true;
        // update the location type since mongo's findOneAndUpdate method doesn't take into account the Schema defaults
        req.body.location.type = "Point";
        req.body.lastUpdated = Date.now();

        const brewery = await Brewery.findOneAndUpdate(
            { _id: req.params.id }, 
            {
                $inc: { updateCount: 1 },
                $set: req.body
            },
            {
                new: true, // return newly updated obj, not the old unupdated version
                runValidators: true, // forces validation of the options set in the Schema model, e.g. required:true for name and trim:true for description, etc
            }).exec(); // run the query

        req.flash('success', `Successfully updated <strong>${brewery.name}</strong>`);
        res.redirect(`/breweries/${brewery.slug}`);
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// API END POINTS

// uses mongodb brewery index of name, description, address
// used in the typeAhead dropdown in the newBeer form
// returns a json string of all the matching breweries
exports.searchBreweries = async (req, res, next) => {
    console.log(`Running searchBreweries: q=${req.query.q}`);
    try {
        const breweries = await Brewery.find({
            $text: {
                $search: req.query.q,

            }
        },
        // metadata to "rank" how applicable the search results are:
        {
            search_score: { $meta: 'textScore' }
        }).sort({
            search_score: { $meta: 'textScore' }
        }).limit(10);

        res.json(breweries);
    }
    catch(err) {
        req.error = err;
        console.log(err);
        next(err);
    }
}

// find a list of breweries within a certain distance
exports.mapBreweries = async (req, res, next) => {
    console.log(`Running mapBreweries: lat: ${req.query.lat}, lng: ${req.query.lng}`);
    try {
        const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
        const query = {
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: coordinates
                    },
                    $maxDistance: 20000 // in meters
                }
            }
            
        }

        const breweries = await Brewery.find(query);
        res.json(breweries);
    }
    catch(err) {
        console.error(err);
        next(err);
    }
}


// exports.deleteReview = async (req, res, next) => {
//     try {
//         await Beer.deleteOne({ _id: req.params.id });
//         console.log('Beer review deleted')
//         req.flash('success', `Beer review successfully deleted`);
//         res.redirect('/');
//     }
//     catch(err) {
//         console.log(err);
//         next(err);
//     }
// }

// // get details of one beer and send json object
// exports.getBeer = async (req, res, next) => {
//     try {
//         const beer = await Beer.findOne({ slug: req.params.slug });
//         console.log(`Got beer data for ${req.params.slug}`);
//         res.json({ beer });
//     }
//     catch(err) {
//         console.log(err);
//         res.json({'error': `Could not get beer info for ${req.params.slug}`});
//         next(err);
//     }
// }