const sortBtn = document.querySelector('#sort-btn');
const sortCriteria = document.querySelector('#sort-criteria')
const sortValue = document.querySelector('#sort-value')
const matchCriteria = document.querySelector('#match-criteria')
const matchValue = document.querySelector('#match-value')

// redirect to a URL with a query string based 
sortBtn.addEventListener('click', () => {
    const sort_criteria = sortCriteria.value;
    const sort_value = sortValue.value;
    const match_criteria = matchCriteria.value;
    const match_value = matchValue.value;
    // console.log(sort_criteria, sort_value)

    let query = [];
    if (sort_criteria && sort_value) query.push(`${sort_criteria}=${sort_value}`);

    if (match_criteria && match_value) query.push(`${match_criteria}=${match_value}`);

    const url = `
        /beer-reviews?${query.join('&')}
    `
    window.location.href=url;
})