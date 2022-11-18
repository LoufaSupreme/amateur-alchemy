const express = require('express');
const router = express.Router();
const beerController = require('../controllers/beerController');
const breweryController = require('../controllers/breweryController');

// home page
router.get('/', beerController.getBeers);

// add new beer review
router.get('/add-beer', beerController.addBeer);
router.post('/add-beer', 
    beerController.upload, 
    beerController.resize, 
    beerController.createBeer
);

// display beer review
router.get('/beer-reviews/:slug', beerController.displayReview);

// update existing beer review
router.get('/beer-reviews/:slug/edit', beerController.editBeer);
router.post('/add-beer/:id',
    beerController.upload, 
    beerController.resize, 
    beerController.updateBeer
);

// add new brewery
router.get('/add-brewery', breweryController.addBrewery);
router.post('/add-brewery', 
    breweryController.upload,
    breweryController.resize,
    breweryController.createBrewery,
);

// display brewery page
router.get('/breweries/:slug', breweryController.displayBrewery);


////// API ROUTES //////

router.post('/api/beer-reviews/:id/delete', beerController.deleteReview);
router.get('/api/get-beer/:slug', beerController.getBeer);

router.get('/api/search/breweries', breweryController.searchBreweries);


module.exports = router;
