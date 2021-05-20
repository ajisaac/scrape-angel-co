document.getElementById("scrape").onclick = () => {
  // if current tab is an angellist job page... todo
  browser.tabs.executeScript({file: "/content-scripts/scrape-details.js"})
      .then(() => {
        console.log("hello world 2")
      })
      .catch(err => {
        console.log(err)
      })
}



