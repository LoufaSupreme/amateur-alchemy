const mongoose = require("mongoose");
const TriangleTest = mongoose.model("TriangleTest"); // schema

// render the add triangleTest page
// requires an article obj on req.body.article
exports.addTriangleTest = async (req, res, next) => {
  console.log("Running addTriangleTest");

  res.render("addTriangleTest", {
    title: "New Triangle Test",
    article_num: req.params.article_num,
    schema: TriangleTest.schema.obj,
  });
};

// create a new or update an existing triangleTest instance
// requires an article obj on req.body.article
exports.createOrUpdateTriangleTest = async (req, res, next) => {
  console.log(
    `Running createOrUpdateTriangleTest for article ${req.body.article.article_num}`
  );

  try {
    // returns more than just the triangleTest object
    const triangleTestInfo = await TriangleTest.findOneAndUpdate(
      { 
        token: req.body.token,
        article: req.body.article 
      },
      req.body,
      {
        upsert: true,
        new: true,
        rawResult: true,
      }
      ).exec();

      const triangleTest = triangleTestInfo.value;
      const flaws = Object.entries(triangleTest.flaws);
      for (const [flaw, beers] of flaws) {
        if (beers[0] === 'all') {
          triangleTest.flaws[flaw] = ['unique', 'other'];
        }
      }
      triangleTest.save();

      // add new triangleTest to the req.body
      req.body.triangleTest = triangleTest;

    console.log(`Successfully updated/created triangleTest for token ${triangleTestInfo.value.token} in article ${req.body.article.title}`);

    next();
  } 
  catch (err) {
    console.log(err);
    next(err);
  }
};

// show the success screen after a triangle test was successfully created/updated
// requires an article object in req.body.article
// requires req.params.token and req.params.article_num
exports.displaySuccessfulTriangleTest = async (req, res, next) => {
  console.log(`Running displaySuccessfulTriangleTest for article ${req.params.article_num} and test ${req.params.token}`);

  try {
    const triangleTest = await TriangleTest.findOne({
      token: +req.params.token,
      article: req.body.article
    });

    if (!triangleTest) throw new Error(`No Triangle Test found for token ${req.params.token} and article ${req.params.article_num}`);
  
    const triangleKey = req.body.article.triangle_key.find(key => key.token === triangleTest.token);

    res.render('successfulTriangleTest', {
      title: 'Success!',
      triangleTest,
      triangleKey
    })
  }
  catch(err) {
    console.log(err);
    next(err);
  }
}

// update or create triangle test with the actual unique beer cup letter from an article's key
// needs an array of {token: 1, unique_beer: A} objects in req.body.key
// needs article instance to be on req.article
exports.addUniqueBeer = async (req, res, next) => {
  console.log('Running "addUniqueBeer" to triangle tests');
  try {
    for (let inputSet of req.body.key) {
      await TriangleTest.findOneAndUpdate(
        { 
          $and: [
            {article: req.article}, 
            {token: inputSet.token},
          ]
        },
        { $set: { 
            "actual_unique.color": inputSet.unique_beer,
            "actual_unique.cup": inputSet.unique_cup,
          } 
        },
        {
          upsert: true,
          new: true,
          rawResult: true,
        }
      ).exec();
    }

    req.flash('succcess', "Successfully added Triangle Test Key!");
    res.redirect('back');
  }
  catch(err) {
    console.log(err);
    next(err);
  }
}