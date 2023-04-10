const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const triangleTestController = require('../controllers/triangleTestController');

// all routes below are prefixed by "/articles"

// go to add new article page
router.get('/new', articleController.addArticle);

// create new article in db
router.post('/new', 
    articleController.upload,
    articleController.resize,    
    articleController.createArticle
)

// update existing article
// display form to create or edit article
router.get('/:slug/edit', articleController.editArticle);

// update article and apply changes to db and reroute
router.post('/new/:id', 
    articleController.upload,
    articleController.resize,
    articleController.updateArticle    
)

// display article
router.get('/:slug', articleController.displayArticle);

// get the details for one article in JSON
router.get('/api/get/:slug', articleController.getArticleBySlug);

// delete an article
router.post('/:id/delete', articleController.deleteArticle);


//// TRIANGLE TEST KEYS, QR CODE, RESULTS ROUTES //////////////////

// display a QR code that routes to the add triangle test page for an article
// using article_num instead of slug to keep the experiment hidden, and instead of id so that it's easier to type into a browser if needed.
router.get('/:article_num/qr-code', articleController.qrCode)

// display form to create a new beer key
router.get('/:id/beer-key', articleController.addBeerKey)

// create or update an beer key for an article
router.post('/:id/beer-key', 
    articleController.createOrUpdateBeerKey
)

// display form to create a new triangleTest KEY for an article
// using article_num instead of slug to keep the experiment hidden, and instead of id so that it's easier to type into a browser if needed.
router.get('/:article_num/triangle-test-key', 
    articleController.addKey
)

// save new triangle test KEY to the article
router.post('/:article_id/key',
    articleController.createOrUpdateKey,
    triangleTestController.addUniqueBeer
)

// display all the triangle test keys so people can see what's in their cups
router.get('/:slug/triangle-test-key/print', 
    articleController.findArticleBySlug,
    triangleTestController.printTriangleKey
)

// display raw graphs for an article's triangle tests
router.get('/:slug/test-results',
    articleController.updateTriangleTestStatistics,
    articleController.displayTriangleTestResults
);


//// TRIANGLE TEST CREATION, CONFIRMATION ROUTES ////////////

// display form to create new triangleTest for an article/experiment
// using article_num instead of slug to keep the experiment hidden, and instead of id so that it's easier to type into a browser if needed.
router.get('/:article_num/triangle-test',
  articleController.getArticleByNum,  
  triangleTestController.addTriangleTest
);

// create a new triangleTest in the db
router.post('/:article_id/triangle-test',
  articleController.getArticleByID,
  triangleTestController.createOrUpdateTriangleTest,
  articleController.appendTriangleTest,
);

// display the thank you/success page after a triangle test is submitted
router.get('/:article_num/triangle-test/:token/thanks',      
    articleController.getArticleByNum,
    triangleTestController.displaySuccessfulTriangleTest
)


module.exports = router;