const axios = require('axios').default;
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-form input');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let lightbox = new SimpleLightbox('.gallery a', {});

let page = 1;
let totalPages;
let totalHits;

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  let searchTerm = searchInput.value.toString();
  getPictures(searchTerm)
    .then(pictures => {
      gallery.innerHTML = '';
      loadMoreBtn.style.visibility = 'hidden';
      if (pictures.length === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
        page = 1;
        renderPictures(pictures);
        loadMoreBtn.style.visibility = 'visible';
        lightbox.refresh();
      }
    })
    .catch(error => console.log(error));
});

loadMoreBtn.addEventListener('click', () => {
  page++;
  let searchTerm = searchInput.value.toString();
  getPictures(searchTerm)
    .then(pictures => {
      loadMoreBtn.style.visibility = 'hidden';
      if (page > totalPages) {
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      } else {
        renderPictures(pictures);
        pageScroll();
        lightbox.refresh();
      }
      loadMoreBtn.style.visibility = 'visible';
    })
    .catch(error => console.log(error));
});

async function getPictures(searchTerm) {
  const response = await axios.get(
    `https://pixabay.com/api/?key=34679609-800cb3ce66b97456154e1ce44&q=${searchTerm}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
  );
  totalHits = await response.data.totalHits;
  totalPages = Math.ceil((await response.data.totalHits) / 40);
  const pictures = await response.data.hits;
  return pictures;
}

function renderPictures(pictures) {
  const markup = pictures
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
  <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b> ${likes}
    </p>
    <p class="info-item">
      <b>Views</b> ${views}
    </p>
    <p class="info-item">
      <b>Comments</b> ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b> ${downloads}
    </p>
  </div>
</div>`;
      }
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}

function pageScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
