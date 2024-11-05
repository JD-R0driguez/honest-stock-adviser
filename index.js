

const tickersArr = []

// const generateReportBtn = document.querySelector('.generate-report-btn')

// generateReportBtn.addEventListener('click', fetchStockData)

// document.getElementById('ticker-input-form').addEventListener('submit', (e) => {
//     e.preventDefault()
//     const tickerInput = document.getElementById('ticker-input')
//     if (tickerInput.value.length > 2) {
//         generateReportBtn.disabled = false
//         const newTickerStr = tickerInput.value
//         tickersArr.push(newTickerStr.toUpperCase())
//         tickerInput.value = ''
//         renderTickers()
//     } else {
//         const label = document.getElementsByTagName('label')[0]
//         label.style.color = 'red'
//         label.textContent = 'You must add at least one ticker. A ticker is a 3 letter or more code for a stock. E.g TSLA for Tesla.'
//     }
// })

let sp500Companies = [];
let currentIndex = -1;
const textInput = document.getElementById('company-input')
const suggestionsDiv = document.getElementById('suggestions')

textInput.addEventListener('input', handleCompanySearch)
textInput.addEventListener('keydown', handleKeyNavigation);


async function loadAndSetCompanies() {
  try {
    const response = await fetch('data/sp500_companies.json')
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    sp500Companies = await response.json()
    console.log('Companies loaded:', sp500Companies)
  } catch (error) {
    console.error('Error loading JSON:', error)
  }
}
loadAndSetCompanies();



function handleCompanySearch(event) {
  const input = event.target.value.toLowerCase()
  suggestionsDiv.innerHTML = ''

  if (input.length > 0) {
    const matches = sp500Companies.filter(company => company.name.toLowerCase().includes(input) || company.ticker.toLowerCase().includes(input)).slice(0, 5)
    if (matches.length > 1) {
      matches.forEach(match => {
        const div = document.createElement('div')
        div.textContent = `${match.ticker} - ${match.name}`
        div.classList.add('suggestion-item')
        div.addEventListener('click', () => {
          document.getElementById('company-input').value = `${match.ticker} - ${match.name}`
          suggestionsDiv.innerHTML = ''
        });
        suggestionsDiv.appendChild(div)
      })
    }else {
      const notFoundDiv = document.createElement('div')
      notFoundDiv.textContent = 'Your search is not a company in the S&P 500'
      notFoundDiv.classList.add('not-found')
      suggestionsDiv.appendChild(notFoundDiv)
    }  
  } 
}

function handleKeyNavigation(event) {
  const items = document.querySelectorAll('.suggestion-item')
  
  if (items.length > 0) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      currentIndex = (currentIndex + 1) % items.length
      highlightItem(items)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      currentIndex = (currentIndex - 1 + items.length) % items.length
      highlightItem(items)
    } else if (event.key === 'Enter' && currentIndex >= 0) {
      event.preventDefault()
      items[currentIndex].click()
    }
  }
}

function highlightItem(items) {
  items.forEach((item, index) => {
    if (index === currentIndex) {
      item.classList.add('highlight')
      item.scrollIntoView({ block: 'nearest' })
    } else {
      item.classList.remove('highlight')
    }
  });
}




function renderTickers() {
    const tickersDiv = document.querySelector('.ticker-choice-display')
    tickersDiv.innerHTML = ''
    tickersArr.forEach((ticker) => {
        const newTickerSpan = document.createElement('span')
        newTickerSpan.textContent = ticker
        newTickerSpan.classList.add('ticker')
        tickersDiv.appendChild(newTickerSpan)
    })
}

const loadingArea = document.querySelector('.loading-panel')
const apiMessage = document.getElementById('api-message')

async function fetchStockData() {
    document.querySelector('.action-panel').style.display = 'none'
    loadingArea.style.display = 'flex'
    try {
        const stockData = await Promise.all(tickersArr.map(async (ticker) => {
            const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${process.env.POLYGON_API_KEY}`
            const response = await fetch(url)
            const data = await response.text()
            const status = await response.status
            if (status === 200) {
                apiMessage.innerText = 'Creating report...'
                return data
            } else {
                loadingArea.innerText = 'There was an error fetching stock data.'
            }
        }))
        fetchReport(stockData.join(''))
    } catch(err) {
        loadingArea.innerText = 'There was an error fetching stock data.'
        console.error('error: ', err)
    }
}

async function fetchReport(data) {
    /** AI goes here **/
}

function renderReport(output) {
    loadingArea.style.display = 'none'
    const outputArea = document.querySelector('.output-panel')
    const report = document.createElement('p')
    outputArea.appendChild(report)
    report.textContent = output
    outputArea.style.display = 'flex'
}