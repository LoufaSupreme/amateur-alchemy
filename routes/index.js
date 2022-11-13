const express = require('express');
const router = express.Router();
const beerController = require('../controllers/beerController');

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


////// API ROUTES //////

module.exports = router;
