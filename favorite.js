// 宣告 API 網址為變數的目的是為了日後容易維護
const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

// 把存在 localStorage 的電影清單放進 movies
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

// cards 都是放在 #data-panel 裡面，所以要先把它叫出來
const dataPanel = document.querySelector('#data-panel')

// 把 80 筆電影做成 html 的 card 
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2"> 
          <div class="card">
            <img src="${POSTER_URL + item.image} " class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  });
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release Date:' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML =
      `<img src="${POSTER_URL + data.image}" class="card-img-top" alt="Movie Poster" class="img-fluid">`
  })
}

// 移除收藏電影
function removeFromFavorite(id) {
  // 若收藏清單是空的，就結束這個函式。設計這一項是為了更加嚴謹，避免未來程式碼變得龐大而容易出錯。
  if (!movies || !movies.length) return 

  // findIndex() 適用於陣列，會回傳符合條件的項目的 index
  const movieIndex = movies.findIndex(movie => movie.id === id)

  // 若傳入的 id 在收藏清單中不存在，就結束這個函式。設計這一項是為了更加嚴謹，避免未來程式碼變得龐大而容易出錯。
  if (movieIndex === -1) return

  // 從現在的 movies 陣列(也就是收藏電影清單)中，從第Ａ部電影移除Ｂ部電影
  movies.splice(movieIndex, 1)

  // JSON.stringify() 可以將資料轉為 JSON 格式的字串。
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))

  // 可以在按刪除的同時，重新渲染畫面，即時讓電影被立刻刪除
  renderMovieList(movies)
}


dataPanel.addEventListener('click', function onPanelClicked(event) {
  // 點擊 more 按鈕(.btn-show-movie) 要顯示該電影的 modal
  // 點擊 + 按鈕(.btn-add-favorite) 要收藏該電影
  if (event.target.matches('.btn-show-movie')) {
    console.log(event.target.dataset.id)
    // dataset 就是  HTML 標籤中定義 data-* 的屬性
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)