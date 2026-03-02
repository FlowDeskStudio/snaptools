import { showToast } from './common.js';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Currency definitions
const currencies = {
  USD: { symbol: '$', label: 'USD ($)', position: 'before' },
  EUR: { symbol: '\u20AC', label: 'EUR (\u20AC)', position: 'before' },
  GBP: { symbol: '\u00A3', label: 'GBP (\u00A3)', position: 'before' },
  JPY: { symbol: '\u00A5', label: 'JPY (\u00A5)', position: 'before' },
  KRW: { symbol: '\u20A9', label: 'KRW (\u20A9)', position: 'before' },
  AUD: { symbol: 'A$', label: 'AUD (A$)', position: 'before' },
  CAD: { symbol: 'C$', label: 'CAD (C$)', position: 'before' },
  INR: { symbol: '\u20B9', label: 'INR (\u20B9)', position: 'before' },
};

// Presets per currency (monthly price, estimated per-use alternative cost)
const presets = {
  USD: [
    { name: 'Netflix (Standard)', monthly: 17.99, perUse: 5.99 },
    { name: 'Adobe Creative Cloud', monthly: 69.99, perUse: 25 },
    { name: 'Microsoft 365', monthly: 9.99, perUse: 3 },
    { name: 'Spotify Premium', monthly: 12.99, perUse: 1.50 },
    { name: 'ChatGPT Plus', monthly: 20, perUse: 0.50 },
    { name: 'Canva Pro', monthly: 14.99, perUse: 5 },
  ],
  EUR: [
    { name: 'Netflix (Standard)', monthly: 13.99, perUse: 4.99 },
    { name: 'Adobe Creative Cloud', monthly: 65.49, perUse: 24 },
    { name: 'Microsoft 365', monthly: 9.99, perUse: 3 },
    { name: 'Spotify Premium', monthly: 12.99, perUse: 1.50 },
    { name: 'ChatGPT Plus', monthly: 23.80, perUse: 0.50 },
    { name: 'Canva Pro', monthly: 14.99, perUse: 5 },
  ],
  GBP: [
    { name: 'Netflix (Standard)', monthly: 12.99, perUse: 4.99 },
    { name: 'Adobe Creative Cloud', monthly: 56.98, perUse: 20 },
    { name: 'Microsoft 365', monthly: 8.49, perUse: 2.50 },
    { name: 'Spotify Premium', monthly: 11.99, perUse: 1.30 },
    { name: 'ChatGPT Plus', monthly: 20, perUse: 0.50 },
    { name: 'Canva Pro', monthly: 10.99, perUse: 4 },
  ],
  JPY: [
    { name: 'Netflix (Standard)', monthly: 1590, perUse: 500 },
    { name: 'Adobe Creative Cloud', monthly: 7780, perUse: 3000 },
    { name: 'Microsoft 365', monthly: 2130, perUse: 500 },
    { name: 'Spotify Premium', monthly: 1080, perUse: 250 },
    { name: 'ChatGPT Plus', monthly: 3000, perUse: 100 },
    { name: 'Canva Pro', monthly: 1500, perUse: 400 },
  ],
  KRW: [
    { name: 'Netflix (Standard)', monthly: 17000, perUse: 5500 },
    { name: 'Adobe Creative Cloud', monthly: 79200, perUse: 30000 },
    { name: 'Microsoft 365', monthly: 12900, perUse: 4000 },
    { name: 'Spotify Premium', monthly: 10900, perUse: 1300 },
    { name: 'ChatGPT Plus', monthly: 28000, perUse: 600 },
    { name: 'Canva Pro', monthly: 15000, perUse: 5000 },
  ],
  AUD: [
    { name: 'Netflix (Standard)', monthly: 22.99, perUse: 7 },
    { name: 'Adobe Creative Cloud', monthly: 96.99, perUse: 35 },
    { name: 'Microsoft 365', monthly: 14, perUse: 4 },
    { name: 'Spotify Premium', monthly: 13.99, perUse: 1.70 },
    { name: 'ChatGPT Plus', monthly: 30, perUse: 0.70 },
    { name: 'Canva Pro', monthly: 19.99, perUse: 6 },
  ],
  CAD: [
    { name: 'Netflix (Standard)', monthly: 20.99, perUse: 7 },
    { name: 'Adobe Creative Cloud', monthly: 89.99, perUse: 30 },
    { name: 'Microsoft 365', monthly: 12.99, perUse: 4 },
    { name: 'Spotify Premium', monthly: 11.99, perUse: 1.50 },
    { name: 'ChatGPT Plus', monthly: 27, perUse: 0.60 },
    { name: 'Canva Pro', monthly: 16.99, perUse: 5 },
  ],
  INR: [
    { name: 'Netflix (Standard)', monthly: 649, perUse: 200 },
    { name: 'Adobe Creative Cloud', monthly: 5750, perUse: 2000 },
    { name: 'Microsoft 365', monthly: 489, perUse: 150 },
    { name: 'Spotify Premium', monthly: 119, perUse: 15 },
    { name: 'ChatGPT Plus', monthly: 2000, perUse: 50 },
    { name: 'Canva Pro', monthly: 500, perUse: 150 },
  ],
};

