const htmlPreview = `\
<style>

</style>
<section>
  <figure class="float-right fig-small">
      <img  src="/uploads/b62f70af-e190-4eb6-83a2-23db7b9b2bd9.jpeg" alt="canoeing">
      <figcaption>We out here we finna bust</figcaption>
  </figure>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vestibulum lacinia dui at sagittis. Etiam suscipit erat dapibus, dictum eros vitae, pharetra tellus. Mauris pellentesque venenatis metus. Maecenas iaculis malesuada odio at sollicitudin. Donec vulputate convallis semper. Cras pretium sit amet elit sed laoreet. Duis porta tristique nibh. Maecenas imperdiet molestie tellus, ut aliquet nisi ornare vitae. Nunc auctor tristique turpis nec tristique. Pellentesque blandit lectus eu est consectetur mattis non eget quam. In nec cursus elit, quis dictum augue.
  </p>
  <h2>Brewing Dank Ass Beers</h2>
  <p>
    Vivamus at tempor odio. Pellentesque posuere, mi in tempus vehicula, eros risus luctus dolor, condimentum commodo mauris mauris sit amet nulla. Cras tincidunt pharetra turpis nec congue. Sed ornare consectetur facilisis. Mauris ultrices vulputate lacus, ac fermentum risus porttitor in. Vivamus varius rutrum enim. Pellentesque varius, augue vel tristique hendrerit, dolor lorem fringilla diam, vitae luctus ligula mauris quis turpis. Proin suscipit elit non ante dignissim, id pharetra velit iaculis. Pellentesque ac libero pellentesque, suscipit orci et, posuere risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam nec euismod dui, eget laoreet diam. In pretium quis diam nec mattis. In ultrices nec magna vel tincidunt. Fusce ex quam, eleifend sit amet egestas quis, vehicula a ex.
  </p>
</section>

<canvas id="chart1" class="chart" data-type="radar"></canvas> 

<div class="sidebyside flex">
  <figure>
    <img  src="/uploads/ab48b59b-d0ca-46e5-85a1-cc3d91d5e8a9.jpeg" alt="tanks">
    <figcaption>We out here we finna bust</figcaption>
  </figure>
  <figure>
      <img  src="/uploads/b62f70af-e190-4eb6-83a2-23db7b9b2bd9.jpeg" alt="canoeing">
      <figcaption>We out here we finna bust</figcaption>
  </figure>
</div>
<section>
  <p>
    Suspendisse sapien risus, venenatis sed ultrices eget, facilisis vitae sem. Nam eget lectus ut elit vestibulum dapibus. Praesent pretium eleifend consequat. Etiam consectetur, nisi et gravida placerat, neque 
  </p>
  <figure class="float-left fig-small">
      <img  src="/uploads/b62f70af-e190-4eb6-83a2-23db7b9b2bd9.jpeg" alt="canoeing">
      <figcaption>We out here we finna bust</figcaption>
  </figure>
  <p>
    Suspendisse sapien risus, venenatis sed ultrices eget, facilisis vitae sem. Nam eget lectus ut elit vestibulum dapibus. Praesent pretium eleifend consequat. Etiam consectetur, nisi et gravida placerat, neque mauris congue dui, sit amet semper lacus mi a leo. Nunc ac nisl elit. Duis sed sapien pulvinar, dapibus libero ac, pulvinar velit. Nulla at lorem elit. Aenean laoreet sodales ipsum nec hendrerit. Maecenas ut urna cursus, porta sapien eu, rhoncus ligula. 
  </p>
</section>
<blockquote>
  "Block quote. Block quote. Block quote. Block quote."
</blockquote>
<figure class="fig-full">
    <img  src="/uploads/b62f70af-e190-4eb6-83a2-23db7b9b2bd9.jpeg" alt="canoeing">
    <figcaption>We out here we finna bust</figcaption>
</figure>
<h2>Subheadings R' Us</h2>
<section>
  <aside class="float-right">
    <p>
    Suspendisse sapien risus, venenatis sed ultrices eget, facilisis vitae sem. Nam eget lectus ut elit vestibulum dapibus. Praesent pretium eleifend consequat.
    </p>
  </aside>
  <p>
    Suspendisse sapien risus, venenatis sed ultrices eget, facilisis vitae sem. Nam eget lectus ut elit vestibulum dapibus. Praesent pretium eleifend consequat. Etiam consectetur, nisi et gravida placerat, neque mauris congue dui, sit amet semper lacus mi a leo. Nunc ac nisl elit. Duis sed sapien pulvinar, dapibus libero ac, pulvinar velit. Nulla at lorem elit. Aenean laoreet sodales ipsum nec hendrerit. Maecenas ut urna cursus, porta sapien eu, rhoncus ligula. 
  </p>
</section>
<table class="styled-table">
  <thead>
    <tr>
      <th>Heading 1</th>
      <th>Heading 2</th>
      <th>Heading 3</th>
      <th>Heading 4</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
      <td>Data 3</td>
      <td>Data 4</td>
    </tr>
     <tr>
      <td>Data 5</td>
      <td>Data 6</td>
      <td>Data 7</td>
      <td>Data 8</td>
    </tr>
  </tbody>
</table>\ 
`;
const preview = document.querySelector('.preview');
const hiddenBodyInput = document.querySelector('#body');
const editor = ace.edit("editor", {
  maxLines: 120
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


const deleteBtns = document.querySelectorAll('.delete-btn');
const expandBtns = document.querySelectorAll('.expand-btn');
const rotateBtns = document.querySelectorAll('.rotate-btn');
const lockBtns = document.querySelectorAll('.lock-btn');
const galleryImgs = document.querySelectorAll('.gallery-img');

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

galleryImgs.forEach(img => {
  img.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();

    const [imgName, imgExt] = splitFilename(this.dataset.name);

    copyToClipboard(`https://amateur-alchemy.s3.us-east-2.amazonaws.com/${imgName}_small.${imgExt}`);

    this.parentElement.classList.add('locked');
    const lockBtn = this.parentElement.querySelector('.lock-btn');
    lockBtn.classList.add('locked');
    lockBtn.innerHTML = '<i class="fa-solid fa-lock"></i>'
  })
})

