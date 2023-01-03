
const copyUrlBtns = document.querySelectorAll('.gallery-copy-btn');

function copyToClipboard(targetText) {
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = targetText
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    makeAlert('Copied to Clipboard!')
}

copyUrlBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();

        copyToClipboard(this.parentElement.querySelector('.gallery-url').innerText)
    })
})