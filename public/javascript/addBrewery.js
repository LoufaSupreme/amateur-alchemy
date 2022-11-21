// const google_autocomplete = require('./modules/google_autocomplete');
import google_autocomplete from './modules/google_autocomplete.js';

const address = document.querySelector('#address');
const latitude = document.querySelector('#lat');
const longitude = document.querySelector('#lng');
const website = document.querySelector('#website');

// requires address field, latitude field, longitude field, website  field
// creates an autocompleting dropdown menu on the address input, via Googles API
google_autocomplete(address, latitude, longitude, website);