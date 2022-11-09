const express = require('express');
const router = express.Router();
const beerController = require('../controllers/beerController');

router.get('/', beerController.getBeers);

router.get('/editBeer', beerController.editBeer);
router.post('/editBeer', beerController.upload, beerController.resize, beerController.createBeer)

router.get('/beer-reviews/:slug', beerController.beerReview)

////// API ROUTES //////

module.exports = router;
