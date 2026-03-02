import { showToast, copyToClipboard } from './common.js';

let mode = 'encode'; // 'encode' or 'decode'

const inputEl = document.getElementById('b64-input');
const outputEl = document.getElementById('b64-output');
const inputLabel = document.getElementById('input-label');
const outputLabel = document.getElementById('output-label');
const encodeBtnEl = document.getElementById('mode-encode');
const decodeBtnEl = document.getElementById('mode-decode');

function setMode(newMode) {
    mode = newMode;
    encodeBtnEl.classList.toggle('active', mode === 'encode');
    decodeBtnEl.classList.toggle('active', mode === 'decode');
    inputLabel.textContent = mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode';
    outputLabel.textContent = mode === 'encode' ? 'Base64 Output' : 'Decoded Text';
    inputEl.placeholder = mode === 'encode' ? 'Enter text here...' : 'Enter Base64 string here...';
    outputEl.value = '';
}

function convert() {
    const input = inputEl.value.trim();
    if (!input) {
        showToast('Please enter some text first', 'error');
        return;
    }

    try {
        if (mode === 'encode') {
            // Handle Unicode by encoding to UTF-8 first
            const utf8Bytes = new TextEncoder().encode(input);
            let binary = '';
            utf8Bytes.forEach(byte => binary += String.fromCharCode(byte));
            outputEl.value = btoa(binary);
        } else {
            const binary = atob(input);
            const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
            outputEl.value = new TextDecoder().decode(bytes);
        }
        showToast('Converted successfully!', 'success');
    } catch (e) {
        showToast('Invalid input: ' + e.message, 'error');
    }
}

// Mode toggle
encodeBtnEl.addEventListener('click', () => setMode('encode'));
decodeBtnEl.addEventListener('click', () => setMode('decode'));

// Convert button
document.getElementById('b64-convert').addEventListener('click', convert);

// Swap
document.getElementById('b64-swap').addEventListener('click', () => {
    const temp = outputEl.value;
    inputEl.value = temp;
    outputEl.value = '';
    setMode(mode === 'encode' ? 'decode' : 'encode');
});

// Copy
document.getElementById('b64-copy').addEventListener('click', () => {
    if (outputEl.value) {
        copyToClipboard(outputEl.value);
    }
});

// Clear
document.getElementById('b64-clear').addEventListener('click', () => {
    inputEl.value = '';
    outputEl.value = '';
});

// Auto-convert on Enter
inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        convert();
    }
});
