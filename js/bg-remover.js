import { showToast } from './common.js';
import { removeBackground } from '@imgly/background-removal';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const progressSection = document.getElementById('progress-section');
const progressBar = document.getElementById('progress-bar');
const statusText = document.getElementById('status-text');
const previewSection = document.getElementById('preview-section');
const originalImg = document.getElementById('original-img');
const resultImg = document.getElementById('result-img');
const originalInfo = document.getElementById('original-info');
const resultInfo = document.getElementById('result-info');
const downloadBtn = document.getElementById('download-btn');
const resetBtn = document.getElementById('reset-btn');

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

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
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
});
fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) processFile(fileInput.files[0]);
});

async function processFile(file) {
    if (!file.type.match(/^image\/(png|jpe?g|webp)$/)) {
        showToast('Please upload a PNG, JPG, or WebP image.', 'error');
        return;
    }
    if (file.size > MAX_SIZE) {
        showToast('File is too large. Maximum size is 10MB.', 'error');
        return;
    }

    // Show original
    const originalUrl = URL.createObjectURL(file);
    originalImg.src = originalUrl;
    originalInfo.textContent = `${file.name} (${formatBytes(file.size)})`;

    // Show progress
    dropZone.classList.add('hidden');
    previewSection.classList.add('hidden');
    progressSection.classList.remove('hidden');
    progressBar.style.width = '10%';
    statusText.textContent = 'Loading AI model (first time may take a moment)...';

    try {
        const blob = await removeBackground(file, {
            progress: (key, current, total) => {
                if (key === 'compute:inference') {
                    const pct = Math.round((current / total) * 100);
                    progressBar.style.width = `${Math.max(pct, 10)}%`;
                    statusText.textContent = `Processing image... ${pct}%`;
                }
                if (key === 'fetch:model') {
                    progressBar.style.width = '5%';
                    statusText.textContent = 'Downloading AI model...';
                }
            },
        });

        progressBar.style.width = '100%';
        statusText.textContent = 'Done!';

        const resultUrl = URL.createObjectURL(blob);
        resultImg.src = resultUrl;
        resultInfo.textContent = `Result (${formatBytes(blob.size)})`;

        // Store for download
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = resultUrl;
            a.download = file.name.replace(/\.[^.]+$/, '') + '_nobg.png';
            a.click();
        };

        setTimeout(() => {
            progressSection.classList.add('hidden');
            previewSection.classList.remove('hidden');
        }, 500);

    } catch (err) {
        console.error(err);
        progressSection.classList.add('hidden');
        dropZone.classList.remove('hidden');
        showToast('Error processing image. Please try again.', 'error');
    }
}

resetBtn.addEventListener('click', () => {
    previewSection.classList.add('hidden');
    dropZone.classList.remove('hidden');
    fileInput.value = '';
});
