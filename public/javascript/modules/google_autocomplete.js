function autocomplete(inputs) {
    if (!inputs.address) return;
    
    const {
        address,
        lat,
        lng,
        website,
        place_id,
        map_url,
        google_tags,
        phone,
        images,
    } = inputs;
    
    // create a google maps Autocomplete instance
    const dropdown = new google.maps.places.Autocomplete(address);
    console.log(Object.keys(inputs))

    // addListener is google's way of adding an event listener
    dropdown.addListener('place_changed', () => {
        const place = dropdown.getPlace();

        // reset all input values to null
        for (const key of Object.keys(inputs)) {
           if (key !== "address") inputs[key].value = "";
        }
        
        lat.value = place.geometry.location.lat();
        lng.value = place.geometry.location.lng();
        place_id.value = place.place_id;
        if (place.website) website.value = place.website;
        if (place.formatted_phone_number) phone.value = place.formatted_phone_number;
        if (place.url) map_url.value = place.url;
        if (place.types.length) {
            const tagString = place.types
                .map(type => type.split('_').join(' '))
                .join(', ');
            google_tags.value = tagString;
        }
        if (place.photos.length) {
            const photos = place.photos.map(photoObj => photoObj.getUrl()).join(', ');
            images.value = photos;
        }
    })

    // prevent submitting the form if user presses ENTER
    address.addEventListener('keydown', (e) => {
        if(e.keyCode === 13) e.preventDefault();
    })
}

export default autocomplete;