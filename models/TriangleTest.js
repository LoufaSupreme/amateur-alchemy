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
    additional_training: [String],  // cicerone, professional brewer...
    actual_unique: String, // A, B, C or null
    perceived_unique: String,  // A, B, C or none as perceived by tester
    preference: String, // unique, other, or null
    malt_character: {
        type: Number,
        min: 0, // 0 means unique beer is most
        max: 4 // 4 means non-unique beer is most
    },
    hop_character: {
        type: Number,
        min: 0,
        max: 4
    },
    yeast_character: {
        type: Number,
        min: 0,
        max: 4
    },
    bitterness: {
        type: Number,
        min: 0,
        max: 4
    },
    body: {
        type: Number,
        min: 0,
        max: 4
    },
    carbonation: {
        type: Number,
        min: 0,
        max: 4
    },
    balance: {
        type: Number,
        min: 0,
        max: 4
    },
    scores: {
        unique: Number,
        other: Number,
    },
    flaws_detected: Boolean,
    flaws: {
        acetaldehyde: {
            type: [String], // all, unique, other or null
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
            description: "fruity, flower.",
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
            description: "Cooked/canned/rotten vegetable. Cabbage, onion, etc.",
        },
        yeasty: {
            type: [String],
            description: "Bready, sulfury, meaty.",
        },
    },
    comments: String,
    created: {
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