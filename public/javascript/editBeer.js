
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