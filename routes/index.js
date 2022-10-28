const express = require('express');
const router = express.Router();
const beerController = require('../controllers/beerController');

router.get('/', beerController.getBeers);
router.get('/editBeer', beerController.editBeer);
router.post('/editBeer', beerController.createBeer)

////// API ROUTES //////

module.exports = router;
