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
exports.getBreweries = async (req, res, next) => {
    try {
        console.log('running getBreweries')
        const breweries = await Brewery.find().sort({ created: 'desc' });
        res.render('breweries', { title: 'Breweries', breweries: breweries });
    }
    catch(err) {
        console.error(err);
        next(err);
    }
}

// render the add brewery page 
exports.addBrewery = (req, res) => {
    res.render('addBrewery', { title: 'Add Brewery' });
}

// turn the text from the tags input into an array of tags
function parseTags(rawTags) {
    const tagsArray = rawTags.split(', ').map(tag => tag.toLowerCase());
    return tagsArray;
}

// creates a new brewery instance in db
exports.createBrewery = async (req, res, next) => {
    try {
        req.body.tags = parseTags(req.body.tags);
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
    try {
        res.send(`Brewery page for ${req.params.slug}`)
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
        req.body.tags = parseTags(req.body.tags);
        req.body.slug = slug(req.body.name);
        const brewery = await Brewery.findOneAndUpdate({ _id: req.params.id }, req.body, {
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




// exports.displayReview = async (req, res, next) => {
//     try {
//         console.log('running beerReview')
//         const beer = await Beer.findOne({ slug: req.params.slug });
//         if (!beer) {
//             console.error('No beer found in db');
//             return next();
//         }
//         res.render('beerReview', { title: beer.name, beer: beer });
//     }
//     catch(err) {
//         console.error(err);
//         next(err);
//     }
// }

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