import { dates } from './data/dates.js';

const tickersArr = []

let sp500Companies = []
let currentIndex = -1
let foundCompany = false
const searchBar = document.getElementById('company-input')
const suggestionsDiv = document.getElementById('suggestions')
const addTickerButton = document.getElementById('add-ticker-btn')
const errorlabel = document.querySelector('.error-input')
const notFoundLabel = document.querySelector('.not-found')
const tickersContainer = document.getElementById('tickers-container')
const generateReportBtn = document.querySelector('.generate-report-btn')


searchBar.addEventListener('input', handleCompanySearch)
searchBar.addEventListener('keydown', handleKeyNavigation)
addTickerButton.addEventListener('click', addTicker)
generateReportBtn.addEventListener('click', fetchStockData)



async function loadAndSetCompanies() {
  try {
    const response = await fetch('data/sp500_companies.json')
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    sp500Companies = await response.json()
  } catch (error) {
    console.error('Error loading JSON:', error)
  }
}
loadAndSetCompanies()


function handleCompanySearch(event) {
  const input = event.target.value.toLowerCase();
  suggestionsDiv.innerHTML = '';

  if (input.length > 0) {
    const matches = sp500Companies.filter(company => company.name.toLowerCase().includes(input) || company.ticker.toLowerCase().includes(input)).slice(0, 7)

    if (matches.length > 0) {
      notFoundLabel.classList.remove('active')
      showSuggestions(matches)
    } else {
      notFoundLabel.classList.add('active')
    }
  } else {
    notFoundLabel.classList.remove('active')
  }
}

function showSuggestions(matches) {

  matches.forEach(match => {
    const div = document.createElement('div')
    div.textContent = `${match.ticker} - ${match.name}`
    div.classList.add('suggestion-item')
    div.addEventListener('click', () => {
      document.getElementById('company-input').value = `${match.ticker}`
      suggestionsDiv.innerHTML = ''
      foundCompany = true
    });
    suggestionsDiv.appendChild(div)
  });
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


function addTicker(event) {
  console.log("add ticker")

  event.preventDefault()
    if (foundCompany) {
      const newTickerStr = searchBar.value
      tickersArr.push(newTickerStr.toUpperCase())
      createTickerElement(newTickerStr)
      searchBar.value = ''
      foundCompany = false
      renderTickers()
      updateButtonStates();
    } 
}

function createTickerElement(tickerText) {
  const tickerContainer = document.createElement('div');
  tickerContainer.classList.add('ticker-container');
  const textSection = document.createElement('div');
  textSection.classList.add('text-section');
  textSection.textContent = tickerText;
  
  const closeButton = document.createElement('div');
  closeButton.classList.add('close-button');

  closeButton.addEventListener('click', () => {
    removeTicker(tickerText);
  });
  
  tickerContainer.appendChild(textSection);
  tickerContainer.appendChild(closeButton);
  tickersContainer.appendChild(tickerContainer);
}

function removeTicker(tickerText) {
  tickersArr.splice(tickersArr.indexOf(tickerText), 1);
  renderTickers();
  updateButtonStates(); 
}

function renderTickers() {
  tickersContainer.innerHTML = '';
  tickersArr.forEach(createTickerElement);
}

function updateButtonStates() {
  generateReportBtn.disabled = tickersArr.length === 0;
  addTickerButton.disabled = tickersArr.length >= 3;
}


const loadingArea = document.querySelector('.loading-panel')
const apiMessage = document.getElementById('api-message')

// async function fetchStockData() {
//   console.log('Generating report...');
//   // document.querySelector('.action-panel').style.display = 'none';
//   loadingArea.style.display = 'flex';

//   try {
//       const stockData = await Promise.all(tickersArr.map(async (ticker) => {
//           const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=MATfx0pg_Pm0tLmMHI3aI1pPRa47VBpD`;
//           const response = await fetch(url);

//           if (!response.ok) {
//               throw new Error(`Error fetching data for ${ticker}: ${response.status} ${response.statusText}`);
//           }

//           const data = await response.json();
//           apiMessage.innerText = 'Creating report...';
//           return data;
//       }));

//       console.log('Stock data fetched successfully:', stockData);
//       // fetchReport(stockData.join('')); // Use this as needed
//   } catch (err) {
//       loadingArea.innerText = 'There was an error fetching stock data.';
//       console.error('Error:', err);
//   }
// }

async function fetchStockData() {
  console.log('Generating report...');
  loadingArea.style.display = 'flex';

  try {
    const stockData = await Promise.all(
      tickersArr.map(async (ticker) => {
        const response = await fetch(
          `/api/polygon?ticker=${ticker}&startDate=${dates.startDate}&endDate=${dates.endDate}`
        );
        // const response = await fetch(`http://localhost:3000/api/polygon?ticker=${ticker}&startDate=${dates.startDate}&endDate=${dates.endDate}`);


        if (!response.ok) {
          throw new Error(`Error fetching data for ${ticker}: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        apiMessage.innerText = 'Creating report...';
        return data;
      })
    );

    console.log('Stock data fetched successfully:', stockData);
    // fetchReport(stockData.join('')); // Use this as needed
  } catch (err) {
    loadingArea.innerText = 'There was an error fetching stock data.';
    console.error('Error:', err);
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