import { showToast, copyToClipboard } from './common.js';

// State
let currentColor = { r: 139, g: 92, b: 246 };

// DOM elements
const preview = document.getElementById('color-preview');
const previewText = document.getElementById('preview-text');
const hexInput = document.getElementById('hex-input');
const nativePicker = document.getElementById('native-picker');
const rgbDisplay = document.getElementById('rgb-display');
const hslDisplay = document.getElementById('hsl-display');

// Conversion functions
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length !== 6) return null;
    const num = parseInt(hex, 16);
    if (isNaN(num)) return null;
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

// Update all UI from currentColor
function updateUI(source) {
    const { r, g, b } = currentColor;
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);

    // Preview
    preview.style.background = hex;
    previewText.textContent = hex;

    // Determine text contrast
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    previewText.style.color = luminance > 0.5 ? '#000' : '#fff';

    // HEX
    if (source !== 'hex') hexInput.value = hex;
    if (source !== 'picker') nativePicker.value = hex;

    // RGB display and sliders
    const rgbStr = `rgb(${r}, ${g}, ${b})`;
    const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    rgbDisplay.textContent = rgbStr;
    hslDisplay.textContent = hslStr;

    if (source !== 'rgb') {
        document.getElementById('slider-r').value = r;
        document.getElementById('slider-g').value = g;
        document.getElementById('slider-b').value = b;
    }
    document.getElementById('val-r').textContent = r;
    document.getElementById('val-g').textContent = g;
    document.getElementById('val-b').textContent = b;

    if (source !== 'hsl') {
        document.getElementById('slider-h').value = hsl.h;
        document.getElementById('slider-s').value = hsl.s;
        document.getElementById('slider-l').value = hsl.l;
    }
    document.getElementById('val-h').textContent = hsl.h;
    document.getElementById('val-s').textContent = hsl.s + '%';
    document.getElementById('val-l').textContent = hsl.l + '%';

    // Copy buttons
    document.getElementById('copy-hex').textContent = hex;
    document.getElementById('copy-rgb').textContent = rgbStr;
    document.getElementById('copy-hsl').textContent = hslStr;
}

// Event listeners

// HEX input
hexInput.addEventListener('input', () => {
    const rgb = hexToRgb(hexInput.value);
    if (rgb) {
        currentColor = rgb;
        updateUI('hex');
    }
});

// Native color picker
nativePicker.addEventListener('input', () => {
    const rgb = hexToRgb(nativePicker.value);
    if (rgb) {
        currentColor = rgb;
        updateUI('picker');
    }
});

// RGB sliders
['slider-r', 'slider-g', 'slider-b'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        currentColor = {
            r: parseInt(document.getElementById('slider-r').value),
            g: parseInt(document.getElementById('slider-g').value),
            b: parseInt(document.getElementById('slider-b').value)
        };
        updateUI('rgb');
    });
});

// HSL sliders
['slider-h', 'slider-s', 'slider-l'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        const h = parseInt(document.getElementById('slider-h').value);
        const s = parseInt(document.getElementById('slider-s').value);
        const l = parseInt(document.getElementById('slider-l').value);
        currentColor = hslToRgb(h, s, l);
        updateUI('hsl');
    });
});

// Copy buttons
document.getElementById('copy-hex').addEventListener('click', () => {
    copyToClipboard(document.getElementById('copy-hex').textContent);
});
document.getElementById('copy-rgb').addEventListener('click', () => {
    copyToClipboard(document.getElementById('copy-rgb').textContent);
});
document.getElementById('copy-hsl').addEventListener('click', () => {
    copyToClipboard(document.getElementById('copy-hsl').textContent);
});

// Initialize
updateUI('init');
