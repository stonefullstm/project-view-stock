let myChart;

let labels = [
];

const mydata = {
  labels: labels,
  datasets: [{
    label: 'Cotação diária',
    backgroundColor: 'rgb(89, 78, 54)',
    borderColor: 'rgb(89, 78, 54)',
    data: [],
  }]
};

const config = {
  type: 'line',
  data: mydata,
  options: {}
};

const host = 'https://www.alphavantage.co';
const timeSeriesFunction = 'TIME_SERIES_DAILY';
let symbol = 'PETR4.SA';
const key = '41MBD6F6FRS2YTDL';

const stringURL = (symbol) => `${host}/query?function=${timeSeriesFunction}&symbol=${symbol}&apikey=${key}`;

const zeroFill = (numero) => numero <= 9 ? `0${numero}` : numero;

function renderGraph() {
  labels.reverse();
  mydata.datasets[0].data.reverse();
  myChart = new Chart(
    document.getElementById('myChart'),
    config
  );
}

function dateFormat(date) {
  const data = new Date(date);
  const dataFormatada = `${zeroFill(data.getDate())}/${zeroFill(data.getMonth() + 1)}/${data.getFullYear()}`;
  return dataFormatada;
}

function removeDados() {
  const tabelaData = document.querySelector('#data');
  tabelaData.innerHTML = '';
  const tabelaCotacao = document.querySelector('#cotacao');
  tabelaCotacao.innerHTML = '';
  myChart.destroy();
  document.getElementById('myChart').innerHTML = '';
  labels = [];
  mydata.datasets[0].data = [];
}

function append(data) {
  const titulo = document.querySelector('h1');
  titulo.innerHTML = `Cotação Diária ${symbol}`;
  const dataColumn = document.querySelector('#data');
  const cotacaoColumn = document.querySelector('#cotacao');
  const cotacoes = Object.keys(data);
  const closeCotacao = '4. close';
  cotacoes.forEach((cotacao) => {
    const dataTd = document.createElement('li');
    const cotacaoF = dateFormat(cotacao);
    dataTd.innerHTML = cotacaoF;
    const cotacaoTd = document.createElement('li');
    labels.push(cotacaoF);
    mydata.datasets[0].data.push(parseFloat(data[cotacao][closeCotacao]).toFixed(2));
    cotacaoTd.innerHTML = `R$ ${parseFloat(data[cotacao][closeCotacao]).toFixed(2)}`;
    dataColumn.appendChild(dataTd);
    cotacaoColumn.appendChild(cotacaoTd);
  })
  renderGraph();
}

const fetchStock = (symbol) => {

  const url = stringURL(symbol);

  const coins = fetch(url)
    .then((response) => response.json())
    .then((data) => append(data["Time Series (Daily)"]))
    .catch((error) => error.toString());

}

const loadTicker = () => {
  const botao = document.getElementById('botao');
  botao.addEventListener('click', () => {
    const input = document.getElementById('ticker');
    symbol = `${input.value.toUpperCase()}.SA`;
    removeDados();
    fetchStock(symbol);
  });
};

function clickFavorite(e) {
  symbol = e.target.innerText;
  removeDados();
  fetchStock(symbol);
}

function removeFavorite(e) {
  const favoritas = e.target.parentNode; 
  favoritas.removeChild(e.target);
  localStorage.setItem('stockFavorite', favoritas.innerHTML);
}

// função clickHandler
// Source: https://pt.stackoverflow.com/questions/67480/elemento-com-onclick-e-ondblclick

var list = {
  oneClick: clickFavorite,
  oneDblClick: removeFavorite,
  timeout: null
};

function clickHandler(e) {
  (function () {
      var type = e.type;
      var evt = e;
      var verificador = function () {
          list.timeout = null;
          if (type === 'dblclick') list.oneDblClick(evt);
          else if (type === 'click') list.oneClick(evt);
      }
      if (list.timeout) clearTimeout(list.timeout)
      list.timeout = setTimeout(verificador, 250);
  })();
}

function loadFavorite() {
  const botao = document.getElementById('favoritar');
  const favoritas = document.getElementById('lista-favoritas');
  botao.addEventListener('click', () => {
    const input = document.getElementById('ticker');
    symbol = `${input.value.toUpperCase()}.SA`;
    const favorita = document.createElement('li');
    favorita.innerText = symbol;
    favorita.onclick = clickHandler;
    favorita.ondblclick = clickHandler;
    favoritas.appendChild(favorita);
    localStorage.setItem('stockFavorite', favoritas.innerHTML);
  });
}

function loadStorage() {
  const favoritas = localStorage.getItem('stockFavorite');
  let listaFavoritas = document.getElementById('lista-favoritas');
  listaFavoritas.innerHTML = favoritas;
  listaFavoritas.querySelectorAll('li').forEach((favorita) => {
    favorita.onclick = clickHandler;
    favorita.ondblclick = clickHandler;
  });
  try {
    symbol = listaFavoritas.firstElementChild.innerText;
  } catch (e) {
    symbol = 'IBOV.SA';
  }
}

window.onload = () => {
  loadStorage();
  fetchStock(symbol);
  loadTicker();
  loadFavorite();
}
