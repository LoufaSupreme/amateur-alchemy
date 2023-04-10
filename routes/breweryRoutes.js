const express = require('express');
const router = express.Router();
const breweryController = require('../controllers/breweryController');

// add new brewery
router.get('/new', breweryController.addBrewery);
router.post('/new', 
    breweryController.upload,
    breweryController.resize,
    breweryController.createBrewery,
);

// display all breweries
router.get('/', breweryController.displayBreweries);

// display brewery page
router.get('/:slug', breweryController.displayBrewery);

// update existing brewery
router.get('/:slug/edit', breweryController.editBrewery);
router.post('/new/:id',
    breweryController.upload, 
    breweryController.resize, 
    breweryController.updateBrewery
);

// search for all breweries matching a user input query
router.get('/api/search', breweryController.searchBreweries);

// search for all breweries near a user inputted location
router.get('/api/near', breweryController.mapBreweries);

// get a list of all the breweries (json):
router.get('/api/all', breweryController.getAllBreweries);

module.exports = router;