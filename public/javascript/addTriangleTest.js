/////// global DOM constants

const perceivedUniqueRadios = document.querySelectorAll('input[name="perceived_unique"]');
const preferenceRadios = document.querySelectorAll('input[name="preference"]');

const preferenceContainer = document.querySelector('.preference');
const preferenceBeerLetterSpans = document.querySelectorAll('.preference-beer-letter');
const notPreferenceBeerLetterSpans = document.querySelectorAll('.not-preference-beer-letter');

const compareContainer = document.querySelector('.compare');
const scoresContainer = document.querySelector('.scores');

const detectFlawsContainer = document.querySelector('#detect-flaws-container');
const flawsDetected = document.querySelector('#flaws-true');
const flawsNotDetected = document.querySelector('#flaws-false');
const flawsContainer = document.querySelector('#off-flavor-container');
const flawInputs = document.querySelectorAll('.flaw__input');

const rangeInputs = document.querySelectorAll('input[type=range]');
const rangeInputSubheadings = document.querySelectorAll('.range-input__subheading');

/////// event listeners

perceivedUniqueRadios.forEach(radio => {
    radio.addEventListener('change', handlePerceivedUniqueChange)
})

preferenceRadios.forEach(radio => {
    radio.addEventListener('change', handlePreferenceChange)
})

flawsDetected.addEventListener('click', handleFlawsDetected);
flawsNotDetected.addEventListener('click', handleFlawsDetected);

rangeInputs.forEach(range => {
    range.addEventListener('input', handleRangeChange);
})

/////// functions

// fires when a user picks a response for "which beer is unique"
function handlePerceivedUniqueChange(e) {
    const perceivedUniqueBeer = e.target.value;
    const letterOptions = ['A', 'B', 'C'];

    // changing the spans to show which beer was chosen as preferred
    preferenceBeerLetterSpans.forEach(span => span.innerText = perceivedUniqueBeer);
    
    rangeInputSubheadings.forEach(subheading => subheading.dataset.unique = perceivedUniqueBeer);

    // do same for the spans for the other beers
    notPreferenceBeerLetterSpans.forEach(span => span.innerText = letterOptions.filter(letter => letter != perceivedUniqueBeer).join(' & '));

    preferenceContainer.classList.add('active');
    detectFlawsContainer.classList.add('active');
}

// fires when a user picks a preference option
function handlePreferenceChange(e) {
    const preference = e.target.value;
    if (preference !== "none") {
        compareContainer.classList.add('active');
        scoresContainer.classList.add('active');
    }
    else {
        compareContainer.classList.remove('active');
        scoresContainer.classList.remove('active');
    }
}

// fires when the user indicates that they detected a flaw in one of the beers
function handleFlawsDetected(e) {
    if (e.target.id === "flaws-true") {
        flawsContainer.classList.add('active');
    }
    else flawsContainer.classList.remove('active');
}

// fires when the user changes a range input in the compare section
function handleRangeChange(e) {
    const inputParent = e.target.closest('.range-input');
    const subheading = inputParent.querySelector('.range-input__subheading');

    const letterOptions = ['A', 'B', 'C'];
    const uniqueBeer = subheading.dataset.unique;
    const otherBeers = letterOptions.filter(letter => letter != uniqueBeer).join(' & ');

    switch(e.target.value) {
        case '0':
            subheading.innerText = `Beer ${uniqueBeer} is MUCH higher in ${subheading.dataset.attr} than Beers ${otherBeers}.`;
            break;
        case '1':
            subheading.innerText = `Beer ${uniqueBeer} is somewhat higher in ${subheading.dataset.attr} than Beers ${otherBeers}.`;
            break;
        case '2':
            subheading.innerText = `The ${subheading.dataset.attr} is about equal.`;
            break;
        case '3':
            subheading.innerText =  `Beers ${otherBeers} are somewhat higher in ${subheading.dataset.attr} than Beer ${uniqueBeer}.`;
            break;
        case '4':
            subheading.innerText =  `Beers ${otherBeers} are MUCH higher in ${subheading.dataset.attr} than Beer ${uniqueBeer}.`
            break;
        default:
            makeAlert('Something went wrong...');
    }
}

