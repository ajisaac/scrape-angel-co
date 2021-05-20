(function () {
  let results = {
    description: undefined,
    title: undefined,
    company: undefined,
    salary: undefined,
    location: undefined,
    jobType: undefined,
    experience: undefined,
    tags: undefined,
    remote: undefined,
    href: undefined
  }

  let sideBarVisited = false

  function foundAll() {
    return !!(results.description
        && results.title
        && results.company
        && results.salary
        && results.location
        && results.jobType
        && results.experience
        && results.tags
        && results.remote
        && results.href)
  }

  function parseLocations(node) {
    let spans = node.getElementsByTagName("span")
    if (!spans?.length) return
    if (spans.length === 0) return
    results.location = spans[0].textContent.split("•").map(l => l.trim())
  }

  function parseHiresRemotely(node) {
    let spans = node.getElementsByTagName("span")
    if (!spans?.length) return
    if (spans.length === 0) return
    results.remote = spans[0].textContent.split("•").map(l => l.trim())
  }

  function parseDataList(node) {
    // this should have some decent data in it
    let text = node?.textContent
    if (!text) return

    if (text.startsWith("Location")) {
      parseLocations(node)
      return
    }

    if (text.startsWith("Hires remotely")) {
      parseHiresRemotely(node)
      return
    }

    if (text.startsWith("Job type")) {
      let dd = node.getElementsByTagName("dd")
      if (dd.length > 0) {
        results.jobType = dd[0]?.textContent
      }
      return
    }

    if (text.startsWith("Experience")) {
      let dd = node.getElementsByTagName("dd")
      if (dd.length > 0) {
        results.experience = dd[0]?.textContent
      }
      return
    }

    if (text.startsWith("Skills")) {
      let dd = node.getElementsByTagName("dd")
      if (dd.length === 0) {
        return
      }
      let anchors = dd[0].getElementsByTagName("a")
      results.tags = []
      for (let a of anchors) {
        results.tags.push(a.innerText)
      }
    }
  }

  function parseSideBar(node) {
    if (node.children.length === 0) {
      return
    }
    for (let c of node.children) {
      if (c.hasAttributes()) {
        for (let att of c.attributes) {
          if (att.name === "class") {
            if (att.value.startsWith("styles_characteristic")) {
              parseDataList(c)
            }
          }
        }
      }

      parseSideBar(c)
    }
  }

  function parseTitleBar(node) {
    let correctTitleTag = false
    for (let a of node.getElementsByTagName("a")) {
      if (a.innerText === "Apply now") {
        correctTitleTag = true
        break
      }
    }
    for (let a of node.getElementsByTagName("button")) {
      if (a.innerText === "Apply now") {
        correctTitleTag = true
        break
      }
    }
    if (!correctTitleTag) {
      return
    }

    let header = node.getElementsByTagName("h2")
    if (header.length > 0) {
      results.title = header[0].textContent
    }
    let salary = node.getElementsByTagName("span")
    if (salary.length > 0) {
      results.salary = salary[0].textContent
    }
  }

  function parseDetails(node) {
    if (node.children.length === 0) {
      return false
    }
    for (let c of node.children) {
      if (c.hasAttributes()) {
        for (let att of c.attributes) {
          if (att.name === "class") {
            if (att.value.startsWith("styles_title")) {
              parseTitleBar(c)
              if (foundAll()) return true
            }

            if (att.value.startsWith("styles_description")) {
              results.description = c.innerHTML
              if (foundAll()) return true
            }

            if (att.value.startsWith("styles_sidebar")) {
              // only want to parse the one sidebar, assuming first we find
              if (!sideBarVisited) {
                sideBarVisited = true
                parseSideBar(c)
              }
              if (foundAll()) return true
            }

          }
        }
      }
      let ret = parseDetails(c)
      if (ret) {
        return ret
      }
    }
  }

  function findHref() {
    let href = window.location.href
    let parts = href.split("?")
    results.href = parts[0]
  }

  function parseDocument() {
    findHref()
    let t = document.all
    for (let i = 0; i < t.length; i++) {
      let e = t[i]
      if (e.hasAttributes()) {
        for (let att of e.attributes) {
          if (att.name && att.name.startsWith("data") && att.value === "JobDetail") {
            parseDetails(e)
          }
        }
      }
      if (e.tagName.toLowerCase() === "section") {
        let title = e.getElementsByTagName("h1")
        if (title.length > 0) {
          results.company = title[0].innerText
        }
      }
    }
  }

  parseDocument()

  console.log(results)
  navigator.clipboard.writeText(JSON.stringify(results))
      .then(r => {
      })
      .catch(err => {
      })


})()