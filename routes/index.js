const express = require('express');
const router = express.Router();
const beerReviewController = require('../controllers/beerReviewController');

router.get('/', beerReviewController.getBeerReviews);

////// API ROUTES //////

module.exports = router;
