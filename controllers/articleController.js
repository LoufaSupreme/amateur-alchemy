const mongoose = require('mongoose');
const Article = mongoose.model('Article');  // schema from Article.js
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

exports.upload = multer(multerOptions).fields([
    { name: 'showcase_img' },
    { name: 'photos' }
]);

exports.resize = async (req, res, next) => {
    try {
        // check if there is no new files to resize
        if (!req.files) {
            next(); // skip to next middleware
            return;
        }

        req.body.photos = [];
        for (const fileInput in req.files) {
            for (const file of req.files[fileInput]) {
                // get the type of image
                const fileExtension = file.mimetype.split('/')[1]; 
    
                // create a new unique name for the image
                const fileName = `${uuid.v4()}.${fileExtension}`;

                if (fileInput === 'showcase_img') {
                    req.body.showcase_img = fileName;
                }
                else req.body.photos.push(fileName); 
    
                // // resize photo:
                // // pass in image buffer to jimp
                const photo = await jimp.read(file.buffer);
                // console.log(photo)
    
                await photo.resize(800, jimp.AUTO); // length and width
                
                // // write photo into uploads folder
                await photo.writeAsync(`./public/uploads/${fileName}`);  // save the resized image to the public folder 
            }
        }
        
        next(); 
    }
    catch(err) {
        req.error = err;
        next(err);
    }
}

// render the add article page 
exports.addArticle = (req, res) => {
    console.log('Running addArticle');
    res.render('addArticle', { title: 'Add Article' });
}

// turn the text from the tags input into an array of tags
function parseList(commaSeperatedList) {
    const listArray = commaSeperatedList.split(', ').map(tag => tag.toLowerCase());
    return listArray;
}

exports.editArticle = async (req, res, next) => {
    console.log(`Running editArticle on ${req.params.slug}`);
    try {
        const slug = req.params.slug;
        const article = await Article.findOne({ slug: slug });
        res.render('addArticle', {
             title: 'Update Article', 
             article: article 
        });
    }
    catch(err) {
        next(err);
    }
}

// create or update an article instance
exports.createOrUpdateArticle = async (req, res, next) => {
    console.log('Running createOrUpdateArticle');
    try {
        req.body.slug = slug(req.body.title);

        // if no photos were attached, just ignore those fields
        // i.e. don't overwrite the existing images with nothing
        if (req.body.showcase_img === 'undefined') delete req.body.showcase_img;
        if (req.body.photos.length === 0) delete req.body.photos;
        const article = await Article.findOneAndUpdate(
            { title: req.body.title },
            req.body,
            {
                upsert: true,
                new: true,
                runValidators: true,
            }
        ).exec();

        article.save();
        console.log(`Updated/created ${article.title}`);
        req.flash('success', `Successfully created/updated ${article.title}`);
        // res.redirect(`/articles/${article.slug}/edit`);
        // res.render('addArticle', { title: 'Update Article'})
        res.json({article})
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// // creates a new article instance in db
// exports.createArticle = async (req, res, next) => {
//     console.log('Running createArticle');
//     try {
//         console.log(req.body)
//         req.body.tags = parseList(req.body.tags);
//         req.body.google_data.tags = parseList(req.body.google_data["tags"]);
//         req.body.google_data.images = parseList(req.body.google_data["images"]);
//         if (isComplete(req)) req.body.completed = true;
//         const brewery = new Brewery(req.body);
//         const savedBrewery = await brewery.save();
//         console.log('New Brewery created');
//         req.flash('success', `Successfully created ${brewery.name}`)
//         res.redirect(`/breweries/${savedBrewery.slug}`)
//     }
//     catch(err) {
//         next(err);
//     }
// }

// renders the addBrewery page with preloaded brewery info
// exports.editBrewery = async (req, res, next) => {
//     try {
//         const brewery_slug = req.params.slug;
//         const brewery = await Brewery.findOne({ slug: brewery_slug });

//         res.render('addBrewery', {
//             title: `Edit ${brewery.name}`,
//             brewery: brewery,
//         });
//     }
//     catch(err) {
//         console.log(err);
//         next(err);
//     }
// }

// // updates existing beer instance in db
// exports.updateBrewery = async (req, res, next) => {
//     console.log('Running updateBrewery');
//     try {
//         req.body.tags = parseList(req.body.tags);

//         req.body.google_data.tags = parseList(req.body.google_data["tags"]);
//         req.body.google_data.images = parseList(req.body.google_data["images"]);
//         req.body.slug = slug(req.body.name);
//         // check if all fields are filled out:
//         if (isComplete(req)) req.body.completed = true;
//         // update the location type since mongo's findOneAndUpdate method doesn't take into account the Schema defaults
//         req.body.location.type = "Point";
//         req.body.lastUpdated = Date.now();

//         const brewery = await Brewery.findOneAndUpdate(
//             { _id: req.params.id }, 
//             {
//                 $inc: { updateCount: 1 },
//                 $set: req.body
//             },
//             {
//                 new: true, // return newly updated obj, not the old unupdated version
//                 runValidators: true, // forces validation of the options set in the Schema model, e.g. required:true for name and trim:true for description, etc
//             }).exec(); // run the query

//         req.flash('success', `Successfully updated <strong>${brewery.name}</strong>`);
//         res.redirect(`/breweries/${brewery.slug}`);
//     }
//     catch(err) {
//         console.log(err);
//         next(err);
//     }
// }

