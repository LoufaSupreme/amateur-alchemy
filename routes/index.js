const express = require('express');
const router = express.Router();
const beerController = require('../controllers/beerController');
const breweryController = require('../controllers/breweryController');
const articleController = require('../controllers/articleController');
const triangleTestController = require('../controllers/triangleTestController');

// home page
router.get('/', beerController.home);

// add new beer review
router.get('/add-beer', beerController.addBeer);
router.post('/add-beer', 
    beerController.uploadMedia, 
    beerController.resizeImage, 
    beerController.createBeer
);

// display one beer review
router.get('/beer-reviews/:slug', beerController.displayReview);

// update existing beer review
router.get('/beer-reviews/:slug/edit', beerController.editBeer);
router.post('/add-beer/:id',
    beerController.uploadMedia, 
    beerController.resizeImage, 
    beerController.updateBeer
);

// show all beer reviews
router.get('/beer-reviews', beerController.displayReviews);

// add new brewery
router.get('/add-brewery', breweryController.addBrewery);
router.post('/add-brewery', 
    breweryController.upload,
    breweryController.resize,
    breweryController.createBrewery,
);

// display all breweries
router.get('/breweries', breweryController.displayBreweries);

// display brewery page
router.get('/breweries/:slug', breweryController.displayBrewery);

// update existing brewery
router.get('/breweries/:slug/edit', breweryController.editBrewery);
router.post('/add-brewery/:id',
    breweryController.upload, 
    breweryController.resize, 
    breweryController.updateBrewery
);

// go to add new article page
router.get('/add-article', articleController.addArticle);

// create new article in db
router.post('/add-article', 
    articleController.upload,
    articleController.resize,    
    articleController.createArticle
)

// update existing article
// display form to create or edit article
router.get('/articles/:slug/edit', articleController.editArticle);

// update article and apply changes to db and reroute
router.post('/add-article/:id', 
    articleController.upload,
    articleController.resize,
    articleController.updateArticle    
)

// display article
router.get('/articles/:slug', articleController.displayArticle);

// display form to create new triangleTest for an article/experiment
router.get('/articles/:article_num/triangle-test',
    triangleTestController.addTriangleTest
);

// create a new triangleTest in the db
router.post('/articles/:article_num/triangle-test', 
    triangleTestController.createOrUpdateTriangleTest,
);

// display form to create a new triangleTest key for an article
router.get('/articles/:article_num/triangle-test-key', 
    articleController.addKey
)

// save new triangle test key to the article
router.post('/articles/:article_id/key',
    articleController.createOrUpdateKey,
    triangleTestController.addUniqueBeer
)

// display form to create a new beer key
router.get('/articles/:id/beer-key', articleController.addBeerKey)

// create or update an beer key for an article
router.post('/articles/:id/beer-key', 
    articleController.createOrUpdateBeerKey
)

// display raw graphs for an article's triangle tests
router.get('/articles/:slug/triangle-test-results', articleController.displayTriangleTestResults);

////// API ROUTES //////

// delete a beer review
router.post('/api/beer-reviews/:id/delete', beerController.deleteReview);

// delete a beer review
router.post('/api/articles/:id/delete', articleController.deleteArticle);

// get the details for one beer
router.get('/api/get-beer/:slug', beerController.getBeer);

// get the details for one article
router.get('/api/get-article/:slug', articleController.getArticleBySlug);

// search for all breweries matching a user input query
router.get('/api/search/breweries', breweryController.searchBreweries);

// search for all breweries near a user inputted location
router.get('/api/breweries/near', breweryController.mapBreweries);

// get a list of all the breweries (json):
router.get('/api/breweries/all', breweryController.getAllBreweries);

// create new article if needed and upload images to article
// router.post('/api/articles/upload', 
//     articleController.upload,
//     articleController.resize,    
//     articleController.createOrUpdateArticle
// )


module.exports = router;
