const table = document.querySelector('.table');
const addBtn = document.querySelector('#add-btn');
const submitBtn = document.querySelector('#submit-btn');

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
    <input type="number" class="num" name="token_${n}" value=${n} autocomplete="off" required>
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
  deleteBtn.innerText = 'x';
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

function deleteInputGroup(e) {
  e.stopPropagation();
  const parent = e.target.parentElement;
  updateLocalStorage(e, true);
  parent.remove();
  const newLastGroup = getInputGroups().lastGroup;
  resetEventListener(null, newLastGroup);
}

function isCompleteInput(lastGroup) {
  const lastGroupBeerBtns = Array.from(lastGroup.querySelectorAll('.beer'));
  const lastGroupCupBtns = Array.from(lastGroup.querySelectorAll('.cup'));

  return (lastGroupBeerBtns.filter(btn => btn.checked).length && lastGroupCupBtns.filter(btn => btn.checked).length);
}

function validateForm(e) {
  const allInputGroups = getInputGroups().allGroups;
  for (const group of allInputGroups) {
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

function updateLocalStorage(e, remove=false) {
  const store = JSON.parse(localStorage.getItem('store')) || {};
  
  const inputGroup = e.target.closest('.input-group');
  if (!inputGroup) {
    return console.log('No changes to localStorage');
  }
  const id = inputGroup.querySelector('.num').value;

  if (remove) {
    delete store[id]
  }
  else {
    const beer = Array.from(inputGroup.querySelectorAll('.beer')).filter(btn => btn.checked)[0];
    const cup = Array.from(inputGroup.querySelectorAll('.cup')).filter(btn => btn.checked)[0];

    if (beer || cup) {
      store[id] = {
        beer: beer ? beer.value : "",
        cup: cup ? cup.value : ""
      }
    }
  }

  localStorage.setItem('store', JSON.stringify(store));
}

function initializeForm(store) {
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
// the input labels have an integrated eventListener on them to check their input box if theyre clicked, which also triggers a second click event.
function handleClick(e) {
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

const lastGroup = getInputGroups().lastGroup;
lastGroup.addEventListener('click', handleClick);

table.addEventListener('click', updateLocalStorage);

const store = JSON.parse(localStorage.getItem('store')) || {};
initializeForm(store);