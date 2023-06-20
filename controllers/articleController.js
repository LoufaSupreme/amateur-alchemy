const mongoose = require('mongoose');
const Article = mongoose.model('Article');  // schema from Article.js
const multer = require("multer"); // package for uplaoding multiple files.  Needed since our _storeForm.pug has a form w/ enctype=multipart/form-data
const sharp = require("sharp"); // for image uploads
const uuid = require("uuid"); // helps with making unique file names for uploaded files (to avoid duplicates)
const slug = require('slugs');
// stat calculations for p_value and binomial distribution
const stats = require('.././helpers/statistics.js');
const s3 = require('.././helpers/s3.js');


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

// sizes to resize images to
const imageSizes = [
    {
        size: 'med',
        height: 1500,
        width: undefined,
    },
    {
        size: 'small',
        height: 200,
        width: 200,
    }
]

exports.uploadToMemory = multer(multerOptions).fields([
    { name: 'showcase_img' },
    { name: 'photos' }
]);

// rename and resize images
exports.resize = async (req, res, next) => {
    console.log('Resizing files');
    try {
        // check if there is no new files to resize
        if (!req.files) return next(); // skip to next middleware

        req.body.photos = [];
        const modifiedFiles = [];

        for (const fileInput in req.files) {
            for (const file of req.files[fileInput]) {
                
                // randomly name file
                const fileNamePrefix = `${file.originalname.split('.')[0]}_${uuid.v4()}`;
                // get the type of image
                const fileExtension = file.mimetype.split('/')[1];
    
                // create a new unique name for the image
                const fileName = `${fileNamePrefix}.${fileExtension}`;

                if (fileInput === 'showcase_img') {
                    req.body.showcase_img = fileName;
                }
                else req.body.photos.push(fileName); 

                // rename original file
                file.newFileName = fileName;

                // RESIZE
                // original file size
                const large = file;
                modifiedFiles.push(large);

                for (const size of imageSizes) {
                    const buffer = await sharp(file.buffer).resize({
                        width: size.width,
                        height: size.height,
                        fit: "cover",
                        position: "centre",
                    }).toBuffer();

                    modifiedFiles.push({
                        newFileName: `${fileNamePrefix}_${size.size}.${fileExtension}`,
                        buffer: buffer,
                        mimetype: file.mimetype 
                    })
                }
            }
        }

        req.body.modifiedFiles = modifiedFiles;
        next();
    }
    catch(err) {
        req.error = err;
        next(err);
    }
}

// uploads the resized files to AWS S3
// requires req.body.modifiedFiles array
exports.uploadToAWS = async (req, res, next) => {
    console.log('Uploading images to AWS');
    try {
        if (!req.body.modifiedFiles) return next();

        for (const file of req.body.modifiedFiles) {
            s3.uploadFile(file)
        }
        return next();
    }
    catch(err) {
        console.error(err);
        next(err);
    }
}

exports.sendBrowserResponse = (req, res) => {
    console.log('Running sendBrowserResponse');
    res.sendStatus(200);
}

// get image buffer from AWS
// requires imgName in req.params
exports.getImageBuffer = async (req, res, next) => {
    console.log('Getting image buffer');
    try {
        const imgBuffer = await s3.getImageBuffer(req.params.imgName);
        req.imgBuffer = imgBuffer;
        next();
    }
    catch(err) {
        console.error(err);
        next(err);
    }
}

