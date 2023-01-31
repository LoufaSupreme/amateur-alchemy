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

function createInputGroup(lastGroup) {
  const id_num = lastGroup && +lastGroup.querySelector('.num').value;
    
  const n = id_num ? id_num + 1 : 1;
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
} 
  
function resetEventListener(oldLast, newLast) {
  if (oldLast) oldLast.removeEventListener('click', handleClick);
  newLast.addEventListener('click', handleClick);
}

function deleteInputGroup(e) {
  e.stopPropagation();
  const parent = e.target.parentElement;
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

function handleClick(e) {
  const lastGroup = getInputGroups().lastGroup;
  if (isCompleteInput(lastGroup)) createInputGroup(lastGroup);
}

const lastGroup = getInputGroups().lastGroup;
lastGroup.addEventListener('click', handleClick);

addBtn.addEventListener('click', () => {
  const groups = getInputGroups();
  createInputGroup(groups.lastGroup);
})

submitBtn.addEventListener('click', (e) => {
  const inputGroups = getInputGroups();
  const lastGroup = inputGroups.lastGroup;

  if (!isCompleteInput(lastGroup) && inputGroups.totalGroups > 0) {
    lastGroup.remove();
  }
  
  validateForm(e);
})
