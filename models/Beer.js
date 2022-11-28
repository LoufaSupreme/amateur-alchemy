const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const beerSchema = new mongoose.Schema({
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
    final_gravity: Number,
    srm: Number,
    tags: [String],
    created: {
        type: Date,
        default: Date.now,
    },
    video: String,
    photos: [String],
    brewery: {
        type: mongoose.Schema.ObjectId,
        ref: 'Brewery',
    },
    bjcp_style: String,
    attributes: {
        crushability: Number,
        hop_character: Number,
        bitterness: Number,
        yeast_character: Number,
        acidity: Number,
        effervescence: Number,
        head_retention: Number,
        color: Number,
        clarity: Number,
        body: Number,
        dryness: Number,
        malt_character: Number,
    },
    rating: {
        totalScore: Number,
        aroma: {
            score: {
                type: Number,
                min: 0,
                max: 12,
            },
            max_score: {
                type: Number,
                default: 12,
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
            max_score: {
                type: Number,
                default: 3,
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
            max_score: {
                type: Number,
                default: 20,
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
            max_score: {
                type: Number,
                default: 5,
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
            max_score: {
                type: Number,
                default: 10,
            },
            description: {
                type: String,
                trim: true
            },
        },
    },
    // author: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'User',
    //     required: 'You must supply an author'
    // },
},
// add additional option to display virtual fields (like our reviews field) when displaying Beer data in JSON or as objects.
// without this, virtual fields would still be present, but they wouldn't be displayed when using res.json(), for example. 
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

function calculateScore(next) {
    const totalScore = 
        this.rating.aroma.score +
        this.rating.appearance.score +
        this.rating.flavor.score +
        this.rating.mouthfeel.score + 
        this.rating.overall.score;
    this.rating.totalScore = totalScore;
    next();
}

// generate a unique slug from the name
async function setSlug(next) {
    if (this.slug === slug(this.name)) return next();
    this.slug = slug(this.name);
    // before we save a new Beer with this name, check to see if any other beers with that name already exist in database
    // this is important bc the slug is generated by the name, and the slug is used in the URLs for the indivudal Beer pages.  So, if the
    // name is the same and the slug is the same, then all beers with the same name will point to the same URL.
    // So... find all the beers with the same name and add a number to the end of the slug to make it unique. 
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const existingObjsWithSlug = await this.constructor.find({ slug: slugRegEx });
    
    if (existingObjsWithSlug.length) {
        this.slug = `${this.slug}-${existingObjsWithSlug.length + 1}`;
    }

    next();
}

beerSchema.pre('save', setSlug);
beerSchema.pre('save', calculateScore);

module.exports = mongoose.model('Beer', beerSchema);