rotateBtns.forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();

    const img = this.parentElement.querySelector('img');
    const newAngle = +img.dataset.angle - 90;

    img.dataset.angle = newAngle;
    img.style.transform = `rotate(${newAngle}deg)`;
  
    debouncedRotateImage(img, newAngle);
  })
});

const debouncedRotateImage = debounce(rotateImage, 2000);

function rotateImage(img, angle) {
  const imgName = img.dataset.name;

  const translatedAngle = Math.abs(360 - Math.abs(angle));
  
  fetch(`/articles/rotate/${imgName}/${translatedAngle}`, {
    method: 'PUT'
  });
}

// splits a filename into its name and extension
function splitFilename(filename) {
  const [name, ext] = filename.split('.');
  return [name, ext];
}

// https://stackoverflow.com/questions/24004791/what-is-the-debounce-function-in-javascript
function debounce(func, wait, immediate) {
  // 'private' variable for instance
  // The returned function will be able to reference this due to closure.
  // Each call to the returned function will share this common timer.
  var timeout;

  // Calling debounce returns a new anonymous function
  return function() {
    // reference the context and args for the setTimeout function
    var context = this,
      args = arguments;

    // Should the function be called now? If immediate is true
    //   and not already in a timeout then the answer is: Yes
    var callNow = immediate && !timeout;

    // This is the basic debounce behaviour where you can call this
    //   function several times, but it will only execute once
    //   (before or after imposing a delay).
    //   Each time the returned function is called, the timer starts over.
    clearTimeout(timeout);

    // Set the new timeout
    timeout = setTimeout(function() {

      // Inside the timeout function, clear the timeout variable
      // which will let the next execution run when in 'immediate' mode
      timeout = null;

      // Check if the function already ran with the immediate flag
      if (!immediate) {
        // Call the original function with apply
        // apply lets you define the 'this' object as well as the arguments
        //    (both captured before setTimeout)
        func.apply(context, args);
      }
    }, wait);

    // Immediate mode and no wait timer? Execute the function...
    if (callNow) func.apply(context, args);
  }
}