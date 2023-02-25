const table = document.querySelector('.table');
const addBtn = document.querySelector('#add-btn');
const submitBtn = document.querySelector('#submit-btn');
// local storage
const currentUrl = window.location.pathname;
const store = JSON.parse(localStorage.getItem(currentUrl)) || {};

function getInputGroups() {
  const inputGroups = Array.from(document.querySelectorAll('.input-group'));
  const lastGroup = inputGroups[inputGroups.length-1];
  
  return {
    allGroups: inputGroups,
    lastGroup,
    totalGroups: inputGroups.length
  }
}

function createInput(type, name, id, className, n) {
  return `\
    <input type="${type}" class="${className}" name="${name}_${n}" id="${id}_${n}" value="${id}" required="required">\
    <label for="${id}_${n}">${capitalizeFirst(id)}</label>\
  `;
}

function createInputGroup(lastGroup, num=null) {
  const id_num = lastGroup && +lastGroup.querySelector('.num').value;
    
  const n = id_num ? id_num + 1 : num ? num : 1;
  const newInputGroup = document.createElement('div');
  newInputGroup.classList.add('form-group');
  newInputGroup.classList.add('input-group');
  newInputGroup.innerHTML = `\
    <input type="number" class="num" name="token_${n}" value=${n} autocomplete="off" data-num="${n}" required>
    <div class="btn-group">
      ${createInput("radio", "unique_beer", "blue", "beer blue", n)}
      ${createInput("radio", "unique_beer", "yellow", "beer yellow", n)}
    </div>
    <div class="btn-group">
      ${createInput("radio", "unique_cup", "A", "cup", n)}
      ${createInput("radio", "unique_cup", "B", "cup", n)}
      ${createInput("radio", "unique_cup", "C", "cup", n)}
    </div>
  `;

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-item-btn');
  deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  deleteBtn.addEventListener('click', deleteInputGroup);
  newInputGroup.appendChild(deleteBtn)
  
  table.appendChild(newInputGroup);

  resetEventListener(lastGroup, newInputGroup);

  return newInputGroup;
} 
  
function resetEventListener(oldLast, newLast) {
  if (oldLast) oldLast.removeEventListener('click', handleClick);
  newLast.addEventListener('click', handleClick);
}

function deleteInputGroup() {
  const parent = this.parentElement;
  const id = parent.querySelector('.num').value;
  parent.remove();
  deleteFromLocalStorage(id);
  
  const newLastGroup = getInputGroups().lastGroup;
  if (newLastGroup) resetEventListener(null, newLastGroup);
}

// check if an input group has both a beer and cup selected
function isCompleteInput(lastGroup) {
  const lastGroupBeerBtns = Array.from(lastGroup.querySelectorAll('.beer'));
  const lastGroupCupBtns = Array.from(lastGroup.querySelectorAll('.cup'));

  return (lastGroupBeerBtns.filter(btn => btn.checked).length && lastGroupCupBtns.filter(btn => btn.checked).length);
}

// check form prior to submit to server
function validateForm(e) {
  const allInputGroups = getInputGroups().allGroups;
  const seen = [];

  // check if an ID # is duplicated
  for (const group of allInputGroups) {
    const num = group.querySelector('.num').value;
    
    if (seen.includes(num)) {
      group.scrollIntoView();
      group.classList.add('failed-validation');
      setTimeout(() => {
        group.classList.remove('failed-validation');
      }, 3000);
      makeAlert("There appears to be a duplicated ID number!", 6000);
      return e.preventDefault();
    }
    seen.push(num);

    // check that all the input groups are complete
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

function updateLocalStorage() {
  console.log('Updating storage')
  const inputGroups = getInputGroups().allGroups;
  
  inputGroups.forEach(group => {
    // get values of inputs
    const id = group.querySelector('.num').value;
    const beer = Array.from(group.querySelectorAll('.beer')).filter(btn => btn.checked)[0];
    const cup = Array.from(group.querySelectorAll('.cup')).filter(btn => btn.checked)[0];

    // if theres a checked value for the beer or the cup then update the store
    if (beer || cup) {
      store[id] = {
        beer: beer ? beer.value : "",
        cup: cup ? cup.value : ""
      }
    }
  });

  localStorage.setItem(currentUrl, JSON.stringify(store));
}

function deleteFromLocalStorage(id) {
  delete store[id];
}

function initializeForm() {
  // remove initial inputGroups if theres local storage
  if (Object.keys(store).length) {
    getInputGroups().allGroups.forEach(group => group.remove());
  }

  // build the form from local storage:
  for (const num of Object.keys(store)) {
    const beer = store[num].beer;
    const cup = store[num].cup;

    const newInputGroup = createInputGroup(null, num);
    const beerInput = newInputGroup.querySelector(`#${beer}_${num}`);
    const cupInput = newInputGroup.querySelector(`#${cup}_${num}`);

    if (beerInput) beerInput.checked = true;
    if (cupInput) cupInput.checked = true;
  }
}

// this fires twice due to a bug
// the input labels have a default eventListener on them (from the browser) to check their input box if theyre clicked, which also triggers a second click event.
function handleClick(e) {
  if (e.target.classList.contains("delete-item-btn")) return;
  const lastGroup = getInputGroups().lastGroup;
  if (isCompleteInput(lastGroup)) createInputGroup(lastGroup);
}

addBtn.addEventListener('click', () => {
  const groups = getInputGroups();
  createInputGroup(groups.lastGroup);
})

submitBtn.addEventListener('click', (e) => {
  const inputGroups = getInputGroups();
  const lastGroup = inputGroups.lastGroup;
  
  if (!isCompleteInput(lastGroup) && inputGroups.totalGroups > 1) {
    lastGroup.remove();
  }
  
  validateForm(e);
})

// populate the form from local storage if available
initializeForm();

// create a blank input group if there are none
if (getInputGroups().totalGroups === 0) {
  createInputGroup(null);
}

const lastGroup = getInputGroups().lastGroup;
lastGroup.addEventListener('click', handleClick);

table.addEventListener('click', updateLocalStorage);
