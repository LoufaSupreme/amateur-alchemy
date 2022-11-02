
const flashes = document.querySelectorAll('.flash');
flashes.forEach(flash => {
    flash.addEventListener('transitionend', () => {
        flash.remove();
    });
    setTimeout(() => {
        flash.classList.add('hide')
    }, 2000)
})