// rotate image using buffer
// requires imgBuffer on req, imgName in req.params and angle in req.params
exports.rotateImage = async (req, res, next) => {
    console.log(`Rotating image by ${req.params.angle} degrees`);
    try {
        const modifiedFiles = [];

        const fileName = req.params.imgName.split('.')[0];
        const fileExtension = req.params.imgName.split('.')[1];

        // original file size:
        const buffer = await sharp(req.imgBuffer).rotate(
            +req.params.angle, 
            { background: { r: 0, g: 0, b: 0, alpha: 0 }
        }).toBuffer();

        const rotatedImg = {
            newFileName: `${fileName}.${fileExtension}`,
            buffer: buffer,
            mimetype: `image/${fileExtension}`
        }

        modifiedFiles.push(rotatedImg);

        // other file sizes:
        for (const size of imageSizes) {
            const buffer = await sharp(req.imgBuffer)
                .rotate(
                    +req.params.angle, 
                    { background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .resize({
                    width: size.width,
                    height: size.height,
                    fit: "cover",
                    position: "centre",
                })
                .toBuffer();

            const rotatedImg = {
                newFileName: `${fileName}_${size.size}.${fileExtension}`,
                buffer: buffer,
                mimetype: `image/${fileExtension}`
            }

            modifiedFiles.push(rotatedImg);
        }

        req.body.modifiedFiles = modifiedFiles;
        next();
    }
    catch(err) {
        console.error(err);
        next(err);
    }
}

// deletes an image from the database
// requires imgName in req.params and slug in req.params
exports.deleteImage = async (req, res, next) => {
    console.log(`Deleting image ${req.params.imgName}`);
    try {
        // delete from s3
        s3.deleteFile(req.params.imgName);
        for (const size of imageSizes) {
            const [fileName, fileExt] = req.params.imgName.split(".");
            const img = `${fileName}_${size.size}.${fileExt}`;
            s3.deleteFile(img);
        }

        // check if the image was a showcase_img
        // remove image from db article instance
        if (req.body.isShowcase) {
            await Article.findOneAndUpdate(
                { slug: req.params.slug },
                { $unset: { showcase_img: "" } },
                { returnNewDocument: true }
            ).exec();
        }
        // if its not showcase, then its just in the photos array
        else {
            await Article.findOneAndUpdate(
                { slug: req.params.slug },
                { $pull: { photos: req.params.imgName } },
                { returnNewDocument: true }
            ).exec();
        }

        // return success msg
        res.json({status: "success", message: `${req.params.imgName} deleted successfully.`});
    }
    catch(err) {
        console.error(err);
        res.json({status: "error", message: err.message});
    }
}

// display all article cards
exports.articles = async (req, res, next) => {
    console.log('Running articles');
    try {
        const articles = await Article.find().sort({ date_created: -1 });
        
        res.render('articles', { 
            title: 'Articles',
            articles
        });
    }
    catch(err) {
        console.error(err);
        next(err);
    }
}

// render the add article page 
exports.addArticle = (req, res) => {
    console.log('Running addArticle');
    res.render('addArticle', { title: 'Add Article' });
}

// turn the text from the tags input into an array of tags
function parseTags(rawTags) {
    const tagsArray = rawTags !== "" ? rawTags.split(', ').map(tag => tag.toLowerCase()) : [];
    return tagsArray;
}

// displays the edit article page
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
        req.body.tags = parseTags(req.body.tags);
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

// NO LONGER USED. s3 BUCKET CHANGED TO PUBLIC
// request a signed private url from aws s3 for an image
// requires the image name in req.params
// exports.getImageUrl = async (req, res, next) => {
//     try {
//         const url = await s3.getImageURL(req.params.url);
//         res.json(url);
//     }
//     catch(err) {
//         console.error(err);
//         next(err);
//     }
// }

// update an article instance
// requires article id in req.params
exports.updateArticle = async (req, res, next) => {
    console.log(`Running updateArticle on article ${req.params.id}`);
    try {

        // update slug based on title
        req.body.slug = slug(req.body.title);

        // split tags list into array of tags
        req.body.tags = parseTags(req.body.tags);

        const photos = req.body.photos;
        delete req.body.photos;
        
        // if no showcase photo was attached, just ignore that field
        // i.e. don't overwrite the existing image with nothing
        if (req.body.showcase_img === 'undefined') delete req.body.showcase_img;

        const articleInfo = await Article.findOneAndUpdate(
            { _id: req.params.id },
            [
                { $set: req.body },
                // add any new images to the existing array of images
                { $set: { photos: { $concatArrays: ['$photos', [...photos]] } } }
            ],
            {
                new: true,
                rawResult: true,
                runValidators: true,
            }
        ).exec();
        
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
        
        req.body.article = article;

        // TODO: delete all associated triangle tests

        req.flash('success', `Article successfully deleted`);
        next();
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// delete any photos associated with a deleted article
// requires article instance on req.body.article
exports.deletePhotos = async (req, res, next) => {
    try {
        const article = await Article.findOne({ _id: req.params.id });
        req.body.article = article;
        
        const photos = [article.showcase_img, ...article.photos];

        for (const photo of photos) {
            const fileExt = photo.split('.').pop();
            const fileName = photo.replace(/\.[^/.]+$/, "");
            
            s3.deleteFile(photo);
            s3.deleteFile(`${fileName}_med.${fileExt}`);
            s3.deleteFile(`${fileName}_small.${fileExt}`);
        }

        res.redirect('back');

    }
    catch(err) {
        console.error(err);
        next(err);
    }
}

// add a triangleTest to an existing article
// needs to have article_id in req.params
exports.appendTriangleTest = async (req, res, next) => {
    console.log(`Running appendTriangleTest to article ${req.params.article_num}`);
    try {
        const article = await Article.findOneAndUpdate(
            { _id: req.params.article_id },
            { $addToSet: { triangle_tests: req.body.triangleTest } },
            { returnNewDocument: true }
        ).exec();

        // update the article on the req object to
        req.body.article = article;

        // next();
        res.redirect(`/articles/${article.article_num}/triangle-tests/${req.body.triangleTest.token}/thanks`);
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
// requires an article num in req.params.article_num
exports.getArticleByNum = async (req, res, next) => {
    console.log(`Running getArticleByNum on article_num ${req.params.article_num}`);
    try {
        const article = await Article.findOne({ article_num: +req.params.article_num });

        if (!article) throw new Error(`Article ${req.params.article_num} not found.`);

        req.body.article = article;
        return next();
    }
    catch(err){
        console.log(err);
        next(err);
    }
}

// check if article exists with a given id
// requires an article id in req.params.article_id
exports.getArticleByID = async (req, res, next) => {
    console.log(`Running getArticleByID on ID ${req.params.article_id}`);
    try {
        const article = await Article.findOne({ _id: req.params.article_id });

        if (!article) throw new Error(`Article ${req.params.article_id} not found.`);

        req.body.article = article;
        return next();
    }
    catch(err){
        console.log(err);
        next(err);
    }
}

// display add key form
exports.addKey = async (req, res, next) => {
    console.log(`Running addKey for article num ${req.params.article_num}`);

    try {
        const article = await Article.findOne(
            { article_num: req.params.article_num },
        );
        const triangle_key = article.triangle_key.sort((a,b) => {
            return +a.token - +b.token;
        })
        res.render('addKey', {
            title: 'Add Triangle Test Key',
            article,
            triangle_key
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

        const updateResults = await Article.updateOne(
            { _id: req.params.article_id },
            { $set: 
                { 
                    "triangle_key": req.body.key, 
                } 
            },
        );
        


        // // add or update each token/unique_beer pair to the article key
        // for (const inputSet of req.body.key) {
        //     const updateResults = await Article.updateOne(
        //         { _id: req.params.article_id },
        //         { $set: 
        //             { 
        //                 "triangle_key.$[elem].token": inputSet.token, 
        //                 "triangle_key.$[elem].unique_beer": inputSet.unique_beer, 
        //                 "triangle_key.$[elem].unique_cup": inputSet.unique_cup, 
        //             } 
        //         },
        //         {
        //             arrayFilters: [ { "elem.token": { $eq: inputSet.token } } ]
        //         }
        //     );

        //     // if it couldn't update it (didn't find a match), then push a new one.
        //     if (updateResults.modifiedCount === 0) {
        //         await Article.updateOne(
        //             { _id: req.params.article_id },
        //             { $push: { triangle_key: { 
        //                 token: inputSet.token, 
        //                 unique_beer: inputSet.unique_beer,
        //                 unique_cup: inputSet.unique_cup,
        //             } } }
        //         )
        //     }
        // }

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
// params: article_id
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
        let significanceThreshold = stats.calcCriticalCorrect(binomialDistribution, 0.05);

        // if there are less than 3 responses, the required p_val to be statistically significant doesn't exist, and so is calculated to be NaN.  This fails the mongoDb validation for a number. So, set it to -1.
        if (isNaN(significanceThreshold.p_val)) significanceThreshold.p_val = -1;

        // update the article stats
        article.stats.p_val = p_val;
        article.stats.binomialDistribution = binomialDistribution;
        article.stats.significance_threshold = significanceThreshold;
        await article.save();

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
        const article = await Article.findOne({ slug: req.params.slug }).populate('triangle_tests');
        
        res.render('triangleTestResults', {
            title: "Triangle Test Results", 
            article
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

// @param req.params.slug
exports.findArticleBySlug = async (req, res, next) => {
    console.log(`Running findArticleBySlug for ${req.params.slug}`);
    try {
        if (!req.params.slug) throw new Error('No slug provided');
        
        const article = await Article.findOne({ slug: req.params.slug }).populate('triangle_tests');

        if (!article) throw new Error('No article found!');

        req.body.article = article;
        return next();
    }
    catch(err) {
        console.log(err);
        next(err);
    }
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

// API ROUTE
// get a list of all unique tags from all articles
exports.getUniqueTagList = async (req, res, next) => {
    console.log('Running getUniqueTagList');
    try {
        const articles = await Article.find();
        const uniqueTagList = articles.reduce((acc, curr) => {
            for (const tag of curr.tags) {
                acc.add(tag);
            }
            return acc;
        }, new Set())

        // have to convert the set to array to jsonify it
        res.json([...uniqueTagList]);
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}
