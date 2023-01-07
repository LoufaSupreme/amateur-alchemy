const express = require('express');
const router = express.Router();
const beerController = require('../controllers/beerController');
const breweryController = require('../controllers/breweryController');
const articleController = require('../controllers/articleController');

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

// add new article
router.get('/add-article', articleController.addArticle);
router.post('/add-article', 
    articleController.upload,
    articleController.resize,    
    articleController.createOrUpdateArticle
)

// update article
router.post('/add-article/:id',
    articleController.upload,
    articleController.resize,    
    articleController.createOrUpdateArticle,
)

// update existing article
router.get('/articles/:slug/edit', articleController.editArticle);
router.post('add-article/:id', 
    articleController.upload,
    articleController.resize,
    articleController.createOrUpdateArticle    
)

// display article
router.get('/articles/:slug', articleController.displayArticle);

////// API ROUTES //////

// delete a beer review
router.post('/api/beer-reviews/:id/delete', beerController.deleteReview);

// get the details for one beer
router.get('/api/get-beer/:slug', beerController.getBeer);

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