let currentCurrency = 'USD';
let chartInstance = null;

const currencySelect = document.getElementById('calc-currency');
const monthlyInput = document.getElementById('calc-monthly');
const perUseInput = document.getElementById('calc-peruse');
const serviceNameInput = document.getElementById('calc-service');
const resultDiv = document.getElementById('calc-result');
const resultText = document.getElementById('calc-result-text');
const presetBtns = document.getElementById('preset-buttons');
const calcBtn = document.getElementById('calc-btn');
const currencyLabel1 = document.getElementById('currency-label-1');
const currencyLabel2 = document.getElementById('currency-label-2');

// Build currency selector
Object.entries(currencies).forEach(([code, info]) => {
  const opt = document.createElement('option');
  opt.value = code;
  opt.textContent = info.label;
  currencySelect.appendChild(opt);
});

function formatCurrency(value) {
  const c = currencies[currentCurrency];
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: currentCurrency === 'JPY' || currentCurrency === 'KRW' ? 0 : 2,
    maximumFractionDigits: currentCurrency === 'JPY' || currentCurrency === 'KRW' ? 0 : 2,
  });
  return c.symbol + formatted;
}

function renderPresets() {
  presetBtns.innerHTML = '';
  const list = presets[currentCurrency] || presets.USD;
  list.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.textContent = p.name;
    btn.addEventListener('click', () => {
      serviceNameInput.value = p.name;
      monthlyInput.value = p.monthly;
      perUseInput.value = p.perUse;
      calculate();
    });
    presetBtns.appendChild(btn);
  });
}

function updateLabels() {
  const c = currencies[currentCurrency];
  currencyLabel1.textContent = `Monthly Fee (${c.symbol})`;
  currencyLabel2.textContent = `Cost per Single Use (${c.symbol})`;
}

currencySelect.addEventListener('change', () => {
  currentCurrency = currencySelect.value;
  renderPresets();
  updateLabels();
  serviceNameInput.value = '';
  monthlyInput.value = '';
  perUseInput.value = '';
  resultDiv.classList.add('hidden');
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
});

function calculate() {
  const monthly = parseFloat(monthlyInput.value);
  const perUse = parseFloat(perUseInput.value);
  const service = serviceNameInput.value || 'This service';

  if (!monthly || !perUse || monthly <= 0 || perUse <= 0) {
    resultDiv.classList.add('hidden');
    return;
  }

  const breakeven = monthly / perUse;
  const breakevenRound = Math.ceil(breakeven * 10) / 10;

  resultDiv.classList.remove('hidden');

  if (breakeven < 1) {
    resultText.innerHTML = `<strong>${service}</strong>: Even using it just <strong>once</strong> a month, the subscription is worth it! <span class="accent">(Break-even: ${breakevenRound} uses)</span>`;
  } else {
    resultText.innerHTML = `<strong>${service}</strong>: You need to use it at least <strong class="accent">${Math.ceil(breakeven)} times per month</strong> to make the subscription worthwhile. <span class="muted">(Break-even: ${breakevenRound} uses)</span>`;
  }

  renderChart(monthly, perUse, service, Math.ceil(breakeven));
}

function renderChart(monthly, perUse, service, breakeven) {
  const canvas = document.getElementById('calc-chart');
  const maxUses = Math.max(breakeven * 2, 10);
  const labels = [];
  const subData = [];
  const payData = [];

  for (let i = 0; i <= maxUses; i++) {
    labels.push(i);
    subData.push(monthly);
    payData.push(i * perUse);
  }

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `Subscription (${formatCurrency(monthly)}/mo)`,
          data: subData,
          borderColor: '#6c5ce7',
          backgroundColor: 'rgba(108,92,231,0.1)',
          fill: true, borderWidth: 2, pointRadius: 0, tension: 0,
        },
        {
          label: `Pay-per-use (${formatCurrency(perUse)}/use)`,
          data: payData,
          borderColor: '#fd79a8',
          backgroundColor: 'rgba(253,121,168,0.1)',
          fill: true, borderWidth: 2, pointRadius: 0, tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { labels: { color: '#8888a0', font: { size: 12 } } },
        tooltip: {
          backgroundColor: 'rgba(18,18,26,0.95)',
          titleColor: '#f0f0f5', bodyColor: '#8888a0',
          borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Uses per month', color: '#555570' },
          ticks: { color: '#555570' },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: {
          title: { display: true, text: `Cost (${currencies[currentCurrency].symbol})`, color: '#555570' },
          ticks: { color: '#555570', callback: v => formatCurrency(v) },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
      },
    },
  });
}

calcBtn.addEventListener('click', calculate);
[monthlyInput, perUseInput, serviceNameInput].forEach(el => {
  el.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });
});

// Init
renderPresets();
updateLabels();
