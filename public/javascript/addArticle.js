const htmlPreview = `\
<style>

</style>
<h1>Title</h1>
<p>
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vestibulum lacinia dui at sagittis. Etiam suscipit erat 
</p>
<h2>Subtitle</h2>
<p>
  Vivamus at tempor odio. Pellentesque posuere, mi in tempus vehicula, eros risus luctus dolor, condimentum commodo mauris 
</p>
<canvas id="chart1" class="chart" data-type="radar"></canvas> 
\ 
`;
// img modal elements
const modal = document.querySelector('.modal');
const modalImg = modal.querySelector('img');

// tag elements
const tagsContainer = document.querySelector('.tags');
const hiddenTagsInput = document.querySelector('#tags');
const tagsInput = tagsContainer.querySelector('#tags__input');
const tagsDropdown = tagsContainer.querySelector('.dropdown');
const tagsHolder = tagsContainer.querySelector('.tags__holder');

// content btns
const contentBtns = document.querySelectorAll(".btn-catalogue__btn");

// recipe section
const addIngredientBtn = document.querySelector('#recipe-table__btn');
const recipeTable = document.querySelector('#recipe-table');
const recipeHiddenInput = document.querySelector('#recipe');

const contentBtnsDict = {
  "img-left": `\
<figure class="float-left fig-small">
  <img src="#" alt="#">
  <figcaption>Caption</figcaption>
</figure>`,
  "img-center": `\
<figure class="fig-full">
  <img src="#" alt="#">
  <figcaption>Caption</figcaption>
</figure>`,
  "img-right": `\
<figure class="float-right fig-small">
  <img src="#" alt="#">
  <figcaption>Caption</figcaption>
</figure>`,
  "side-by-side": `\
<div class="sidebyside flex">
  <figure>
    <img src="#" alt="#">
    <figcaption>Caption</figcaption>
  </figure>
  <figure>
    <img src="#" alt="#">
    <figcaption>Caption</figcaption>
  </figure>
</div>`,
  "sidebar-right": `\
<aside class="float-right">
  <p>Sidebar</p>
</aside>`,
  "sidebar-left": `\
<aside class="float-left">
  <p>Sidebar</p>
</aside>`,
  "blockquote": `\
<blockquote>
  Blockquote
</blockquote>`,
  "table": `\
<table class="styled-table">
  <thead>
    <tr>
      <th>Heading 1</th>
      <th>Heading 2</th>
      <th>Heading 3</th>
      <th>Heading 4</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
      <td>Data 3</td>
      <td>Data 4</td>
    </tr>
    <tr>
      <td>Data 5</td>
      <td>Data 6</td>
      <td>Data 7</td>
      <td>Data 8</td>
    </tr>
  </tbody>
</table>`,
"chart": `<canvas id="chart1" class="chart" data-type="radar"></canvas>`,
}

// class for the image gallery containers
// makes it possible to debounce rotate functions separately by image
class GalleryImage extends HTMLElement {
  constructor(container) {
    super();
    this.container = container;
    this.img = container.querySelector('img');
    this.rotateBtn = container.querySelector('.rotate-btn');
    this.deleteBtn = container.querySelector('.delete-btn');
    this.expandBtn = container.querySelector('.expand-btn');
    this.lockBtn = container.querySelector('.lock-btn');
  }

