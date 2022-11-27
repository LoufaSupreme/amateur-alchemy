import makeMap from './modules/map.js';
import getUserLocation from './modules/map.js'

const mapDiv = document.querySelector('#map');

makeMap(mapDiv);

const userLocation = getUserLocation();