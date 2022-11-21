
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

