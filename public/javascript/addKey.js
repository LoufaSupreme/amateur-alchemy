const table = document.querySelector('.table');
const addBtn = document.querySelector('#add-btn');

function getLastInputGroup() {
  const inputGroups = Array.from(document.querySelectorAll('.input-group'));
  const lastGroup = inputGroups[inputGroups.length-1];
  
  return {
    lastGroup,
    totalGroups: inputGroups.length
  }
}

function createInputGroup(lastGroup, totalGroups, manual=false) {
  const cupLetter = lastGroup.querySelector('.letter').value;
  const cupNumber = +lastGroup.querySelector('.num').value;

  if (
    !manual && 
    (!['A', 'B', 'C', 'a', 'b', 'c'].includes(cupLetter) ||
    cupNumber === 0)
  ) return;

  const n = cupNumber + 1;
  const newInputGroup = document.createElement('div');
  newInputGroup.classList.add('form-group');
  newInputGroup.classList.add('input-group');
  newInputGroup.innerHTML = `\
    <input type="number" class="num" name="token_${n}" value=${n} autocomplete="off" required>
    <input type="text" class="letter" name="name_${n}" maxlength=1 autocomplete="off" required>\
  `;

  table.appendChild(newInputGroup);

  resetEventListener(lastGroup, newInputGroup);
}

function resetEventListener(oldLast, newLast) {
  oldLast.querySelector('.letter').removeEventListener('input', handleCompleteInput);
  newLast.querySelector('.letter').addEventListener('input', handleCompleteInput);
}

function handleCompleteInput(e) {
  if (e.target.value) {
    const groups = getLastInputGroup();
    createInputGroup(groups.lastGroup, groups.totalGroups);
  }
}

const lastGroup = getLastInputGroup().lastGroup;
const cup = lastGroup.querySelector('.letter');
cup.addEventListener('input', handleCompleteInput);

addBtn.addEventListener('click', () => {
  const groups = getLastInputGroup();
  createInputGroup(groups.lastGroup, groups.totalGroups, true);
})