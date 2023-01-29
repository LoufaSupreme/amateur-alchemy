const table = document.querySelector('.table');
const addBtn = document.querySelector('#add-btn');
const submitBtn = document.querySelector('#submit-btn');
const allowableLetters = ['A', 'B', 'C', 'a', 'b', 'c'];

function getLastInputGroup() {
  const inputGroups = Array.from(document.querySelectorAll('.input-group'));
  const lastGroup = inputGroups[inputGroups.length-1];
  
  return {
    lastGroup,
    totalGroups: inputGroups.length
  }
}

function createInputGroup(lastGroup, manual=false) {
  const cupLetter = lastGroup && lastGroup.querySelector('.letter').value;
  const cupNumber = lastGroup && +lastGroup.querySelector('.num').value;
  
  if (
    !manual && 
    (!allowableLetters.includes(cupLetter) ||
    cupNumber === 0)
  ) return;
    
  const n = cupNumber ? cupNumber + 1 : 1;
  const newInputGroup = document.createElement('div');
  newInputGroup.classList.add('form-group');
  newInputGroup.classList.add('input-group');
  newInputGroup.innerHTML = `\
    <input type="number" class="num" name="token" value=${n} autocomplete="off" required>
    <input type="text" class="letter" name="unique_beer" maxlength=1 autocomplete="off" pattern="[abcABC]{1}" required oninvalid="this.setCustomValidity('Letters must be A, B or C')" oninput="this.setCustomValidity('')")>\
  `;

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-item-btn');
  deleteBtn.innerText = 'x';
  deleteBtn.addEventListener('click', deleteInputGroup);
  newInputGroup.appendChild(deleteBtn)
  
  table.appendChild(newInputGroup);
  
  if (lastGroup) resetEventListener(lastGroup, newInputGroup);
} 
  
function resetEventListener(oldLast, newLast) {
  oldLast.querySelector('.letter').removeEventListener('input', handleCompleteInput);
  newLast.querySelector('.letter').addEventListener('input', handleCompleteInput);
}
  
function handleCompleteInput(e) {
  if (e.target.value) {
    const groups = getLastInputGroup();
    createInputGroup(groups.lastGroup);
  }
}

function deleteInputGroup(e) {
  const parent = e.target.parentElement;
  parent.remove();
}

const lastGroup = getLastInputGroup().lastGroup;
const cup = lastGroup.querySelector('.letter');
cup.addEventListener('input', handleCompleteInput);

addBtn.addEventListener('click', () => {
  const groups = getLastInputGroup();
  createInputGroup(groups.lastGroup, true);
})

submitBtn.addEventListener('click', () => {
  const lastGroup = getLastInputGroup().lastGroup;
  if (lastGroup.querySelector('.letter').value === "") {
    lastGroup.remove();
  }
})
