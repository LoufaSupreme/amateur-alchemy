const mongoose = require('mongoose');
const TriangleTest = mongoose.model('TriangleTest');  // schema
const { getArticleByNum } = require('./articleController.js');

// render the add triangleTest page 
exports.addTriangleTest = async (req, res, next) => {
    console.log('Running addTriangleTest');
    
    try {
        const article = await getArticleByNum(req, res);
        if (!article) throw new Error('Article not found');
        res.render('addTriangleTest', { title: 'Add Triangle Test' , article: article, schema: TriangleTest.schema.obj});
    }
    catch(err) {
        console.log(err);
        next(err);
    }
    
}

// turn the text from the tags input into an array of tags
// function parseList(commaSeperatedList) {
//     const listArray = commaSeperatedList.split(', ').map(tag => tag.toLowerCase());
//     return listArray;
// }

// exports.editArticle = async (req, res, next) => {
//     console.log(`Running editArticle on ${req.params.slug}`);
//     try {
//         const slug = req.params.slug;
//         const article = await Article.findOne({ slug: slug });
//         res.render('addArticle', {
//              title: 'Update Article', 
//              article: article 
//         });
//     }
//     catch(err) {
//         next(err);
//     }
// }

// // create or update an article instance
// exports.createOrUpdateArticle = async (req, res, next) => {
//     console.log(`Running createOrUpdateArticle: ${req.params.id}`);
//     try {
//         req.body.slug = slug(req.body.title);

//         // if no photos were attached, just ignore those fields
//         // i.e. don't overwrite the existing images with nothing
//         if (req.body.showcase_img === 'undefined') delete req.body.showcase_img;
//         if (req.body.photos.length === 0) delete req.body.photos;

//         const articleInfo = await Article.findOneAndUpdate(
//             { _id: req.params.id },
//             req.body,
//             {
//                 upsert: true,
//                 new: true,
//                 rawResult: true,
//                 runValidators: true,
//             }
//         ).exec();
        
//         console.log(`Updated/created ${articleInfo.value.title}`);
//         req.flash('success', `Successfully created/updated ${articleInfo.value.title}`);

//         // if the article was updated instead of created from scratch:
//         if (!articleInfo.upserted) {
//             // articleInfo.value.save();
//             res.redirect(`/articles/${articleInfo.value.slug}`)
//         }
//         // if the article was upserted:
//         else {
//             res.redirect(`/articles/${articleInfo.value.slug}/edit`);
//         }

//         // res.json({article})
//     }
//     catch(err) {
//         console.log(err);
//         next(err);
//     }
// }

// exports.displayArticle = async (req, res, next) => {
//     try {
//         const article = await Article.findOne({slug: req.params.slug});
//         res.render('article', {
//             title: article.title, 
//             article: article 
//        });
//     }
//     catch(err) {
//         console.log(err);
//         next(err);
//     }
// }
