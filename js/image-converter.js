import { showToast } from './common.js';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const resultsSection = document.getElementById('results-section');
const resultsList = document.getElementById('results-list');
const resetBtn = document.getElementById('reset-btn');
const formatBtns = document.querySelectorAll('.format-btn');

let targetFormat = 'image/jpeg';
const formatExt = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' };

// Format buttons
formatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        formatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        targetFormat = btn.dataset.format;
    });
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

async function convertImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');

            // For JPG, fill white background (no transparency)
            if (targetFormat === 'image/jpeg') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(img, 0, 0);
            canvas.toBlob(blob => {
                if (blob) resolve(blob);
                else reject(new Error('Conversion failed'));
            }, targetFormat, 0.92);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

async function processFiles(files) {
    resultsList.innerHTML = '';
    resultsSection.classList.remove('hidden');

    for (const file of files) {
        const ext = formatExt[targetFormat];
        const newName = file.name.replace(/\.[^.]+$/, '') + ext;

        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `
      <img src="${URL.createObjectURL(file)}" alt="${file.name}">
      <div class="result-meta">
        <div class="name">${file.name} &rarr; ${newName}</div>
        <div class="sizes">Converting...</div>
      </div>
    `;
        resultsList.appendChild(item);

        try {
            const blob = await convertImage(file);
            const meta = item.querySelector('.result-meta');
            meta.querySelector('.sizes').textContent = `${formatBytes(file.size)} → ${formatBytes(blob.size)}`;

            const dlBtn = document.createElement('button');
            dlBtn.className = 'btn btn-primary';
            dlBtn.textContent = 'Download';
            dlBtn.onclick = () => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = newName;
                a.click();
            };
            item.appendChild(dlBtn);

        } catch (err) {
            console.error(err);
            item.querySelector('.sizes').textContent = 'Error converting this file.';
            item.querySelector('.sizes').style.color = '#ff6b6b';
        }
    }
}

resetBtn.addEventListener('click', () => {
    resultsSection.classList.add('hidden');
    resultsList.innerHTML = '';
    fileInput.value = '';
});
