const perceivedUniqueRadios = document.querySelectorAll('input[name="perceived_unique"]');

perceivedUniqueRadios.forEach(radio => {
    addEventListener('change', handlePerceivedUniqueChange)
})

function handlePerceivedUniqueChange(e) {
    const perceivedUniqueBeer = e.target.value;
    if (perceivedUniqueBeer === "none") {
        // change buttons in the flaws list to only show one beer
        
    }
}

document.querySelector('input[name="rate"]:checked').value;
