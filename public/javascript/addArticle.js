
const showcase_img = document.querySelector('#showcase_img');
const photos = document.querySelector('#photos');
const savePhotosBtn = document.querySelector('#saveImgBtn');
const articleTitle = document.querySelector('#title');

async function postPhotos(formData) {
    try {
        const res = await fetch('/api/articles/upload', {
            method: 'POST',
            body: formData,
        });
        const result = await res.json();
        // makeAlert(article)
        // redirect to the add-article page but with the new content included
        window.location.href = `/articles/${result.article.slug}/edit`
    }
    catch(err) {
        console.error(err);
        makeAlert(err);
    }
}

async function handleBtnClick(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('showcase_img', showcase_img.files[0]);
    for (const photo of photos.files) {
        formData.append('photos', photo);
    }
    formData.append('title', articleTitle.value)
    
    await postPhotos(formData)
}

savePhotosBtn.addEventListener('click', handleBtnClick);