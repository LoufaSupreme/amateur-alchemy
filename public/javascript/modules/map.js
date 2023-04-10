
// promisify the getCurrentPosition function, so we can await it
// asks users permission to get location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            location => resolve(location), 
            error => reject(error)
        );
    })
}

// get a list of breweries close to the lat/long, or get them all
async function getBreweries(lat=null, lng=null) {
    let breweryList = {};

    // if a lat and lng are provided, then query for all nearby breweries:
    if (lat && lng) {
        const breweryData = await fetch(`/breweries/api/near?lat=${lat}&lng=${lng}`);
        breweryList = await breweryData.json();
        if (!breweryList.length) {
            makeAlert('No breweries within 20km of that area!');
            return;
        }
    }
    // otherwise, get all breweries in db:
    else {
        const breweryData = await fetch('/breweries/api/all');
        breweryList = await breweryData.json();
        if (!breweryList.length) {
            makeAlert('No breweries found!');
            return;
        }
    }
    
    return breweryList;
}

// takes a list of locations and generates markers/info windows on the map for each
async function loadPlaces(map, lat=43.96, lng=-78.97, breweryList=null) {
    console.log(`Loading places close to ${lat}, ${lng}`);

    // create map bounds:
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat, lng });

    // create infoWindow
    const infoWindow = new google.maps.InfoWindow();

    // create a marker for each returned brewery
    if (breweryList) {
        const markers = breweryList.map(brewery => {
            const [lng, lat] = brewery.location.coordinates;
            const position = { lat:lat, lng:lng };
            // adjust the map bounds to fit this marker
            bounds.extend(position);
            const marker = new google.maps.Marker({
                map: map,
                position: position
            });
            marker.brewery = brewery;
            return marker;
        });
    
        markers.forEach(marker => {
            // addListener is google API version of addEventListener
            // must use proper function here to access "this"
            marker.addListener('click', function() {
                // console.log(this.place)
                const html = `
                    <div class="google-marker">
                        <a href="/brewery/${this.brewery.slug}">
                            <h3 class="google-marker__title">
                                ${this.brewery.name}
                            </h3>
                            <p class="google-marker__content">
                                ${this.brewery.website}
                            </p>
                        </a>
                    </div>
                `
                infoWindow.setContent(html);
                infoWindow.open(map, this)
            })
        })
    }

    // then zoom map to fit all markers
    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);
    const currentZoom = map.getZoom();
    map.setZoom(currentZoom > 15 ? 15 : currentZoom);
}

// pan map over to designated position
function panMap(map, lat, lng) {
    map.panTo({ lat, lng });
    const currentZoom = map.getZoom();
    map.setZoom(currentZoom < 13 ? 15 : currentZoom);
}

// creates a google map
async function makeMap(mapDiv) {
    if (!mapDiv) return;
    console.log('Generating map...');

    const location = {
        user: false,
        latitude: 43.96,
        longitude: -78.97
    };

    // try to get users current position
    try {
        const userLocation = await getUserLocation();
        location.user = true;
        location.latitude = userLocation.coords.latitude;
        location.longitude = userLocation.coords.longitude;
    }
    catch(err) {
        console.log(err.message);
    }

    const mapOptions = {
        center: { lat: location.latitude, lng: location.longitude},
        zoom: 10,
    }

    // make a new google map
    const map = new google.maps.Map(mapDiv, mapOptions);

    // get list of all breweries
    const allBreweries = await getBreweries();

    // load the breweries onto the map
    loadPlaces(map, location.latitude, location.longitude, allBreweries);

    // create a google autocomplete on the location input
    const searchInput = document.querySelector('[name="geolocate"]');
    const autocomplete = new google.maps.places.Autocomplete(searchInput);

    // move map center everytime a user types in a location
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        // const nearbyBreweries = await getBreweries(place.geometry.location.lat(), place.geometry.location.lng())
        // loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng(), nearbyBreweries);
        panMap(map, place.geometry.location.lat(), place.geometry.location.lng())
    });

    // grab users location when they click the btn and then pan map to location
    const userLocationBtn = document.querySelector('#user-location-btn');
    userLocationBtn.addEventListener('click', async () => {
        console.log('Requesting User location...');
        try {
            const userLocation = await getUserLocation();
            panMap(map, userLocation.coords.latitude, userLocation.coords.longitude);
            return {
                userLocation: true,
                lat: userLocation.coords.latitude,
                lng: userLocation.coords.longitude
            }
        }
        catch(err) {
            console.error(err);
            return null;
        }
    });
}

export default makeMap;
