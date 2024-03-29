const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const triangleTestSchema = new mongoose.Schema({
    name: String,
    token: {
        type: Number,
        required: 'Please enter a token number!' // could also just put true, however it is better to put an error msg like this
    },
    article: {
        type: mongoose.Schema.ObjectId,
        ref: 'Article',
        required: 'Please associate with an article'
    },
    title: String, // enthusiast, homebrewer, BJCP judge...
    additional_training: [String],  // cicerone, BJCP...
    actual_unique: {
        color: String, // blue or yellow
        cup: String, // A, B or C
    },
    perceived_unique: String,  // A, B, C as perceived by tester
    preference: String, // unique, other, or none
    malt_character: {
        type: Number,
        min: -2, // -2 means unique beer is most
        max: 2 // 2 means non-unique beer is most
    },
    hop_character: {
        type: Number,
        min: -2,
        max: 2
    },
    yeast_character: {
        type: Number,
        min: -2,
        max: 2
    },
    bitterness: {
        type: Number,
        min: -2,
        max: 2
    },
    body: {
        type: Number,
        min: -2,
        max: 2
    },
    carbonation: {
        type: Number,
        min: -2,
        max: 2
    },
    balance: {
        type: Number,
        min: -2,
        max: 2
    },
    scores: {
        unique: Number, // score goes here and below if beers were perceived as different
        other: Number,
    },
    flaws_detected: Boolean,
    flaws: {
        acetaldehyde: {
            type: [String], // all, unique, other
            description: "Green apple.",
        },
        alcoholic: {
            type: [String],
            description: "Hot, warming.",
        },
        astringent: {
            type: [String],
            description: "Puckering, harsh, grainy, huskiness.",
        },
        diacetyl: {
            type: [String],
            description: "Butter, butterscotch, toffee. Slick tongue.",
        },
        DMS: {
            type: [String],
            description: "Sweet cooked/canned corn.",
        },
        estery: {
            type: [String],
            description: "Fruity, flowery.",
        },
        grassy: {
            type: [String],
            description: "Fresh-cut grass, green leaves.",
        },
        skunky: {
            type: [String],
            description: "Smells like a skunk.",
        },
        metallic: {
            type: [String],
            description: "Tinny, coiny, copper, iron, blood.",
        },
        musty: {
            type: [String],
            description: "Stale, moldy.",
        },
        oxidized: {
            type: [String],
            description: "Stale, winy/vinous, cardboard, paper, sherry.",
        },
        phenolic: {
            type: [String],
            description: "Spicy (clove/pepper), smoky, plastic, bandaid.",
        },
        solvent: {
            type: [String],
            description: "Fusel, acetone, nail polish.",
        },
        sour: {
            type: [String],
            description: "Tart, sharp, acidic, vinegar (acetic).",
        },
        sulfur: {
            type: [String],
            description: "Rotten eggs, burning matches.",
        },
        vegetal: {
            type: [String],
            description: "Cooked/canned/rotten vegetable, cabbage, onion.",
        },
        yeasty: {
            type: [String],
            description: "Bready, sulfury, meaty.",
        },
    },
    comments: String,
    date_created: {
        type: Date,
        default: Date.now,
    },
},
// add additional option to display virtual fields data in JSON or as objects.
// without this, virtual fields would still be present, but they wouldn't be displayed when using res.json(), for example. 
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

module.exports = mongoose.model('TriangleTest', triangleTestSchema);