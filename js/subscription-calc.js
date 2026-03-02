import { showToast } from './common.js';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Presets
const presets = [
  { name: 'Netflix (Standard)', monthly: 1590, perUse: 500, label: 'movies / month' },
  { name: 'Adobe Creative Cloud', monthly: 7780, perUse: 3000, label: 'projects / month' },
  { name: 'Microsoft 365', monthly: 1490, perUse: 500, label: 'uses / month' },
  { name: 'Spotify Premium', monthly: 980, perUse: 250, label: 'hours / month' },
  { name: 'ChatGPT Plus', monthly: 3000, perUse: 100, label: 'queries / month' },
  { name: 'Canva Pro', monthly: 1500, perUse: 400, label: 'designs / month' },
];

const monthlyInput = document.getElementById('calc-monthly');
const perUseInput = document.getElementById('calc-peruse');
const serviceNameInput = document.getElementById('calc-service');
const resultDiv = document.getElementById('calc-result');
const resultText = document.getElementById('calc-result-text');
const presetBtns = document.getElementById('preset-buttons');
const calcBtn = document.getElementById('calc-btn');

let chartInstance = null;

// Render preset buttons
presets.forEach((p, i) => {
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
  const payPerUseData = [];

  for (let i = 0; i <= maxUses; i++) {
    labels.push(i);
    subData.push(monthly);
    payPerUseData.push(i * perUse);
  }

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `Subscription (${monthly.toLocaleString()}/mo)`,
          data: subData,
          borderColor: '#6c5ce7',
          backgroundColor: 'rgba(108,92,231,0.1)',
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0,
        },
        {
          label: `Pay-per-use (${perUse.toLocaleString()}/use)`,
          data: payPerUseData,
          borderColor: '#fd79a8',
          backgroundColor: 'rgba(253,121,168,0.1)',
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          labels: { color: '#8888a0', font: { size: 12 } },
        },
        tooltip: {
          backgroundColor: 'rgba(18,18,26,0.95)',
          titleColor: '#f0f0f5',
          bodyColor: '#8888a0',
          borderColor: 'rgba(255,255,255,0.06)',
          borderWidth: 1,
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} yen`,
          },
        },
        annotation: breakeven > 0 ? {
          annotations: {
            breakLine: {
              type: 'line',
              xMin: breakeven,
              xMax: breakeven,
              borderColor: '#00cec9',
              borderWidth: 2,
              borderDash: [6, 4],
              label: {
                display: true,
                content: `Break-even: ${breakeven} uses`,
                position: 'start',
                color: '#00cec9',
                font: { size: 11 },
              },
            },
          },
        } : {},
      },
      scales: {
        x: {
          title: { display: true, text: 'Uses per month', color: '#555570' },
          ticks: { color: '#555570' },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: {
          title: { display: true, text: 'Cost (yen)', color: '#555570' },
          ticks: {
            color: '#555570',
            callback: v => v.toLocaleString(),
          },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
      },
    },
  });
}

calcBtn.addEventListener('click', calculate);

// Enter key support
[monthlyInput, perUseInput, serviceNameInput].forEach(el => {
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter') calculate();
  });
});
