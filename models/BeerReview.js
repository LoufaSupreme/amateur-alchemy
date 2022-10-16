const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const beerReviewSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true, //trims uploaded strings before adding to the db
        required: 'Please enter a beer name!' // could also just put true, however it is better to put an error msg like this
    },
    slug: String,
    description: {
        type: String,
        trim: true,
    },
    pH: Number,
    abv: Number,
    ibu_reported: Number,
    ibu_measured: Number,
    finalGravity: Number,
    srm: Number,
    ingredients: [String],
    tags: [String],
    created: {
        type: Date,
        default: Date.now,
    },
    photo: String,
    brewery: {
        type: mongoose.Schema.ObjectId,
        ref: 'Brewery',
        required: "You must supply a brewery!"
    },
    text: {
        type: String,
        required: "Your review must have content...",
        trim: true,
    },
    bjcp_style: {
        type: mongoose.Schema.ObjectId,
        ref: 'bjcpStyle'
    },
    rating: {
        aroma: {
            score: {
                type: Number,
                min: 0,
                max: 12,
            },
            description: {
                type: String,
                trim: true
            },
        },
        appearance: {
            score: {
                type: Number,
                min: 0,
                max: 3,
            },
            description: {
                type: String,
                trim: true
            },
        },
        flavor: {
            score: {
                type: Number,
                min: 0,
                max: 20,
            },
            description: {
                type: String,
                trim: true
            },
        },
        mouthfeel: {
            score: {
                type: Number,
                min: 0,
                max: 5,
            },
            description: {
                type: String,
                trim: true
            },
        },
        overall: {
            score: {
                type: Number,
                min: 0,
                max: 10,
            },
            description: {
                type: String,
                trim: true
            },
        },
    },
    descriptors: [{
        type: mongoose.Schema.ObjectId,
        ref: 'BeerDescriptor'
    }],
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must supply an author'
    },
},
// add additional option to display virtual fields (like our reviews field) when displaying store data in JSON or as objects.
// without this, virtual fields would still be present, but they wouldn't be displayed when using res.json(), for example. 
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

module.exports = mongoose.model('BeerReview', beerReviewSchema);