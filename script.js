var searchTimer;
var searchbox = document.getElementById("searchbox");
var inputBox = document.getElementById("input");
var lastVal = inputBox.value;


inputBox.onkeyup = (e) => {
  if (e.keyCode == 13) {//ENTER
    clearTimeout(searchTimer);
    let input = e.srcElement.value;
    let url = new URL(`${window.location.origin}/api/fastsearch/${input}`);
    window.location.href = url.href;
    return;
  }
  if(inputBox.value == lastVal) return;//Value not changed
  lastVal = inputBox.value;
  if (searchTimer) clearTimeout(searchTimer);
  if (inputBox.value == "") return;//empty
  searchbox.innerHTML = "";
  searchTimer = setTimeout(() => {
    const url = new URL(`${window.location.origin}/api/search/${inputBox.value}`).href;
    fetch(url).then(res => {
      res.json().then(jsondata => {
        searchbox.innerHTML = "";
        console.log(jsondata);
        jsondata.forEach(item => {
          let url = new URL(`${window.location.origin}/item/${item.href}`)
          searchbox.innerHTML += `<a href="${url.href}">${item.name}</a>`
        })
      })
    })
  }, 500)
}

inputBox.onfocus = (e) => {
    searchbox.style.display = "block";
}

inputBox.onblur = (e) => {
  setTimeout(() => {searchbox.style.display = "none"}, 100)
}

for (let img of document.querySelectorAll("img")) {
  let url = img.dataset.src;
  if (!url) url = img.src;
  else {
    delete img.dataset.src;
    img.classList.remove("lazyload");
  }
  url = url.slice(0, url.indexOf(".png") + 4)
  img.src = url;
}