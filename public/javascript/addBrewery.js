import google_autocomplete from './modules/google_autocomplete.js';

const inputs = {
    // visible inputs
    address: document.querySelector('#address'),
    lat: document.querySelector('#lat'),
    lng: document.querySelector('#lng'),
    website: document.querySelector('#website'),
    // hidden inputs, for google API data
    place_id: document.querySelector('[name="google_data[place_id]"]'),
    map_url: document.querySelector('[name="google_data[map_url]"]'),
    google_tags: document.querySelector('[name="google_data[tags]"]'),
    phone: document.querySelector('[name="google_data[phone]"]'),
    images: document.querySelector('[name="google_data[images]"]'),
}

// requires address field, latitude field, longitude field, website  field
// creates an autocompleting dropdown menu on the address input, via Googles API
google_autocomplete(inputs);