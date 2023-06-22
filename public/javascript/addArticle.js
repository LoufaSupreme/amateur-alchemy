
const htmlPreview = `\
<style>

</style>
<section>
  <h1>Title</h1>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vestibulum lacinia dui at sagittis. Etiam suscipit erat 
  </p>
  <h2>Subtitle</h2>
  <p>
    Vivamus at tempor odio. Pellentesque posuere, mi in tempus vehicula, eros risus luctus dolor, condimentum commodo mauris 
  </p>
</section>
<section>
  <canvas id="chart1" class="chart" data-type="radar"></canvas> 
</section>
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
}

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


const deleteBtns = document.querySelectorAll('.delete-btn');
const expandBtns = document.querySelectorAll('.expand-btn');
const rotateBtns = document.querySelectorAll('.rotate-btn');
const lockBtns = document.querySelectorAll('.lock-btn');
const galleryImgs = document.querySelectorAll('.gallery-img');

function copyToClipboard(targetText) {
  const dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = targetText
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
  makeAlert('Copied to Clipboard!')
}

lockBtns.forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();

    btn.classList.toggle('locked');
    btn.parentElement.classList.toggle('locked');
    if (btn.classList.contains('locked')) {
      btn.innerHTML = '<i class="fa-solid fa-lock"></i>'
    }
    else btn.innerHTML = '<i class="fa-solid fa-lock-open"></i>'
  })
})

galleryImgs.forEach(img => {
  img.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();

    const [imgName, imgExt] = splitFilename(this.dataset.name);

    copyToClipboard(`https://amateur-alchemy.s3.us-east-2.amazonaws.com/${imgName}_small.${imgExt}`);

    this.parentElement.classList.add('locked');
    const lockBtn = this.parentElement.querySelector('.lock-btn');
    lockBtn.classList.add('locked');
    lockBtn.innerHTML = '<i class="fa-solid fa-lock"></i>'
  })
})

rotateBtns.forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();

    const img = this.parentElement.querySelector('img');
    const newAngle = +img.dataset.angle + 90;

    img.dataset.angle = newAngle;
    img.style.transform = `rotate(${newAngle}deg)`;
  
    debouncedRotateImage(img, newAngle);
  })
});

deleteBtns.forEach(btn => {
  btn.addEventListener('click', async function(e) {
    e.stopPropagation();
    e.preventDefault();

    const img = this.parentElement.querySelector('img');
    const isShowcase = img.classList.contains('showcase') ? true : false;
    const imgContainer = img.parentElement;
    const imgName = img.dataset.name;

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
  })
})

expandBtns.forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();

    const imgName = this.parentElement.querySelector('img').dataset.name;

    modalImg.src = `https://amateur-alchemy.s3.us-east-2.amazonaws.com/${imgName}`;
    modal.classList.add('open');
    modalImg.classList.add('open');
  })
})

modal.addEventListener('click', () => {
  // modal.close();
  modal.classList.remove('open');
  modalImg.src = "";
  modalImg.classList.remove('open');
})

const debouncedRotateImage = debounce(rotateImage, 2000);

// fetch call to rotate image in s3
async function rotateImage(img, angle) {
  try {
    const imgName = img.dataset.name;
  
    // sharp only accepts positive rotation values:
    // const translatedAngle = Math.abs(360 - Math.abs(angle));
    
    const response = await fetch(`/articles/rotate/${imgName}/${angle}`, {
      method: 'PUT'
    });
    console.log({code: response.status, status: response.statusText, url: response.url})
  }
  catch(err) {
    console.error(err);
    makeAlert(err);
  }
}

// splits a filename into its name and extension
function splitFilename(filename) {
  const [name, ext] = filename.split('.');
  return [name, ext];
}

// https://stackoverflow.com/questions/24004791/what-is-the-debounce-function-in-javascript
function debounce(func, wait, immediate) {
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

// tags the list of article tags and turns them into tag elements
function initializeTags() {
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

tagsTypeAhead();
initializeTags();
configureContentBtns();