  makeEventListeners() {
    // clicking image itself
    this.img.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      this.copySrc();
      this.lock();
    })

    // clicking rotate btn
    this.rotateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
    
      this.updateAngle(90);
  
      this.img.style.transform = `rotate(${this.img.dataset.angle}deg)`;
    
      // this.debounce(this.rotate(this.img, this.img.dataset.angle), 2000);

      this.debouncedRotate(this.img, this.img.dataset.angle);
    })

    // clicking lock btn
    this.lockBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
  
      this.toggleLock();
    })

    // clicking expand btn
    this.expandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      modalImg.src = `https://amateur-alchemy.s3.us-east-2.amazonaws.com/${this.img.dataset.name}`;
      modal.classList.add('open');
      modalImg.classList.add('open');
    })

    // clicking delete btn
    this.deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      this.delete();
    })
  }

  // https://stackoverflow.com/questions/24004791/what-is-the-debounce-function-in-javascript
  debounce(func, wait, immediate) {
    // 'private' variable for instance
    // The returned function will be able to reference this due to closure.
    // Each call to the returned function will share this common timer.
    var timeout;

    // Calling debounce returns a new anonymous function
    return function() {
      // reference the context and args for the setTimeout function
      var context = this,
        args = arguments;

      // Should the function be called now? If immediate is true
      //   and not already in a timeout then the answer is: Yes
      var callNow = immediate && !timeout;

      // This is the basic debounce behaviour where you can call this
      //   function several times, but it will only execute once
      //   (before or after imposing a delay).
      //   Each time the returned function is called, the timer starts over.
      clearTimeout(timeout);

      // Set the new timeout
      timeout = setTimeout(function() {

        // Inside the timeout function, clear the timeout variable
        // which will let the next execution run when in 'immediate' mode
        timeout = null;

        // Check if the function already ran with the immediate flag
        if (!immediate) {
          // Call the original function with apply
          // apply lets you define the 'this' object as well as the arguments
          //    (both captured before setTimeout)
          func.apply(context, args);
        }
      }, wait);

      // Immediate mode and no wait timer? Execute the function...
      if (callNow) func.apply(context, args);
    }
  }

  debouncedRotate = this.debounce(this.rotate, 2000)

  updateAngle(angle) {
    this.img.dataset.angle = +this.img.dataset.angle + angle;
  }

  async delete() {
    const isShowcase = this.img.classList.contains('showcase') ? true : false;
    const imgContainer = this.img.parentElement;
    const imgName = this.img.dataset.name;

    const slug = location.pathname.split('/')[2];

    try {
      const response = await fetch(`/articles/${slug}/delete/${imgName}`, {
        method: 'DELETE',
        body: JSON.stringify({ isShowcase }),
        headers: { 'Content-Type': 'application/json' }
      });
  
      const json = await response.json();
      console.log(`${json.status}: ${json.message}`);
  
      if (json.status === 'success') {
        makeAlert("Image deleted");
        imgContainer.remove();
      }
      else makeAlert(`Error: ${json.message}`);
    }
    catch(err) {
      console.error(err);
      makeAlert(err);
    }
  }

  toggleLock() {
    this.lockBtn.classList.toggle('locked');
    this.container.classList.toggle('locked');
    if (this.lockBtn.classList.contains('locked')) {
      this.lockBtn.innerHTML = '<i class="fa-solid fa-lock"></i>'
    }
    else this.lockBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i>'
  }

  lock() {
    this.container.classList.add('locked');
    this.lockBtn.classList.add('locked');
    this.lockBtn.innerHTML = '<i class="fa-solid fa-lock"></i>'
  }

  copySrc() {
    const [imgName, imgExt] = splitFilename(this.img.dataset.name);
    copyToClipboard(`https://amateur-alchemy.s3.us-east-2.amazonaws.com/${imgName}_tiny.${imgExt}`);
  }

  async rotate() {
    try {
      // sharp only accepts positive rotation values:
      // const translatedAngle = Math.abs(360 - Math.abs(angle));
      const response = await fetch(`/articles/rotate/${this.img.dataset.name}/${this.img.dataset.angle}`, {
        method: 'PUT'
      });
      console.log({code: response.status, status: response.statusText, url: response.url})
    }
    catch(err) {
      console.error(err);
      makeAlert(err);
    }
  }
}

const galleryImageContainers = document.querySelectorAll('.gallery-img-container');

// required in order to use the GalleryImage class as an HTMLElement extension
customElements.define('gallery-img-container', GalleryImage);

// make each container an instance of the class
galleryImageContainers.forEach(container => {
  const galleryImage = new GalleryImage(container);
  galleryImage.makeEventListeners();
})

// editor/body elements
const preview = document.querySelector('.preview');
const hiddenBodyInput = document.querySelector('#body');
const editor = ace.edit("editor", {
  maxLines: 120
});

editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/html");
editor.session.setUseWrapMode(true);
editor.setShowPrintMargin(false);
editor.session.setTabSize(2);

editor.session.on('change', function(delta) {
  // delta.start, delta.end, delta.lines, delta.action
  preview.innerHTML = editor.getValue();
  hiddenBodyInput.value = editor.getValue();
});

if (editor.getValue() === '') editor.setValue(htmlPreview);
preview.innerHTML = editor.getValue();

function copyToClipboard(targetText) {
  const dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = targetText
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
  makeAlert('Copied to Clipboard!')
}

modal.addEventListener('click', () => {
  // modal.close();
  modal.classList.remove('open');
  modalImg.src = "";
  modalImg.classList.remove('open');
})

// splits a filename into its name and extension
function splitFilename(filename) {
  const [name, ext] = filename.split('.');
  return [name, ext];
}

