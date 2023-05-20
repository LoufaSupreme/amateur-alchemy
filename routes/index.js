const express = require('express');
const router = express.Router();
const beerController = require('../controllers/beerController');
const articleController = require('../controllers/articleController');

// home page
router.get('/', beerController.home);

module.exports = router;
