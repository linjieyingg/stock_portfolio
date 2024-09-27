const portfolio = [];
let noStocks = 0;
let amount = 0;
let apiKey = "";
let hostKey = "";

document.getElementById("addStockBtn").addEventListener("click", function () {
  if (document.querySelector(".initial-amount").value === "") {
    alert("Please input an initial amount");
  } 
  // else{
  //   addStockRow()
  //   noStocks++
  // }
  else if (noStocks === 0) {
    showStockRow();
    console.log("hi");
    noStocks++;
    console.log(noStocks);
  } else {
    addStockRow();
    noStocks++;
  }

  if (
    document.querySelector(".initial-amount").value >= 0 &&
    document.querySelector(".initial-amount").value !== ""
  ) {
    amount = document.querySelector(".initial-amount").value;
    console.log(amount);
    document.querySelector(".initial-amount").setAttribute("disabled", true);
    document.querySelector('.stock').classList.remove('hidden')
  }
});

function getCookie(keyword){
  const cookiesCopy = document.cookie
  const result = cookiesCopy
  .split("; ")
  .find((row) => row.startsWith(`${keyword}=`))
  ?.split("=")[1];
  return result
}

let modal;
document.getElementById("openModalBtn").addEventListener("click", function () {
  modal = new bootstrap.Modal(document.getElementById('APImodal'), {
    keyboard: false
  })
  modal.show()
});

document.addEventListener("DOMContentLoaded", function () {
  console.log("loaded")
  modal = new bootstrap.Modal(document.getElementById('APImodal'), {
    keyboard: false
  })
  modal.show()
});


//overload modal
var overloadModal = new bootstrap.Modal(document.getElementById('overload'), {
  keyboard: false
})
function overload(){
  overloadModal.show()
  document.cookie = `startTime=;`
  document.cookie = `requests=;`;
  // console.log(document.cookie)
}

// add request and time to queue or reset
let startTime = document.cookie.split("; ").find((row) => row.startsWith("startTime="))?.split("=")[1]; 
let requests;
let request = function(){
  console.log(document.cookie.split("; ").find((row) => row.startsWith("requests="))?.split("=")[1] == null || document.cookie.split("; ").find((row) => row.startsWith("requests="))?.split("=")[1] == '')
  if(document.cookie.split("; ").find((row) => row.startsWith("requests="))?.split("=")[1] == null || document.cookie.split("; ").find((row) => row.startsWith("requests="))?.split("=")[1] == '')
    requests = []
  else
    requests = JSON.parse(getCookie('requests'))
  return requests
  }
request()
console.log(requests)
function addRequest (){
  let curTime = new Date().getTime(); 
  console.log(requests.length) 
  difference = curTime - startTime
  if (requests.length < 1){
    startTime = new Date().getTime();   
    console.log(startTime) 
    requests.push(startTime)
    document.cookie = `startTime=${startTime};` 
    document.cookie = `requests=${JSON.stringify(requests)};`;
  }
  else if(difference >= 60000){
    requests = [];
    startTime = new Date().getTime();   
    console.log(startTime) 
    requests.push(startTime)
    document.cookie = `startTime=${startTime};`
    document.cookie = `requests=${JSON.stringify(requests)};`;
  }
  else if (requests.length < 8){
    requests.push(curTime);
    console.log(requests)
    document.cookie = `startTime=${startTime}; `
    document.cookie = `requests=${JSON.stringify(requests)};`; 
    console.log(document.cookie)
  }
  else{
    overload();
  }
}

const delay = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

async function getStockData(exchange) {
  const url = `https://twelve-data1.p.rapidapi.com/stocks?exchange=${exchange}&format=json`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": hostKey,
    },
  };

  try {
    await delay();
    console.log(delay);
    const response = await fetch(url, options);
    if(response.status == 429)
      overload();
    addRequest()
    console.log(response);
    const stockText = await response.text();
    const stockData = JSON.parse(stockText)["data"];
    console.log(stockData);
    return stockData;
  } catch (error) {
    overload()
    console.error(error);
    return [];
  }
}

async function fetchStockList() {
  const nasdaqData = await getStockData("NASDAQ");
  const nyseData = await getStockData("NYSE");

  const mergedData = nasdaqData.concat(nyseData);
  const result = mergedData.filter(
    (item, idx) => mergedData.indexOf(item) === idx
  );
  console.log(result.sort());
  fillStockRow(result.sort());
}

async function getTimeSeriesData(symbol) {
  const url = `https://twelve-data1.p.rapidapi.com/time_series?symbol=${symbol}&interval=1day&outputsize=5000&format=json`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": hostKey,
    },
  };

  try {
    await delay();
    const response = await fetch(url, options);
    const timeSeriesData = await response.text();
    addRequest()
    console.log(timeSeriesData)
    return timeSeriesData;
  } catch (error) {
    console.error(error);
    return null;
  }
}

const dropdownContainer = document.querySelector(".select");
console.log(dropdownContainer)
function fillStockRow(data) {
  console.log(data);
  for (const company of data.sort((a, b) => a.name > b.name)) {
    let optionHtml = `<option value="${company.symbol}"> ${company.name} (${company.symbol})</option>`;
    dropdownContainer.insertAdjacentHTML("beforeend", optionHtml);
  }
}

