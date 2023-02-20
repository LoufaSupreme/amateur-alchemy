const mongoose = require('mongoose');
const Article = mongoose.model('Article');  // schema from Article.js
const multer = require("multer"); // package for uplaoding multiple files.  Needed since our _storeForm.pug has a form w/ enctype=multipart/form-data
const jimp = require("jimp"); // for image uploads
const uuid = require("uuid"); // helps with making unique file names for uploaded files (to avoid duplicates)
const slug = require('slugs');
// stat calculations for p_value and binomial distribution
const stats = require('.././helpers/statistics.js');


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

// create a new article instance
exports.createArticle = async (req, res, next) => {
    console.log('Running createArticle');
    try {
        req.body.slug = slug(req.body.title);
        const article = new Article(req.body);
        await article.save();

        // celebrate
        req.flash('success', `Successfully created ${article.title}`)
        res.redirect(`/articles/${article.slug}`)
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// update an article instance
exports.updateArticle = async (req, res, next) => {
    console.log(`Running updateArticle on article ${req.params.id}`);
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
                new: true,
                rawResult: true,
                runValidators: true,
            }
        ).exec();

        console.log(articleInfo)
        
        console.log(`Updated ${articleInfo.value.title}`);
        req.flash('success', `Successfully updated ${articleInfo.value.title}`);

        res.redirect(`/articles/${articleInfo.value.slug}`)
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// delete article
exports.deleteArticle = async (req, res, next) => {
    console.log(`Running deleteArticle on ${req.params.id}`);
    try {
        const article = await Article.findOneAndDelete({ _id: req.params.id });
        console.log(`${article.name} deleted`);

        // TODO: delete all associated triangle tests

        req.flash('success', `Article successfully deleted`);
        res.redirect('/');
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// add a triangleTest to an existing article
// needs to have "article_num" in the request params and trianlgeTest in req.body 
exports.appendTriangleTest = async (req, res, next) => {
    console.log(`Running appendTriangleTest to article ${req.params.article_num}`);
    try {
        const article = await Article.findOneAndUpdate(
            { article_num: req.params.article_num },
            { $addToSet: { triangle_tests: req.body.triangleTest } },
            { returnNewDocument: true }
        ).exec();

        // update the article on the req object to
        req.body.article = article;

        next();
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

exports.displayArticle = async (req, res, next) => {
    console.log(`Running displayArticle on slug: ${req.params.slug}`)
    try {
        const article = await Article.findOne({slug: req.params.slug});
        if (!article) {
            const err = new Error(`Article Not Found: ${req.path}`);
            err.status = 404;
            throw err;
        }
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
// req.body looks like token_1: '1', unique_beer_1: 'blue', unique_cup_1: 'A',
exports.createOrUpdateKey = async (req, res, next) => {
    console.log('Running createOrUpdateKey');
    try {
        // check that something was submitted
        if (!req.body || !Object.keys(req.body).length) {
            req.flash('error', "Form empty...nothing submitted!")
            res.redirect('back');
            return;
        }

        // amalgamate the results into separate objects and push them to the key array in req.body
        const data = Object.keys(req.body);
        req.body.key = [];
        for (let i = 0; i < data.length; i += 3) {
            const inputSet = {
                token: +req.body[data[i]],
                unique_beer: req.body[data[i+1]],
                unique_cup: req.body[data[i+2]],
            };
            req.body.key.push(inputSet);
        }

        // add or update each token/unique_beer pair to the article key
        for (const inputSet of req.body.key) {
            const updateResults = await Article.updateOne(
                { _id: req.params.article_id },
                { $set: 
                    { 
                        "triangle_key.$[elem].token": inputSet.token, 
                        "triangle_key.$[elem].unique_beer": inputSet.unique_beer, 
                        "triangle_key.$[elem].unique_cup": inputSet.unique_cup, 
                    } 
                },
                {
                    arrayFilters: [ { "elem.token": { $eq: inputSet.token } } ]
                }
            );

            // if it couldn't update it (didn't find a match), then push a new one.
            if (updateResults.modifiedCount === 0) {
                await Article.updateOne(
                    { _id: req.params.article_id },
                    { $push: { triangle_key: { 
                        token: inputSet.token, 
                        unique_beer: inputSet.unique_beer,
                        unique_cup: inputSet.unique_cup,
                    } } }
                )
            }
        }

        // add the article to the req object
        req.article = await Article.findOne({ _id: req.params.article_id });

        return next();
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// display add beer key form
// @param id: the article _id passed by the URL
exports.addBeerKey = async (req, res, next) => {
    console.log(`Running addBeerKey for article id ${req.params.id}`);

    try {
        const article = await Article.findOne(
            { _id: req.params.id },
        );
        res.render('addBeerKey', {
            title: 'Add Beer Key',
            article: article
        });
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// add a new beer key to decipher triangle test data
exports.createOrUpdateBeerKey = async (req, res, next) => {
    console.log(`Running createOrUpdateBeerKey for article id ${req.params.id}`);
    try {
        const update = {};
        for (const key of Object.keys(req.body)) {
            if (req.body[key] !== "") update[key] = req.body[key];
        }
        const article = await Article.findOneAndUpdate(
            { _id: req.params.id },
            { $set: update },
            { new: true }
        );
        req.flash('success', "Successfully created Beer Key!");
        res.redirect(`/articles/${article.slug}`);
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// update stats for statistical significance
// params: req.body.article
exports.updateTriangleTestStatistics = async (req, res, next) => {
    console.log(`Running updateTriangleTestStatistics for ${req.params.slug}`)
    try {
        const article = await Article.findOne({slug: req.params.slug}).populate('triangle_tests'); 

        // calculate statistics to confirm if the triangle test was significant
        const numCorrectTestResponses = article.triangle_tests.filter(test => {
            return test.perceived_unique === test.actual_unique.cup;
        }).length;
        const numTotalTestResponses = article.triangle_tests.length;
        
        const binomialDistribution = stats.calcBinomialDistribution(numTotalTestResponses, 1/3, 2/3);
        const p_val = stats.calcP_val(binomialDistribution, numCorrectTestResponses);
        const significanceThreshold = stats.calcCriticalCorrect(binomialDistribution, 0.05);

        // update the article stats
        article.stats.p_val = p_val;
        article.stats.binomialDistribution = binomialDistribution;
        article.stats.significance_threshold = significanceThreshold;
        article.save();

        next();
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// display graphs for triangle test results
// @param req.params.slug
exports.displayTriangleTestResults = async (req, res, next) => {
    console.log('Running displayTriangleTestResults');
    try {
        const article = await Article.findOne({ slug: req.params.slug });
        res.render('triangleTestResults', {
            title: "Triangle Test Results", article
        });
    }
    catch(err){
        console.log(err);
        next(err);
    }
}

// @param req.params.article_num
exports.qrCode = (req, res) => {
    res.render('articleQrCode', {
        title: "QR Code",
        article_num: req.params.article_num
    })
}

// API Route
// params @req.params.slug
exports.getArticleBySlug = async (req, res, next) => {
    console.log("Running getArticleBySlug");
    try {
        const article = await Article.findOne({ slug: req.params.slug }).populate('triangle_tests');
        res.json(article);
    }
    catch(err){
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

