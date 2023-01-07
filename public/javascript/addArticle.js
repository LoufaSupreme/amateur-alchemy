const htmlPreview = `\
<style>
    
</style>
<p>
    <figure class="float-right fig-small">
        <img  src="/uploads/b62f70af-e190-4eb6-83a2-23db7b9b2bd9.jpeg" alt="canoeing">
        <figcaption>We out here we finna bust</figcaption>
    </figure>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vestibulum lacinia dui at sagittis. Etiam suscipit erat dapibus, dictum eros vitae, pharetra tellus. Mauris pellentesque venenatis metus. Maecenas iaculis malesuada odio at sollicitudin. Donec vulputate convallis semper. Cras pretium sit amet elit sed laoreet. Duis porta tristique nibh. Maecenas imperdiet molestie tellus, ut aliquet nisi ornare vitae. Nunc auctor tristique turpis nec tristique. Pellentesque blandit lectus eu est consectetur mattis non eget quam. In nec cursus elit, quis dictum augue.

    Vivamus at tempor odio. Pellentesque posuere, mi in tempus vehicula, eros risus luctus dolor, condimentum commodo mauris mauris sit amet nulla. Cras tincidunt pharetra turpis nec congue. Sed ornare consectetur facilisis. Mauris ultrices vulputate lacus, ac fermentum risus porttitor in. Vivamus varius rutrum enim. Pellentesque varius, augue vel tristique hendrerit, dolor lorem fringilla diam, vitae luctus ligula mauris quis turpis. Proin suscipit elit non ante dignissim, id pharetra velit iaculis. Pellentesque ac libero pellentesque, suscipit orci et, posuere risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam nec euismod dui, eget laoreet diam. In pretium quis diam nec mattis. In ultrices nec magna vel tincidunt. Fusce ex quam, eleifend sit amet egestas quis, vehicula a ex.

    Suspendisse sapien risus, venenatis sed ultrices eget, facilisis vitae sem. Nam eget lectus ut elit vestibulum dapibus. Praesent pretium eleifend consequat. Etiam consectetur, nisi et gravida placerat, neque mauris congue dui, sit amet semper lacus mi a leo. Nunc ac nisl elit. Duis sed sapien pulvinar, dapibus libero ac, pulvinar velit. Nulla at lorem elit. Aenean laoreet sodales ipsum nec hendrerit. Maecenas ut urna cursus, porta sapien eu, rhoncus ligula. Morbi vel felis ac purus dapibus congue. Praesent suscipit nulla lacinia, facilisis lectus tempor, consequat elit. Donec justo nulla, sodales id convallis vitae, pretium ac ligula. Vivamus vitae augue erat. Donec tristique vestibulum mattis.
</p>\ 
`;
const preview = document.querySelector('.preview');
const hiddenBodyInput = document.querySelector('#body');
const editor = ace.edit("editor", {
    maxLines: 80
});

editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/html");
editor.session.setUseWrapMode(true);
editor.setShowPrintMargin(false);
editor.session.setTabSize(2);

editor.session.on('change', function(delta) {
    // delta.start, delta.end, delta.lines, delta.action
    preview.innerHTML = editor.getValue();
    hiddenBodyInput.value = editor.getValue();
});

if (editor.getValue() === '') editor.setValue(htmlPreview);
preview.innerHTML = editor.getValue();


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