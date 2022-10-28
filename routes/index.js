const express = require('express');
const router = express.Router();
const beerController = require('../controllers/beerController');

router.get('/', beerController.getBeers);

////// API ROUTES //////

module.exports = router;
