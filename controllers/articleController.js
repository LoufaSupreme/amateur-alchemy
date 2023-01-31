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
    console.log(`Running createOrUpdateArticle: ${req.params.id}`);
    try {
        req.body.slug = slug(req.body.title);

        // if no photos were attached, just ignore those fields
        // i.e. don't overwrite the existing images with nothing
        if (req.body.showcase_img === 'undefined') delete req.body.showcase_img;
        if (req.body.photos.length === 0) delete req.body.photos;

        const articleInfo = await Article.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            {
                upsert: true,
                new: true,
                rawResult: true,
                runValidators: true,
            }
        ).exec();
        
        console.log(`Updated/created ${articleInfo.value.title}`);
        req.flash('success', `Successfully created/updated ${articleInfo.value.title}`);

        // if the article was updated instead of created from scratch:
        if (!articleInfo.upserted) {
            // articleInfo.value.save();
            res.redirect(`/articles/${articleInfo.value.slug}`)
        }
        // if the article was upserted:
        else {
            res.redirect(`/articles/${articleInfo.value.slug}/edit`);
        }

        // res.json({article})
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// add a triangleTest to an existing article
// needs to have "article_num" in the request params and trianlgeTest in req.body 
exports.appendTriangleTest = async (req, res, next) => {
    try {
        const article = await Article.findOneAndUpdate(
            { article_num: req.params.article_num },
            { $addToSet: { triangle_tests: req.body.triangleTest } }
        ).exec();

        return article.value;
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

exports.displayArticle = async (req, res, next) => {
    try {
        const article = await Article.findOne({slug: req.params.slug});
        res.render('article', {
            title: article.title, 
            article: article 
        });
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// check if article exists with a given "article_num"
// note that article_num is different than the mongodb _id
exports.getArticleByNum = async (n) => {
    console.log(`Running getArticleByNum on article_num ${n}`);
    try {
        const article = await Article.findOne({ article_num: n });
        return article;
    }
    catch(err){
        console.log(err);
    }
}

// display add key form
exports.addKey = async (req, res, next) => {
    console.log(`Running addKey for article num ${req.params.article_num}`);

    try {
        const article = await Article.findOne(
            { article_num: req.params.article_num },
        );
        res.render('addKey', {
            title: 'Add Triangle Test Key',
            article: article
        });
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// add a new key to decipher triangle test data
exports.createOrUpdateKey = async (req, res, next) => {
    console.log('Running createOrUpdateKey');
    try {
        // check that something was submitted
        if (!req.body.token || !req.body.unique_beer) {
            req.flash('error', "Nothing submitted!")
            res.redirect('back');
            return;
        }

        // turn the values into arrays if they aren't already
        // check that the amount of tokens matches the amount of unique beers
        const tokens = typeof req.body.token === "object" ? req.body.token : [req.body.token];
        const unique_beers = typeof req.body.unique_beer === "object" ? req.body.unique_beer : [req.body.unique_beer];

        if (tokens.length !== unique_beers.length) {
            throw new Error('Amount of tokens and beers do not match.');
        }

        // gather each token and unique_beer into it's own object
        req.body.key = [];
        for (let i=0; i<tokens.length; i++) {
            req.body.key.push({
                token: tokens[i],
                unique_beer: unique_beers[i]
            });
        }

        // add or update each token/unique_beer pair to the article key
        for (const pair of req.body.key) {
            const updateResults = await Article.updateOne(
                { _id: req.params.article_id },
                { $set: 
                    { 
                        "key.$[elem].token": pair.token, 
                        "key.$[elem].unique_beer": pair.unique_beer 
                    } 
                },
                {
                    arrayFilters: [ { "elem.token": { $eq: pair.token } } ]
                }
            );

            // if it couldn't update it (didn't find a match), then push a new one.
            if (updateResults.modifiedCount === 0) {
                await Article.updateOne(
                    { _id: req.params.article_id },
                    { $push: { key: { 
                        token: pair.token, 
                        unique_beer: pair.unique_beer 
                    } } }
                )
            }
        }

        req.article = await Article.findOne({ _id: req.params.article_id });

        return next();
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

