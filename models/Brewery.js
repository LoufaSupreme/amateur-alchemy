const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const brewerySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true, //trims uploaded strings before adding to the db
        required: 'Please enter a brewery name!' // could also just put true, however it is better to put an error msg like this
    },
    slug: String,
    description: {
        type: String,
        trim: true,
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now,
    },
    location: {
        type: {
            type: String,
            default: 'Point',
        },
        coordinates: [{
            type: Number,
            required: 'You must supply coordinates!',
        }],
        address: {
            type: String,
            required: 'You must supply an address!'
        },
    },
    photo: String,
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