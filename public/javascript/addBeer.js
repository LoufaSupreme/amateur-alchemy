
// automatically add tags to the tag list based on the attribute dropdown selection
const attr_inputs = document.querySelectorAll('.attr-input');
const tags_input = document.querySelector('#tags-input');
let currentTags = tags_input.value;

function addTags() {
    // if the select input doesn't have a label, stop
    if (!this.dataset.label) return;

    // if the label is already a tag, stop
    if (currentTags.includes(this.dataset.label)) return;

    // otherwise add the label to the tag list
    if (this.id != 'clarity' && this.value > 2) {
        currentTags += currentTags == "" ? this.dataset.label : `, ${this.dataset.label}`;
    }
    else if (this.id === 'clarity' && this.value <= 2) {
        currentTags += currentTags == "" ? this.dataset.label : `, ${this.dataset.label}`;
    }
    tags_input.value = currentTags;
}

attr_inputs.forEach(input => input.addEventListener('change', addTags));

// change hidden brewery input value to match the visible brewery input field, or to be the brewery._id if a brewery is selected
const breweryNameInput = document.querySelector('#brewery-name-input');
const breweryHiddenInput = document.querySelector('#brewery-hidden');
const searchResults = document.querySelector('.search-area__results');

function populateInput(elem) {
    breweryHiddenInput.value = elem.dataset.id;
    breweryNameInput.value = elem.innerText;
}

function generateSearchResults(results) {
    return results.map(result => {
        return `
            <div class="search__result" data-id=${result._id} onclick="populateInput(this);">
                ${result.name}
            </div>
        `;
    }).join('')
}

async function searchBreweries() {
    try {
        const res = await fetch(`api/search/breweries?q=${breweryNameInput.value}`);
        const data = await res.json();
        if (!data.length) {
            searchResults.style.display = "none";
            return;
        }
        searchResults.style.display = "block";
        searchResults.innerHTML = generateSearchResults(data);
    }
    catch(err) {
        console.error(err);
    }
    
}

breweryNameInput.addEventListener('input', searchBreweries);