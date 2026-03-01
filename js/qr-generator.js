import QRCode from 'qrcode';
import { showToast, downloadFile } from '/js/common.js';

const input = document.getElementById('qr-input');
const sizeSelect = document.getElementById('qr-size');
const fgColor = document.getElementById('qr-fg');
const bgColor = document.getElementById('qr-bg');
const generateBtn = document.getElementById('qr-generate');
const outputBox = document.getElementById('qr-output-box');
const canvas = document.getElementById('qr-canvas');
const downloadBtn = document.getElementById('qr-download');
const copyBtn = document.getElementById('qr-copy');

function generate() {
    const text = input.value.trim();
    if (!text) {
        showToast('Please enter some text or a URL.', 'error');
        return;
    }

    const size = parseInt(sizeSelect.value);
    const fg = fgColor.value;
    const bg = bgColor.value;

    QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: {
            dark: fg,
            light: bg,
        },
        errorCorrectionLevel: 'M',
    }, (error) => {
        if (error) {
            showToast('Error generating QR code.', 'error');
            console.error(error);
            return;
        }
        outputBox.style.display = 'block';
        outputBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('QR code generated!');
    });
}

generateBtn.addEventListener('click', generate);

// Also generate on Enter key
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generate();
});

// Download as PNG
downloadBtn.addEventListener('click', () => {
    canvas.toBlob((blob) => {
        downloadFile(blob, 'qr-code.png', 'image/png');
        showToast('Downloaded!');
    });
});

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
    try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve));
        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('QR code copied to clipboard!');
    } catch {
        showToast('Could not copy image. Try downloading instead.', 'error');
    }
});

// Generate on page load with default value
generate();