function addStockRow() {
  row = document.createElement('div')
  row.classList.add('row')
  rowHTML = document.querySelector(".stock").innerHTML
  row.innerHTML = rowHTML
  document.querySelector(".stock-list").appendChild(row)
}

document
  .getElementById("submitStockBtn")
  .addEventListener("click", function () {
    for (let i = 0; i < noStocks; i++) {
      stockName = document.getElementsByClassName("select")[i].value;
      console.log(stockName);
      numberOfShares = document.getElementsByClassName("shares")[i].value;
      purchaseDate = document.getElementsByClassName("date")[i].value;
      addStock(stockName, numberOfShares, purchaseDate);
    }
  });

function addStock(stockName, numberOfShares, purchaseDate) {
  const newStock = {
    name: stockName,
    symbol: stockName,
    shares: numberOfShares,
    purchaseDate: purchaseDate,
  };
  portfolio.push(newStock);
  console.log("Updated Portfolio:", portfolio);
}

function updatePortfolioOnPage() {
  const portfolioTable = document.getElementById("portfolioTable");

  portfolioTable.innerHTML = "";

  const headerRow = document.createElement("tr");
  const headerColumns = ["Stock Name", "Shares", "Purchase Date"];
  headerColumns.forEach((column) => {
    const headerCell = document.createElement("th");
    headerCell.textContent = column;
    headerRow.appendChild(headerCell);
  });
  portfolioTable.appendChild(headerRow);

  portfolio.forEach((stock) => {
    const row = document.createElement("tr");
    const columns = [stock.name, stock.shares, stock.purchaseDate];
    columns.forEach((column) => {
      const cell = document.createElement("td");
      cell.textContent = column;
      row.appendChild(cell);
    });
    portfolioTable.appendChild(row);
  });
}

async function calculatePortfolioResult() {
  const sortedPortfolio = portfolio.sort(
    (a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate)
  );
    console.log(sortedPortfolio)
  if (sortedPortfolio.length > 0) {
    const startDate = new Date(sortedPortfolio[0].purchaseDate);
    const currentDate = new Date();
    let loopDate = new Date(currentDate); 

    let tableHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Portfolio Value</th>
            <th>Profit/Loss</th>
          </tr>
        </thead>
        <tbody>
    `;

    while (loopDate >= startDate) { 
      let portfolioValue = +amount;

      await Promise.all(
        sortedPortfolio.map(async (stock) => {
          if (new Date(stock.purchaseDate) <= loopDate) {
            const timeSeriesData = await getTimeSeriesData(stock.symbol);

            if (timeSeriesData) {
              const stockValue = calculateStockValue(timeSeriesData, loopDate);
              portfolioValue += +stockValue;
            } else {
              console.log("Failed to fetch time series data for", stock.symbol);
            }
          }
        })
      );

      const profitLoss = portfolioValue - +amount;

      tableHTML += `
        <tr>
          <td>${loopDate.toISOString().split("T")[0]}</td>
          <td>${portfolioValue.toFixed(2)}</td>
          <td>${profitLoss.toFixed(2)}</td>
        </tr>
      `;

      loopDate.setDate(loopDate.getDate() - 1); 
    }

    tableHTML += `
        </tbody>
      </table>
    `;

    document.getElementById("portfolioResults").innerHTML = tableHTML;
  } else {
    console.log("Portfolio is empty. No calculations to perform.");
  }
}

function calculateStockValue(timeSeriesData, currentDate) {
  try {
    const stockData = JSON.parse(timeSeriesData).values;

    if (Array.isArray(stockData) && stockData.length > 0) {
      const entry = stockData.find((item) => {
        const entryDate = new Date(item.datetime);
        return (
          entryDate.toISOString().split("T")[0] ===
          currentDate.toISOString().split("T")[0]
        );
      });

      if (entry) {
        const closingPrice = parseFloat(entry.close);
        return closingPrice;
      } else {
        const previousEntry = stockData.reduce((prev, current) =>
          new Date(current.datetime) < currentDate &&
          new Date(current.datetime) > new Date(prev.datetime)
            ? current
            : prev
        );

        if (previousEntry) {
          const previousClosingPrice = parseFloat(previousEntry.close);
          console.log(
            `Data not available for ${
              currentDate.toISOString().split("T")[0]
            }. Using the closest previous date.`
          );
          return previousClosingPrice;
        } else {
          console.log("Data not available for any date. Stock market closed.");
          return 0;
        }
      }
    } else {
      console.log("Invalid or empty data structure");
      return 0;
    }
  } catch (error) {
    console.error("Error parsing time series data:", error);
    return 0;
  }
}

document
  .getElementById("submitStockBtn")
  .addEventListener("click", function () {
    calculatePortfolioResult();
  });

function hideInitialStockRow() {
  const initialStockRow = document.querySelector(".stock.row");
  if (initialStockRow) {
    initialStockRow.style.display = "none";
  }
}

function showStockRow() {
  const initialStockRow = document.querySelector(".stock.row");
  initialStockRow.style.display = "";
}


document
  .getElementById("saveKeysBtn")
  .addEventListener("click", async function () {
    hostKey = document.getElementById("hostKey").value;
    apiKey = document.getElementById("apiKey").value;

    if (hostKey && apiKey) {
      setCookie("hostKey", hostKey, 30);
      setCookie("apiKey", apiKey, 30);
      await fetchStockList();
    } else {
      alert("Please enter both Host Key and API Key.");
    }
  });

function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}