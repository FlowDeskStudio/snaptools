import { showToast, copyToClipboard } from './common.js';

const CHARSETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const AMBIGUOUS = 'lI1O0';

function getCharPool() {
    let pool = '';
    const excludeAmbiguous = document.getElementById('opt-exclude-ambiguous').checked;

    if (document.getElementById('opt-upper').checked) pool += CHARSETS.upper;
    if (document.getElementById('opt-lower').checked) pool += CHARSETS.lower;
    if (document.getElementById('opt-numbers').checked) pool += CHARSETS.numbers;
    if (document.getElementById('opt-symbols').checked) pool += CHARSETS.symbols;

    if (excludeAmbiguous) {
        pool = pool.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
    }

    return pool;
}

function generatePassword() {
    const length = parseInt(document.getElementById('pw-length').value);
    const pool = getCharPool();

    if (pool.length === 0) {
        showToast('Please select at least one character type', 'error');
        return '';
    }

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    let password = '';
    for (let i = 0; i < length; i++) {
        password += pool[array[i] % pool.length];
    }

    return password;
}

function calculateStrength(password) {
    const pool = getCharPool();
    if (!password || pool.length === 0) return { score: 0, label: '', entropy: 0 };

    const entropy = password.length * Math.log2(pool.length);

    let score, label, color;
    if (entropy < 28) {
        score = 15; label = 'Very Weak'; color = '#ff6b6b';
    } else if (entropy < 36) {
        score = 30; label = 'Weak'; color = '#ff9f43';
    } else if (entropy < 60) {
        score = 50; label = 'Fair'; color = '#feca57';
    } else if (entropy < 80) {
        score = 75; label = 'Strong'; color = '#48dbfb';
    } else {
        score = 100; label = 'Very Strong'; color = '#55efc4';
    }

    return { score, label, color, entropy: Math.round(entropy) };
}

function updateUI(password) {
    const display = document.getElementById('password-display');
    display.textContent = password || 'Click Generate';

    const strength = calculateStrength(password);
    const fill = document.getElementById('strength-fill');
    fill.style.width = strength.score + '%';
    fill.style.background = strength.color || 'transparent';

    document.getElementById('strength-text').textContent = strength.label || 'Strength';
    document.getElementById('strength-text').style.color = strength.color || 'var(--text-muted)';
    document.getElementById('entropy-text').textContent = strength.entropy ? strength.entropy + ' bits of entropy' : '';
}

// Length slider
const lengthSlider = document.getElementById('pw-length');
const lengthDisplay = document.getElementById('length-display');

lengthSlider.addEventListener('input', () => {
    lengthDisplay.textContent = lengthSlider.value;
});

// Generate button
document.getElementById('pw-generate').addEventListener('click', () => {
    const pw = generatePassword();
    if (pw) updateUI(pw);
});

// Copy button
document.getElementById('pw-copy').addEventListener('click', () => {
    const pw = document.getElementById('password-display').textContent;
    if (pw && pw !== 'Click Generate') {
        copyToClipboard(pw);
    }
});

// Auto-generate on option change
document.querySelectorAll('.toggle input, #pw-length').forEach(el => {
    el.addEventListener('change', () => {
        const pw = generatePassword();
        if (pw) updateUI(pw);
    });
});

// Generate initial password
const initialPw = generatePassword();
updateUI(initialPw);
