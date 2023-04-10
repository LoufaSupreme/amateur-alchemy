const express = require('express');
const router = express.Router();
const beerController = require('../controllers/beerController');

// all routes below are prefixed with '/reviews'

// show all beer review cards
router.get('/', beerController.displayReviews);

// display form to add a new beer review
router.get('/new', beerController.addBeer);

// create a new beer review
router.post('/new', 
    beerController.uploadMedia, 
    beerController.resizeImage, 
    beerController.createBeer
);

// display one beer review
router.get('/:slug', beerController.displayReview);

// display form to update existing beer review
router.get('/:slug/edit', beerController.editBeer);

// update an existing beer review
router.post('/new/:id',
    beerController.uploadMedia, 
    beerController.resizeImage, 
    beerController.updateBeer
);

// delete a beer review
router.post('/reviews/:id/delete', beerController.deleteReview);

// get the details for one beer
router.get('/api/get/:slug', beerController.getBeer);

module.exports = router;