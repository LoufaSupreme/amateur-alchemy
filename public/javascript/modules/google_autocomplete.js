function autocomplete(addressInput, latInput, lngInput, websiteInput) {
    if (!addressInput) return;
    
    // create a google maps Autocomplete instance
    const dropdown = new google.maps.places.Autocomplete(addressInput);

    // addListener is google's way of adding an event listener
    dropdown.addListener('place_changed', () => {
        const place = dropdown.getPlace();
        latInput.value = place.geometry.location.lat();
        lngInput.value = place.geometry.location.lng();
        if (place.website) websiteInput.value = place.website;
    })

    // prevent submitting the form if user presses ENTER
    addressInput.addEventListener('keydown', (e) => {
        if(e.keyCode === 13) e.preventDefault();
    })
}

export default autocomplete;