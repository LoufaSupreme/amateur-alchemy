// import typeAhead from './modules/typeAhead.js'

const flashes = document.querySelectorAll('.flash');
flashes.forEach(flash => {
    flash.addEventListener('transitionend', () => {
        flash.remove();
    });
    setTimeout(() => {
        flash.classList.add('hide')
    }, 2000)
})

/////////////////// HELPER FUNCTIONS
const capitalizeFirst = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// create a custom flash message
function makeAlert(content, duration = 2000) {
    const alertContainer = document.querySelector('.flash-container');
    const newAlert = document.createElement('div');
    newAlert.classList.add('flash');
    newAlert.innerText = content;
    alertContainer.append(newAlert);
    newAlert.addEventListener('transitionend', () => {
        newAlert.remove();
    })
    setTimeout(() => {
        newAlert.classList.add('hide')
    }, duration)
}
