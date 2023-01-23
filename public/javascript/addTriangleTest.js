const perceivedUniqueRadios = document.querySelectorAll('input[name="perceived_unique"]');
const flawsDetected = document.querySelector('#flaws-true');
const flawsNotDetected = document.querySelector('#flaws-false');
const offFlavorContainer = document.querySelector('#off-flavor-container');
const flawInputs = document.querySelectorAll('.flaw__input');
const scoreInputs = document.querySelectorAll('.score__input');

perceivedUniqueRadios.forEach(radio => {
    addEventListener('change', handlePerceivedUniqueChange)
})

flawsDetected.addEventListener('click', handleFlawsDetected);
flawsNotDetected.addEventListener('click', handleFlawsDetected);

function handleFlawsDetected(e) {
    if (e.target.id === "flaws-true") {
        offFlavorContainer.classList.add('active');
    }
    else offFlavorContainer.classList.remove('active');
}

// fires when a user picks a response for "which beer is unique"
function handlePerceivedUniqueChange(e) {
    const perceivedUniqueBeer = e.target.value;
    if (perceivedUniqueBeer === "none") {
        // change buttons in the flaws list to only show one beer
        flawInputs.forEach(input => {
            // change the "unique" input to an "all" input since the user has previously indicated all the beers are the same
            if (input.classList.contains('flaw__input--unique')) {
                input.value = "all";
                const label = document.querySelector(`label[for="${input.id}"]`);
                label.innerHTML = '<i class="fa-solid fa-check"></i>';
            }
            // change the "other" input to be hidden since it's no longer valid
            else if (input.classList.contains('flaw__input--other')) {
                input.disabled = true;
                input.style.display = "none";
                const label = document.querySelector(`label[for="${input.id}"]`);
                label.style.display = "none";
            }
        });

        scoreInputs.forEach(input => {
            if (input.id === "score-unique") {
                input.name = "scores[all]";
                const label = document.querySelector(`label[for="${input.id}"]`);
                label.innerText = "Beer Score"
            }
            else if (input.id === "score-other") {
                input.disabled = true;
                input.style.display = "none";
                input.parentElement.style.display = "none";
            }
        })
    }
}


