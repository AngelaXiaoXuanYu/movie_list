// 宣告 API 網址為變數的目的是為了日後容易維護
const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
// 一頁顯示 12 部電影
const MOVIES_PER_PAGE = 12

// 把 axios 得到的 results (80部電影的陣列) 裡拿出來再放進 movies
const movies = []
// filteredMovies 是用來存放搜尋的結果
let filteredMovies = []

// cards 都是放在 #data-panel 裡面，所以要先把它叫出來
const dataPanel = document.querySelector('#data-panel')

const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

// 分頁器
const paginator = document.querySelector('#paginator')

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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  });
  dataPanel.innerHTML = rawHTML
}

// 渲染分頁器
function renderPaginator(amount) {
  // 計算總頁數，利用 Math.ceil() 無條件進位
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }

  paginator.innerHTML = rawHTML
}

// 將電影分頁(顯示第幾頁中的電影們)
function getMoviesByPage(page) {
  // 「三元運算子： 條件 ？ Ａ ： Ｂ」：若 filteredMovies 的長度不為 0(true)，表示現在處於搜尋狀態，那此時 data 應為 filteredMovies，反之，非搜尋狀態 data 應為含有80部電影的 movies
  const data = filteredMovies.length ? filteredMovies : movies

  const startIndex = (page - 1) * MOVIES_PER_PAGE

  // slice(起點位置, 終點位置(不包含該項))，會回傳切割後的陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 出現彈跳視窗
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

// 收藏電影
function addToFavorite(id) {
  // local storage 可以將網站資料以字串方式儲存在使用者的瀏覽器內，另一個分頁就可以繼續利用這個分頁的資料。
  // JSON.parse() 可以將 JSON 格式的字串轉回 JavaScript 原生物件。
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  // find() 適用於陣列，會將陣列中的所有元素拿來跟條件函式的內容做比對，找到第一個符合條件者就會停下來回傳該值。
  // 條件函式：function isMovieIdMatched(movie) {return movie.id === id} ，亦即 要在80筆電影的陣列裡，找到符合＋按鈕的id的那筆電影資料。
  const movie = movies.find(movie => movie.id === id)

  // 檢查 list 內是否有重複的電影
  // some() 和 find 類似，但 some 只會回報「陣列裡有無符合條件者」
  if (list.some(movie => movie.id === id)){
    return alert('此電影已在收藏清單中！')
  }
 
  list.push(movie) 
 
  // JSON.stringify() 可以將資料轉為 JSON 格式的字串。
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 按鈕的監聽器
dataPanel.addEventListener('click', function onPanelClicked(event) {
  // 點擊 more 按鈕(.btn-show-movie) 要顯示該電影的 modal
  // 點擊 + 按鈕(.btn-add-favorite) 要收藏該電影
  if (event.target.matches('.btn-show-movie')) {
    console.log(event.target.dataset.id)
    // dataset 就是  HTML 標籤中定義 data-* 的屬性
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 分頁器的監聽器
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 若按到的 event.taget 不是 <a></a> 就不執行接續程式碼
  if (event.target.tagName !== 'A')  return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

// 搜尋電影的監聽器
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // preventDefault 是請瀏覽器不要做預設動作(重整頁面)，依照我們寫的 JS 去執行就好
  event.preventDefault()

  // trim() 是將字串頭尾空白去掉，避免輸入一堆空白卻被視為有輸入
  // toLowerCase() 是將關鍵字都轉換成小寫，避免大小寫不同產生問題
  const keyword = searchInput.value.trim().toLowerCase()
  
  // 如果沒輸入東西或空白字串，要跳出這個彈跳視窗
  // if (!keyword.length) {
  //   return alert('請輸入有效字串！')
  // }

  // 檢查「有無電影名稱包含關鍵字」(方法一)
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  // 檢查「有無電影名稱包含關鍵字」(方法二)
  // filter() 適用於陣列，會將陣列中的所有元素拿來跟條件函式的內容做比對，所有符合者都會被保留並回傳成新的陣列
  // 陣列操作三寶：map、filter、reduce
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword)
  )

  // 若找不到符合關鍵字的電影，要出現這個彈跳視窗
  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }

  // 渲染分頁器的資料 採用 篩選後的電影的數量
  renderPaginator(filteredMovies.length)
  // 渲染電影清單的資料 採用 篩選後的電影陣列
  renderMovieList(getMoviesByPage(1))
})


axios.get(INDEX_URL).then((response) => {
    // 「...」 是展開運算子，主要功能是「展開陣列元素」
    movies.push(... response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))
