
// promisify the getCurrentPosition function, so we can await it
function getUserLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    })
}

async function loadPlaces(map, lat=43.96 , lng=-78.97) {
    console.log(`Loading places close to ${lat}, ${lng}`);

    // fetch a list of breweries within 20km of user location
    const breweryData = await fetch(`/api/breweries/near?lat=${lat}&lng=${lng}`);
    const breweryList = await breweryData.json();
    if (!breweryList.length) {
        makeAlert('No breweries within 20km of that area!');
        return;
    }

    // create map bounds:
    const bounds = new google.maps.LatLngBounds();

    // create infoWindow
    const infoWindow = new google.maps.InfoWindow();

    // create a marker for each returned brewery
    const markers = breweryList.map(brewery => {
        const [lng, lat] = brewery.location.coordinates;
        const position = { lat, lng };
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

    // then zoom map to fit all markers
    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);
}

async function makeMap(mapDiv) {
    if (!mapDiv) return;
    console.log('Generating map...');
    const location = await getUserLocation();
    const { latitude, longitude } = location.coords;

    const mapOptions = {
        center: { lat: latitude, lng: longitude},
        zoom: 10,
        maxZoom: 15
    }

    const map = new google.maps.Map(mapDiv, mapOptions);
    loadPlaces(map, latitude, longitude);
    const searchInput = document.querySelector('[name="geolocate"]');
    const autocomplete = new google.maps.places.Autocomplete(searchInput);
}

export default makeMap;
