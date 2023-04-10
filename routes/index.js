const express = require('express');
const router = express.Router();
const beerController = require('../controllers/beerController');
const breweryController = require('../controllers/breweryController');

// home page
router.get('/', beerController.home);


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


////// API ROUTES //////

// search for all breweries matching a user input query
router.get('/api/search/breweries', breweryController.searchBreweries);

// search for all breweries near a user inputted location
router.get('/api/breweries/near', breweryController.mapBreweries);

// get a list of all the breweries (json):
router.get('/api/breweries/all', breweryController.getAllBreweries);



module.exports = router;
