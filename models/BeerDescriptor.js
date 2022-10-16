const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const beerDescriptorSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true, // trims uploaded strings before adding to the db
        required: 'Please enter a beer name!' // could also just put true, however it is better to put an error msg like this
    },
    slug: String,
    description: {
        type: String,
        trim: true,
    },
},
// add additional option to display virtual fields (like our reviews field) when displaying store data in JSON or as objects.
// without this, virtual fields would still be present, but they wouldn't be displayed when using res.json(), for example. 
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

module.exports = mongoose.model('BeerDescriptor', beerDescriptorSchema);