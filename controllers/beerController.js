const mongoose = require('mongoose');
const Beer = mongoose.model('Beer');  // schema from Beer.js
const Brewery = mongoose.model('Brewery');  // schema from Brewery.js
const multer = require("multer"); // package for uplaoding multiple files.  Needed since our _storeForm.pug has a form w/ enctype=multipart/form-data
const jimp = require("jimp"); // for image uploads
const uuid = require("uuid"); // helps with making unique file names for uploaded files (to avoid duplicates)
const slug = require('slugs');
const fs = require('fs/promises');

const multerOptions = {
    storage: multer.memoryStorage(),  // initially load file into local memory
    fileFilter: function(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        const isVideo = file.mimetype.startsWith('video/');
        if (isPhoto || isVideo) {
            next(null, true);
        }
        else {
            next({ message: "That filetype isn't allowed!"}, false);
        }
    }
}

exports.uploadMedia = multer(multerOptions).fields([
    { name: 'video' },
    { name: 'photos' }
]);

exports.resizeImage = async (req, res, next) => {
    try {
        // console.log(req.files);

        // check if there is no new files to resize
        if (!req.files) {
            next(); // skip to next middleware
            return;
        }
        
        req.body.photos = [];
        let hasVideo = false;
        // for each fileinput (i.e. "photos" or "video")
        for (const fileInput in req.files) {
            // for each file of each fileInput
            for (const file of req.files[fileInput]) {
                // get the type of image
                const fileExtension = file.mimetype.split('/')[1]; 
    
                // create a new unique name for the image
                const fileName = `${uuid.v4()}.${fileExtension}`;
    
                if (file.mimetype.startsWith('video/')) {
                    fs.writeFile(`./public/uploads/${fileName}`, file.buffer);
                    req.body.video = fileName;
                    hasVideo = true;
                }
                else {
                    req.body.photos.push(fileName); 
    
                    // // resize photo:
                    // // pass in image buffer to jimp
                    const photo = await jimp.read(file.buffer);
                    // console.log(photo)
        
                    await photo.resize(800, jimp.AUTO); // length and width
                    
                    // // write photo into uploads folder
                    await photo.writeAsync(`./public/uploads/${fileName}`);  // save the resized image to the public folder 
                }
            }
            
        }
        if (!hasVideo) req.body.video = null;
        next(); 
    }
    catch(err) {
        req.error = err;
        console.log(err);
        console.log('ERROR');
        next(err);
    }
}

// render home page
exports.home = async (req, res, next) => {
    try {
        console.log('running home')
        const beers = await Beer.find().sort({ created: 'desc' }).populate('brewery');
        res.render('home', { title: 'Amateur Alchemy', beers: beers });
    }
    catch(err) {
        console.error(err);
    }
}

// show the add beer form
exports.addBeer = (req, res) => {
    res.render('addBeer', { 
        title: 'Add Beer',
        schema: Beer.schema.obj 
    });
}

// turn the text from the tags input into an array of tags
function parseTags(rawTags) {
    const tagsArray = rawTags !== "" ? rawTags.split(', ').map(tag => tag.toLowerCase()) : [];
    return tagsArray;
}

// if the beer's brewery already exists, update it with completed:false
// if it doesn't already exist, then create it
async function updateOrCreateBrewery(req) {
    // create query criteria to find the brewery:
    const queryCriteria = [{ name: req.body["brewery-name"] }];
    
    // confirm that the ID passed in is a valid mongodb ObjectId
    // if so, push that ID into the query criteria object
    if (mongoose.Types.ObjectId.isValid(req.body.brewery)) {
        queryCriteria.push({ _id: req.body.brewery })
    };

    // use query criteria to find and update brewery (or create, aka upsert, a new brewery)
    const brewery = await Brewery.findOneAndUpdate(
        { $or: queryCriteria }, 
        { 
            $inc: { updateCount: 1 },
            $set: { lastModified: Date.now() } 
        },
        { 
            upsert: true, 
            new: true // return the new instance
        },
    );

    // call the save function so that pre-save hooks fire (in our case, this will generate a slug for the brewery)
    // calling save is not required for an update operation, but an update op won't trigger the pre-save hook
    const savedBrewery = await brewery.save();

    console.log(`Updated/created ${savedBrewery.name}`)

    return savedBrewery;
}

// operation = "push" or "pull"
async function addOrRemoveBeerToBrewery(operation, brewery_id, beer_id) {
    console.log(`${operation}ing beer to/from brewery`);
    
    return await Brewery.updateOne(
        {
            _id: brewery_id
        },
        {
            [`$${operation}`]: { beers: beer_id },
            $inc: { updateCount: 1 },
            $set: { lastModified: Date.now() }
        }
    );
}

