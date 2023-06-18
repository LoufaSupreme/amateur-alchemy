function typeAhead(container, allData) {
  if (!container) return;

  const input = container.querySelector('input');
  const dropdown = container.querySelector('.dropdown');

  // populate dropdown list
  input.addEventListener('input', function() {
    // if no value, quit
    if (!this.value) {
      dropdown.style.display = 'none';
      return;
    }

    // show the matching results in the dropdown
    dropdown.style.display = 'block';
    dropdown.innerHTML = "";

    const matches = findMatches(this.value, allData, 10);
    const matchesHTML = convertToHTML(matches);

    matchesHTML.forEach(match => {
      dropdown.appendChild(match);
    })
  })

  // handle keyboard inputs
  input.addEventListener('keydown', (e) => {
    // if key isn't up, down or enter, ignore:
    if (![38, 40, 13].includes(e.keyCode)) {
      return;
    }
    const activeClass = 'dropdown__suggestion--active';
    const current = container.querySelector(`.${activeClass}`);
    const allSuggestions = container.querySelectorAll('.dropdown__suggestion');

    let next;
    // if user presses down arrow
    if (e.keyCode === 40 && current) {
      next = current.nextElementSibling || allSuggestions[0];
    }
    else if (e.keyCode === 40) {
      next = allSuggestions[0];
    }
    // if user presses up arrow
    else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || allSuggestions[allSuggestions.length - 1];
    }
    else if (e.keyCode === 38) {
      next = allSuggestions[allSuggestions.length - 1];
    }
    // if user presses enter
    else if (e.keyCode === 13 && current) {
      handleDropdownSelection(current)
      return;
    }
    if (current) current.classList.remove(activeClass);
    next.classList.add(activeClass);
  })
}

function findMatches(target, list, limit) {
  return list.filter(item => {
    const regex = new RegExp(target, 'gi');
    return item.match(regex)
  }).slice(0, limit);
}

function convertToHTML(matches) {
  return matches.map(match => {
    const li = document.createElement('li');
    li.classList.add('dropdown__suggestion');
    li.innerText = match;
    // write a custom handleDropdownSelection fn for each instance where you need a dropdown
    li.addEventListener('click', (e) => {
      handleDropdownSelection(e.target);
    })
    return li;
  });
}