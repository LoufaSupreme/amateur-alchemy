const htmlPreview = `\
    <div class="ace">Wow</div>
    <p>WTF</p>\ 
`;
const editor = ace.edit("editor");
const preview = document.querySelector('.preview');

editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/html");
editor.session.setUseWrapMode(true);
editor.setShowPrintMargin(false);
editor.session.on('change', function(delta) {
    // delta.start, delta.end, delta.lines, delta.action
    preview.innerHTML = editor.getValue();
});
editor.setValue(htmlPreview);
preview.innerHTML = htmlPreview;


const copyUrlBtns = document.querySelectorAll('.gallery-copy-btn');
const lockBtns = document.querySelectorAll('.gallery-lock-btn');

function copyToClipboard(targetText) {
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = targetText
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    makeAlert('Copied to Clipboard!')
}

lockBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();

        btn.classList.toggle('locked');
        btn.parentElement.classList.toggle('locked');
        if (btn.classList.contains('locked')) {
            btn.innerHTML = '<i class="fa-solid fa-lock"></i>'
        }
        else btn.innerHTML = '<i class="fa-solid fa-lock-open"></i>'
    })
})

copyUrlBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();

        copyToClipboard(this.parentElement.querySelector('.gallery-url').innerText);

        this.parentElement.classList.add('locked');
        const lockBtn = this.parentElement.querySelector('.gallery-lock-btn');
        lockBtn.classList.add('locked');
        lockBtn.innerHTML = '<i class="fa-solid fa-lock"></i>'
    })
})