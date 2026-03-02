import { showToast } from './common.js';
import imageCompression from 'browser-image-compression';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const qualitySlider = document.getElementById('quality-slider');
const qualityVal = document.getElementById('quality-val');
const resultsSection = document.getElementById('results-section');
const resultsList = document.getElementById('results-list');
const resetBtn = document.getElementById('reset-btn');

qualitySlider.addEventListener('input', () => {
    qualityVal.textContent = qualitySlider.value + '%';
});

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

// Drag-and-drop
['dragenter', 'dragover'].forEach(evt => {
    dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.add('dragover'); });
});
['dragleave', 'drop'].forEach(evt => {
    dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.remove('dragover'); });
});
dropZone.addEventListener('drop', e => {
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.match(/^image\//));
    if (files.length) processFiles(files);
});
fileInput.addEventListener('change', () => {
    if (fileInput.files.length) processFiles(Array.from(fileInput.files));
});

async function processFiles(files) {
    const quality = parseInt(qualitySlider.value) / 100;
    resultsList.innerHTML = '';
    resultsSection.classList.remove('hidden');

    for (const file of files) {
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `
      <img src="${URL.createObjectURL(file)}" alt="${file.name}">
      <div class="result-meta">
        <div class="name">${file.name}</div>
        <div class="sizes">Compressing...</div>
      </div>
    `;
        resultsList.appendChild(item);

        try {
            const compressed = await imageCompression(file, {
                maxSizeMB: file.size / 1048576 * quality,
                maxWidthOrHeight: 4096,
                useWebWorker: true,
                initialQuality: quality,
            });

            const saved = ((1 - compressed.size / file.size) * 100).toFixed(1);
            const meta = item.querySelector('.result-meta');
            meta.innerHTML = `
        <div class="name">${file.name}</div>
        <div class="sizes">${formatBytes(file.size)} &rarr; ${formatBytes(compressed.size)}</div>
        <div class="savings">&minus;${saved}% smaller</div>
      `;

            // Add download button
            const dlBtn = document.createElement('button');
            dlBtn.className = 'btn btn-primary';
            dlBtn.textContent = 'Download';
            dlBtn.onclick = () => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(compressed);
                a.download = 'compressed_' + file.name;
                a.click();
            };
            item.appendChild(dlBtn);

        } catch (err) {
            console.error(err);
            const meta = item.querySelector('.result-meta');
            meta.querySelector('.sizes').textContent = 'Error compressing this file.';
            meta.querySelector('.sizes').style.color = '#ff6b6b';
        }
    }
}

resetBtn.addEventListener('click', () => {
    resultsSection.classList.add('hidden');
    resultsList.innerHTML = '';
    fileInput.value = '';
});
