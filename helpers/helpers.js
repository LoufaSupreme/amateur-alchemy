// HELPER FUNCTIONS

// Dump is a handy debugging function we can use to sort of "console.log" our data
// use it in the templates by making a pre element e.g. pre=h.dump(store) so you can render out raw data in json format
exports.dump = (obj) => JSON.stringify(obj, null, 2);

// capitalizes the first letter of a string
exports.capitalizeFirst = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// moment.js is a handy library for displaying dates. We need this in our templates to display things like "Posted 5 minutes ago"
exports.moment = require('moment');