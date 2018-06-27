var subreddit = "streetwear";
var search_text = "nike";
var date_from = new Date(1970, 01, 01) * 1000;
var date_to = new Date(Date.now()) * 1000;
var count = 0;
var data = {};

function requestJson() {
  if (document.querySelector('#subreddit').value != '')
    subreddit = document.querySelector('#subreddit').value;

  if (document.querySelector('#search_text').value != '')
    search_text = document.querySelector('#search_text').value;

  if (document.querySelector('#date_from').value != '')
    date_from = convertToUnixTimestamp(document.querySelector('#date_from').value);
  if (document.querySelector('#date_to').value != '')
    date_to = convertToUnixTimestamp(document.querySelector('#date_to').value);

  let exp_timestamp = new Date();
  exp_timestamp.setMinutes(exp_timestamp.getMinutes() + 5);
  exp_timestamp = exp_timestamp * 1000;
  if (localStorage.data != undefined) {
    data = JSON.parse(localStorage.data);
  }
  if (localStorage.data != undefined && data.exp_timestamp > new Date() * 1000 && data.subreddit === subreddit && data.search_text === search_text) {
    console.log('data fetched from localStorage');
    createDynamicElements(data);
  } else {
    let localData = [];
    console.log('data fetched from reddit');
    let request = new XMLHttpRequest();
    request.open('GET', 'https://reddit.com/r/' + subreddit + "/search.json" + "?q=" + search_text + "&limit=100", true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        data = JSON.parse(request.responseText);
        for (i = 0; i < data.data.children.length; i++) {
          localData.push(data.data.children[i]);
        }
        data = {
          subreddit,
          search_text,
          exp_timestamp,
          children: localData
        }
        //save to localStorage
        localStorage.setItem("data", JSON.stringify(data));
        createDynamicElements(data);
      } else {
        return;
      }
    };
    request.onerror = function() {
    };

    request.send();
  }
}

function createDynamicElements(data) {
  for (i = 0; i < data.children.length; i++) {
    createdDate = convertTimestamp(data.children[i].data.created);
    createdDate = convertToUnixTimestamp(createdDate.substr(6, 4) + '-' + createdDate.substr(3, 2) + '-' + createdDate.substr(0, 2));

    if (data.children[i].data.thumbnail != "self" && data.children[i].data.thumbnail != "image" && data.children[i].data.thumbnail != "default" && createdDate >= date_from && createdDate <= date_to) {
      var iLi = document.createElement('li');
      iLi.className = 'c-tile-list__item';
      document.getElementsByTagName('ul')[0].appendChild(iLi);

      var iArticle = document.createElement('article');
      iArticle.className = 'c-article-tile t-web';
      iArticle.itemtype="http://schema.org/Article";
      iLi.appendChild(iArticle);

      var iDiv = document.createElement('div');
      iDiv.className = 'c-article-tile__header';
      iArticle.appendChild(iDiv);

      var iAhref = document.createElement('a');
      iAhref.className="c-article-tile__category";
      iAhref.href = "https://example.com";
      iAhref.itemProp = "keywords";
      iAhref.innerHTML = data.children[i].data.subreddit;
      iDiv.appendChild(iAhref);

      var iAhref2 = document.createElement('a')
      iAhref2.className = "c-article-tile__comment-count";
      iAhref2.href = "https://example.com";
      iAhref2.itemProp = "commentCount";
      iAhref2.innerHTML = data.children[i].data.num_comments + ' <svg class="icon icon-bubble" aria-label="comments"><use xlink:href="#icon-bubble"></use></svg>';
      iDiv.appendChild(iAhref2);

      var iDiv2 = document.createElement('div');
      iDiv2.className = 'c-article-tile__body';
      iDiv2.innerHTML = '<h2 class="c-article-tile__title" itemprop="headline"><a href="' + data.children[i].data.url + '">' + data.children[i].data.title.substr(0, 30) + ' ...</a><p align="center"><img src="' + data.children[i].data.thumbnail + '"</p></h2>';
      iArticle.appendChild(iDiv2);

      var footer = document.createElement('footer');
      footer.className = 'c-article-tile__footer';
      footer.innerHTML = '<span class="c-article-tile__author">by <a href="https://www.sitepoint.com/author/hgiraudel/" itemprop="author">' + data.children[i].data.author + '</a></span><time datetime="' + convertTimestamp(data.children[i].data.created) + '" class="c-article-tile__date" itemprop="datePublished">' + convertTimestamp(data.children[i].data.created) + '</time>';
      iArticle.appendChild(footer);
    }

  }
  setTimeout(()=>{document.getElementById('loader').classList.remove("loading")}, 5000);
  // document.querySelector('#loader').classList.remove("loading");
}

function convertToUnixTimestamp(theDate) {
    d = new Date(theDate.substr(0, 4), theDate.substr(5, 2), theDate.substr(8, 2)) * 1000;
    return d;
    // return new Date();
}

function convertTimestamp(timestamp) {
  var d = new Date(timestamp * 1000),	// Convert the passed timestamp to milliseconds
    yyyy = d.getFullYear(),
    mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
    dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
    hh = d.getHours(),
    h = hh,
    min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
    ampm = 'AM',
    time;

  if (hh > 12) {
    h = hh - 12;
    ampm = 'PM';
  } else if (hh === 12) {
    h = 12;
    ampm = 'PM';
  } else if (hh == 0) {
    h = 12;
  }

  // ie: 2013-02-18, 8:35 AM
  time = dd + '/' + mm + '/' + yyyy + ', ' + h + ':' + min + ' ' + ampm;

  return time;
}

async function loadingData() {
  document.getElementById('loader').classList.add("loading");
  await requestJson();
}

function search() {
  document.getElementById('main_article').innerHTML = "";
  loadingData();
}

loadingData();
