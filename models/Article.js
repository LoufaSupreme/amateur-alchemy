const mongoose = require('mongoose');
// uses the mongoose-sequence library to automatically increment a field every time a new instance of the model is instantiated
// https://github.com/ramiel/mongoose-sequence
const AutoIncrement = require('mongoose-sequence')(mongoose);
mongoose.Promise = global.Promise;
const slug = require('slugs');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true, //trims uploaded strings before adding to the db
        required: 'Please enter an article title!' // could also just put true, however it is better to put an error msg like this
    },
    article_num: Number, // auto-incremented when a new article is saved
    category: String,
    subcategory: String,
    slug: String,
    tagline: {
        type: String,
        trim: true,
    },
    body: {
        type: String,
        trim: true,
    },
    tags: [String],
    triangle_tests: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'TriangleTest',
        },
    ],
    key: [{
        token: Number,
        unique_beer: String
    }],
    created: {
        type: Date,
        default: Date.now,
    },
    showcase_img: String,
    photos: [String],
    completed: {
        type: Boolean,
        default: false
    },
    lastModified: Date,
    // author: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'User',
    //     required: 'You must supply an author'
    // },
},
// add additional option to display virtual fields data in JSON or as objects.
// without this, virtual fields would still be present, but they wouldn't be displayed when using res.json(), for example. 
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// generate a unique slug from the name
async function setSlug(next) {
    try {
        if (this.slug === slug(this.title)) return next();
        this.slug = slug(this.title);
        // before we save a new Article with this title, check to see if any other articles with that title already exist in database
        // this is important bc the slug is generated by the title, and the slug is used in the URLs for the indivudal Article pages.  So, if the
        // title is the same and the slug is the same, then all articles with the same title will point to the same URL.
        // So... find all the articles with the same title and add a number to the end of the slug to make it unique. 
        const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
        const existingObjsWithSlug = await this.constructor.find({ slug: slugRegEx });
        
        if (existingObjsWithSlug.length) {
            this.slug = `${this.slug}-${existingObjsWithSlug.length + 1}`;
        }
    
        next();
    }
    catch(err) {
        console.log(err);
        next(err);
    }
}

// mongodb indexes:
articleSchema.index({
    title: 'text',
    tags: 'text',
    tagline: 'text'
});


articleSchema.pre('save', setSlug);
articleSchema.plugin(AutoIncrement, {inc_field: 'article_id'});

module.exports = mongoose.model('Article', articleSchema);