// create a new beer review
// also add this beer to the brewery's beers array, or create a new brewery if it doesn't already exist
exports.createBeer = async (req, res, next) => {
    try {
        // parse the tags
        req.body.tags = parseTags(req.body.tags);

        // update or create a new brewery
        const brewery = await updateOrCreateBrewery(req);
    
        // set the requests brewery field to the updated or new brewery ID
        req.body.brewery = brewery._id;

        // create a new beer review
        const beer = new Beer(req.body);
        const savedBeer = await beer.save();
        console.log('New Beer created');

        // add the new beer's ID to the brewery's beers array
        await addOrRemoveBeerToBrewery('push', brewery._id, savedBeer._id);

        // celebrate
        req.flash('success', `Successfully created ${beer.name}`)
        res.redirect(`/beer-reviews/${savedBeer.slug}`)
    }
    catch(err) {
        next(err);
    }
}

// show the addbeer/editbeer form with existing beer info
exports.editBeer = async (req, res, next) => {
    console.log('Running editBeer');
    try {
        const beer_slug = req.params.slug;
        const beer = await Beer.findOne({ slug: beer_slug }).populate('brewery');

        res.render('addBeer', {
            title: `Edit ${beer.name}`,
            beer: beer,
            schema: Beer.schema.obj
        });
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// apply changes to db
exports.updateBeer = async (req, res, next) => {
    console.log('Running updateBeer');
    try {
        req.body.tags = parseTags(req.body.tags);
        req.body.slug = slug(req.body.name);

        // create or update the beers brewery
        const brewery = await updateOrCreateBrewery(req);
        // set the requests brewery field to the updated or new brewery ID
        req.body.brewery = brewery._id;

        // re-calculate total score
        const totalScore = 
            +req.body.rating.aroma.score + 
            +req.body.rating.appearance.score + 
            +req.body.rating.flavor.score + 
            +req.body.rating.mouthfeel.score + 
            +req.body.rating.overall.score;
        req.body.totalScore = totalScore; 
            
        const beer = await Beer.findOneAndUpdate({ _id: req.params.id }, req.body, {
            new: true, // return newly updated obj, not the old unupdated version
            runValidators: true, // forces validation of the options set in the Schema model, e.g. required:true for name and trim:true for description, etc
        }).exec(); // run the query

        // remove this beer from all breweries:
        const breweriesWithBeer = await Brewery.updateMany(
            { beers: mongoose.Types.ObjectId(beer._id) },
            { $pull : { beers: beer._id } }
        )
        
        // add the beer to the brewery
        await addOrRemoveBeerToBrewery('push', brewery._id, beer._id);

        req.flash('success', `Successfully updated <strong>${beer.name}</strong>`);
        res.redirect(`/beer-reviews/${beer.slug}`);
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// show one beer review
exports.displayReview = async (req, res, next) => {
    try {
        console.log('running beerReview')
        const beer = await Beer.findOne({ slug: req.params.slug }).populate('brewery');
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

// delete beer review
exports.deleteReview = async (req, res, next) => {
    console.log('Running deleteReview');
    try {
        const beer = await Beer.findOneAndDelete({ _id: req.params.id });
        console.log(`${beer.name} deleted`);

        // remove this beer from all breweries:
        const breweriesWithBeer = await Brewery.updateMany(
            { beers: mongoose.Types.ObjectId(beer._id) },
            { $pull : { beers: beer._id } }
        )

        req.flash('success', `Beer review successfully deleted`);
        res.redirect('/');
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// display all the reviews, sorted by some url query
// if the query is blank, no sorting will happen
exports.displayReviews = async (req, res, next) => {
    console.log('Running displayReviews');
    try {
        // create a sort and match query from the url
        const sortCriteria = {};
        const matchCriteria = {};
        for (pair of Object.entries(req.query)) {
            const [ category, criteria ] = pair;
            if (category == 'bjcp_style') {
                matchCriteria[category] = criteria
            }
            else {
                sortCriteria[category] = +criteria;
            }
        }

        // create a separate aggregation object, b/c our sort criteria might be blank and mongo won't accept an empty sort criteria
        const aggregationQuery = [
            { $match: matchCriteria }
        ]
        // add sort criteria if its not empty
        if (Object.keys(sortCriteria).length) {
            aggregationQuery.push({ $sort: sortCriteria });
        }

        console.log('Sorting by:');
        console.log(sortCriteria);
        console.log('Matching only:');
        console.log(matchCriteria);

        // get list of beers matching the aggregation:
        const beers = await Beer.aggregate(aggregationQuery);

        res.render('beerReviews', {
            beers: beers,
            schema: Beer.schema.obj,
            title: 'All Beer Reviews'
        })
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}


/////// API ROUTES ////////

// get details of one beer and send json object
exports.getBeer = async (req, res, next) => {
    try {
        const beer = await Beer.findOne({ slug: req.params.slug }).populate('brewery');
        console.log(`Got beer data for ${req.params.slug}`);
        res.json({ beer });
    }
    catch(err) {
        console.log(err);
        res.json({'error': `Could not get beer info for ${req.params.slug}`});
        next(err);
    }
}