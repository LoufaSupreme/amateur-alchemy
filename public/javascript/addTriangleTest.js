/////// global DOM constants

const perceivedUniqueRadios = document.querySelectorAll('input[name="perceived_unique"]');
const preferenceRadios = document.querySelectorAll('input[name="preference"]');

const preferenceContainer = document.querySelector('.preference');
const uniqueBeerLetterSpans = document.querySelectorAll('.unique-beer-letter');
const notUniqueBeerLetterSpans = document.querySelectorAll('.not-unique-beer-letter');

const compareContainer = document.querySelector('.compare');
const scoresContainer = document.querySelector('.scores');
const scores = document.querySelectorAll('.score');

const detectFlawsContainer = document.querySelector('#detect-flaws-container');
const flawsDetected = document.querySelector('#flaws-true');
const flawsNotDetected = document.querySelector('#flaws-false');
const flawsContainer = document.querySelector('#flaws');
const flawsTitle = document.querySelector('#flaws__title');
const flawInputs = document.querySelectorAll('.flaw__input');

const rangeInputs = document.querySelectorAll('input[type=range]');
const rangeInputSubheadings = document.querySelectorAll('.range-input__subheading');

const submitBtn = document.querySelector('#submit-btn');


let chosenUniqueBeer;

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
    chosenUniqueBeer = perceivedUniqueBeer;

    const letterOptions = ['A', 'B', 'C'];

    // changing the spans to show which beer was chosen as preferred
    uniqueBeerLetterSpans.forEach(span => span.innerText = perceivedUniqueBeer);
    
    // update dataset b/c its used to render the subheading
    rangeInputSubheadings.forEach(subheading => subheading.dataset.unique = perceivedUniqueBeer);

    // do same for the spans for the other beers
    notUniqueBeerLetterSpans.forEach(span => span.innerText = letterOptions.filter(letter => letter != perceivedUniqueBeer).join(' & '));

    // show the preference and flaws containers
    preferenceContainer.classList.add('active');

    // show the did you detect flaws container:
    detectFlawsContainer.classList.add('active');

    // show the rate beers inputs (stars):
    scoresContainer.classList.add('active');
}

// fires when a user picks a preference option
function handlePreferenceChange(e) {
    const preference = e.target.value;
    if (preference !== "none") {

        // show the compare beers range inputs:
        compareContainer.classList.add('active');

        // reset the off-flavour (flaws) title
        flawsTitle.innerText = "Select the off-flavours you detected for each beer:";

        // reset the flaw inputs
        flawInputs.forEach(input => {
            const label = document.querySelector(`label[for="${input.id}"]`);
            const labelIconDiv = label.querySelector('.icon');
            const labelTextDiv = label.querySelector('.text');

            if (input.classList.contains("flaw__input--other")) {
                input.style.display = "block";
                input.checked = false;
                label.style.display = "block";
            }
            else {
                input.value = "unique";
                input.checked = false;
                labelIconDiv.style.display = "none";
                labelTextDiv.style.display = "block";
            }
        })

        // reset the score ratings
        scores.forEach(score => {
            if (score.id === 'score__other') score.style.display = "grid";
            else {
                const label = score.querySelector('.scores__beer-label');
                const labelDefaultText = label.querySelector('.default');
                const labelAlternateText = label.querySelector('.alternate');

                labelDefaultText.style.display = "block";
                labelAlternateText.style.display = "none";
            }
        })
    }
    // if the user selects no perceivable difference between beers:
    else {
        // hide the compare range inputs
        compareContainer.classList.remove('active');

        // modify the off-flavour title to make sense for 1 beer
        flawsTitle.innerText = "Select the off-flavours you detected:";

        // reset range inputs
        resetComparisonRanges();
        resetComparisonRangeSubheadings();

        // change the flaw inputs to just one input
        flawInputs.forEach(input => {
            const label = document.querySelector(`label[for="${input.id}"]`);
            const labelIconDiv = label.querySelector('.icon');
            const labelTextDiv = label.querySelector('.text');

            if (input.classList.contains("flaw__input--other")) {
                input.style.display = "none"
                input.checked = false;
                label.style.display = "none";
            }
            else {
                input.value = "all"; // will send a value of "all" to the backend
                labelIconDiv.style.display = "block";
                labelTextDiv.style.display = "none";
                input.checked = false;
            }
        })

        // hide one of the score ratings
        scores.forEach(score => {
            if (score.id === 'score__other') score.style.display = "none";
            else {
                const label = score.querySelector('.scores__beer-label');
                const labelDefaultText = label.querySelector('.default');
                const labelAlternateText = label.querySelector('.alternate');

                labelDefaultText.style.display = "none";
                labelAlternateText.style.display = "block";
            }
        })
    }
}

// fires when the user indicates that they detected a flaw in one of the beers
function handleFlawsDetected(e) {
    if (e.target.id === "flaws-true") {
        flawsContainer.classList.add('active');
    }
    else if (e.target.id === "flaws-false") {
        flawsContainer.classList.remove('active');
        resetFlaws();
    }
    else {
        console.error('Something went wrong in handleFlawsDetected')
    }
}

// reset all the flaw boxes to unchecked
function resetFlaws() {
    flawInputs.forEach(input => {
        input.checked = false;
    })
}

// reset all range inputs back to default
function resetComparisonRanges(val = 2) {
    rangeInputs.forEach(input => input.value = val);
}

// reset all range input subheadings
function resetComparisonRangeSubheadings() {
    rangeInputSubheadings.forEach(subheading => {
        subheading.innerText = `The ${subheading.dataset.attr} is about equal.`;
    });
}

// fires when the user changes a range input in the compare section
function handleRangeChange(e) {
    const inputParent = e.target.closest('.range-input');
    const subheading = inputParent.querySelector('.range-input__subheading');

    const letterOptions = ['A', 'B', 'C'];
    const uniqueBeer = subheading.dataset.unique;
    const otherBeers = letterOptions.filter(letter => letter != uniqueBeer).join(' & ');

    // update subheading:
    switch(e.target.value) {
        case '2':
            subheading.innerText = `Beer ${uniqueBeer} is MUCH higher in ${subheading.dataset.attr} than Beers ${otherBeers}.`;
            break;
        case '1':
            subheading.innerText = `Beer ${uniqueBeer} is somewhat higher in ${subheading.dataset.attr} than Beers ${otherBeers}.`;
            break;
        case '0':
            subheading.innerText = `The ${subheading.dataset.attr} is about equal.`;
            break;
        case '-1':
            subheading.innerText =  `Beer ${uniqueBeer} is somewhat lower in ${subheading.dataset.attr} than Beers ${otherBeers}.`;
            break;
        case '-2':
            subheading.innerText =  `Beer ${uniqueBeer} is MUCH lower in ${subheading.dataset.attr} than Beers ${otherBeers}.`
            break;
        default:
            makeAlert('Something went wrong...');
    }
}

function validateForm(e) {
    const requiredInputGroups = document.querySelectorAll('.required');
    for (const group of requiredInputGroups) {
        if (!isCompleteInput(group)) {
            group.scrollIntoView();
            group.classList.add('failed-validation');
            setTimeout(() => {
                group.classList.remove('failed-validation');
            }, 3000);
            makeAlert("Looks like something got missed!", 4000);
            return e.preventDefault();
        } 
    }
}

function isCompleteInput(inputGroup) {
    const inputs = Array.from(inputGroup.querySelectorAll('input'));
    return inputs.filter(input => input.checked).length; 
}

submitBtn.addEventListener('click', (e) => {
    validateForm(e);
})

