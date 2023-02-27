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
    // returns more than just the trianlgeTest object
    const triangleTestInfo = await TriangleTest.findOneAndUpdate(
      { token: req.body.token },
      req.body,
      {
        upsert: true,
        new: true,
        rawResult: true,
      }
      ).exec();

      // add new triangleTest to the req.body
      req.body.triangleTest = triangleTestInfo.value;

    console.log(`Successfully updated/created triangleTest for token ${triangleTestInfo.value.token} in article ${req.body.article.title}`);
    req.flash('success', `Successfully created Triangle Test!`);

    next();
  } 
  catch (err) {
    console.log(err);
    next(err);
  }
};

exports.displaySuccessfulTriangleTest2 = async (req, res, next) => {
  console.log(`Running displaySuccessfulTriangleTest for article ${req.params.article_num} and test ${req.params.token}`);

  try {
    const triangleTest = await TriangleTest.findOne({token: +req.params.token});
  
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

// show the success screen after a triangle test was successfully created/updated
// requires a triangle test object to be in req.body.triangleTest and an article object in req.body.article
exports.displaySuccessfulTriangleTest = (req, res) => {
  console.log('Running displaySuccessfulTriangleTest')
  // req.body.triangleTest = await TriangleTest.findOne({_id: req.params.id })
  
  // req.body.article = await Article.findOne({_id: req.body.triangleTest.article})
  const triangleKey = req.body.article.triangle_key.find(key => key.token === req.body.triangleTest.token)

  res.render('successfulTriangleTest', {
    title: 'Success!',
    triangleTest: req.body.triangleTest,
    triangleKey
  })
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


// turn the text from the tags input into an array of tags
// function parseList(commaSeperatedList) {
//     const listArray = commaSeperatedList.split(', ').map(tag => tag.toLowerCase());
//     return listArray;
// }

// exports.editArticle = async (req, res, next) => {
//     console.log(`Running editArticle on ${req.params.slug}`);
//     try {
//         const slug = req.params.slug;
//         const article = await Article.findOne({ slug: slug });
//         res.render('addArticle', {
//              title: 'Update Article',
//              article: article
//         });
//     }
//     catch(err) {
//         next(err);
//     }
// }

// // create or update an article instance
// exports.createOrUpdateArticle = async (req, res, next) => {
//     console.log(`Running createOrUpdateArticle: ${req.params.id}`);
//     try {
//         req.body.slug = slug(req.body.title);

//         // if no photos were attached, just ignore those fields
//         // i.e. don't overwrite the existing images with nothing
//         if (req.body.showcase_img === 'undefined') delete req.body.showcase_img;
//         if (req.body.photos.length === 0) delete req.body.photos;

//         const articleInfo = await Article.findOneAndUpdate(
//             { _id: req.params.id },
//             req.body,
//             {
//                 upsert: true,
//                 new: true,
//                 rawResult: true,
//                 runValidators: true,
//             }
//         ).exec();

//         console.log(`Updated/created ${articleInfo.value.title}`);
//         req.flash('success', `Successfully created/updated ${articleInfo.value.title}`);

//         // if the article was updated instead of created from scratch:
//         if (!articleInfo.upserted) {
//             // articleInfo.value.save();
//             res.redirect(`/articles/${articleInfo.value.slug}`)
//         }
//         // if the article was upserted:
//         else {
//             res.redirect(`/articles/${articleInfo.value.slug}/edit`);
//         }

//         // res.json({article})
//     }
//     catch(err) {
//         console.log(err);
//         next(err);
//     }
// }

// exports.displayArticle = async (req, res, next) => {
//     try {
//         const article = await Article.findOne({slug: req.params.slug});
//         res.render('article', {
//             title: article.title,
//             article: article
//        });
//     }
//     catch(err) {
//         console.log(err);
//         next(err);
//     }
// }