// request a list of existing tags from the server
async function tagsTypeAhead() {
  try {
    const tagsData = await fetch('/articles/api/tags');
    const tags = await tagsData.json();

    if (!tags.length) return;
    // uses the typeAhead module to convert the tags input box into a dropdown suggestion
    typeAhead(tagsContainer, tags);
    
  }
  catch(err) {
    console.error(err);
    makeAlert(err);
  }
}

// handles clicking or hitting enter on a selected dropdown suggestion
function handleDropdownSelection(selected) {
  
  // selected could be either a word or an html element
  let tagLabel = selected.innerText || selected;
  tagLabel = tagLabel.trim().toLowerCase();
  console.log(tagLabel)
  const existingTags = hiddenTagsInput.value.split(', ');

  if (!isDuplicated(tagLabel, existingTags)) {
    // add the tag
    tagsHolder.appendChild(makeTag(tagLabel));
    // append tag on hidden tag input
    addToHiddenInput(hiddenTagsInput, tagLabel);
  }

  // clear the input
  tagsInput.value = "";

  // clear the dropdown
  tagsDropdown.style.display = 'none';
}

// makes a tag element with delete btn
function makeTag(label) {
  const tag = document.createElement('div');
  tag.classList.add('tag');
  const delBtn = document.createElement('div');
  delBtn.classList.add('tag__delBtn');
  delBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  delBtn.addEventListener('click', () => {
    removeFromHiddenInput(hiddenTagsInput, label)
    tag.remove();
  });

  tag.innerHTML = label;
  tag.appendChild(delBtn);

  return tag;
}

// takes the list of article tags and turns them into tag elements
function initializeTags() {
  if (tagsInput.value.trim() === "") return;
  tagsInput.value.split(', ').map(tag => {
    tagsHolder.appendChild(makeTag(tag));
  })

  tagsInput.value = "";
}

// checks to see if target word in already in list
function isDuplicated(target, list) {
  return list.includes(target);
}

// remove a tag from a hidden input
function removeFromHiddenInput(hiddenInput, word) {
  const existingList = hiddenInput.value.split(', ');
  const indexOfWord = existingList.indexOf(word);
  // remove the word if its found
  if (indexOfWord > -1) existingList.splice(indexOfWord, 1);
  // set the value of the hidden input to the updated list
  const newList = existingList.join(', ');
  hiddenInput.value = newList;
}

// add a tag to a hidden input
function addToHiddenInput(hiddenInput, word) {
  if (hiddenInput.value === "") hiddenInput.value = word;
  else hiddenInput.value += `, ${word}`;
}

function configureContentBtns() {
  contentBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      copyToClipboard(contentBtnsDict[btn.id]);
    })
  });
}

function addToRecipeHiddenInput() {
  // clear the recipe hidden input:
  recipeHiddenInput.value = "";
  
  // add an ingredient:amount for each table row to the hidden input
  const tableRows = recipeTable.querySelectorAll('tr');
  for (const row of tableRows) {
    const ingredientName = row.querySelector(".headings").innerText;
    const amount = row.querySelector(".amount").innerText;
    const ingredient = `${ingredientName}:${amount}`;
    
    if (recipeHiddenInput.value === "") recipeHiddenInput.value = ingredient;
    else recipeHiddenInput.value += `, ${ingredient}`;
  }
}

// takes the list of ingredients (ingredientName:amount) in the hidden recipe input and turns them into table elements
function initializeRecipeTable() {
  if (recipeHiddenInput.value.trim() === "") return;
  recipeHiddenInput.value.split(', ').map(ingredientPair => {
    addIngredientRow(ingredientPair);
  })
}

function addIngredientRow(ingredientPair=undefined) {
  const newRow = document.createElement("tr");

  const ingredient = document.createElement("td");
  ingredient.classList.add("headings");
  ingredient.contentEditable = true;
  ingredient.innerText = "Ingredient Name";
  ingredient.addEventListener("input", () => {
    addToRecipeHiddenInput();
  })

  const amount = document.createElement("td");
  amount.classList.add("amount")
  amount.contentEditable = true;
  amount.innerText = "Amount (% or measurement)";
  amount.addEventListener("input", () => {
    addToRecipeHiddenInput();
  })

  if (ingredientPair) {
    ingredient.innerText = ingredientPair.split(":")[0];
    amount.innerText = ingredientPair.split(":")[1];
  }

  newRow.appendChild(ingredient);
  newRow.appendChild(amount);

  recipeTable.appendChild(newRow);
}

tagsTypeAhead();
initializeTags();
initializeRecipeTable();
configureContentBtns();
addIngredientBtn.addEventListener('click', () => {
  addIngredientRow();
})
