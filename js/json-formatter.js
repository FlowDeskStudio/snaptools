import { showToast, copyToClipboard } from '/js/common.js';

const input = document.getElementById('json-input');
const indentSelect = document.getElementById('json-indent');
const formatBtn = document.getElementById('json-format');
const minifyBtn = document.getElementById('json-minify');
const clearBtn = document.getElementById('json-clear');
const outputBox = document.getElementById('json-output-box');
const output = document.getElementById('json-output');
const resultArea = document.getElementById('json-result');
const errorEl = document.getElementById('json-error');
const statusEl = document.getElementById('json-status');
const copyBtn = document.getElementById('json-copy');

let lastFormattedText = '';

function syntaxHighlight(json) {
    json = json
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    return json.replace(
        /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|[{}\[\],])/g,
        (match) => {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                    // Remove the colon for styling, add it back
                    return `<span class="${cls}">${match.slice(0, -1)}</span>:`;
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            } else if (/[{}\[\],]/.test(match)) {
                cls = 'json-bracket';
            }
            return `<span class="${cls}">${match}</span>`;
        }
    );
}

function getIndent() {
    const v = indentSelect.value;
    if (v === 'tab') return '\t';
    return parseInt(v);
}

function formatJSON() {
    const raw = input.value.trim();
    if (!raw) {
        showToast('Please paste some JSON first.', 'error');
        return;
    }

    try {
        const parsed = JSON.parse(raw);
        const indent = getIndent();
        const formatted = JSON.stringify(parsed, null, indent);
        lastFormattedText = formatted;

        output.innerHTML = syntaxHighlight(formatted);
        resultArea.className = 'result-area success';
        errorEl.style.display = 'none';
        statusEl.textContent = '✅ Valid JSON';
        statusEl.style.color = 'var(--success)';
        outputBox.style.display = 'block';
        outputBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showToast('JSON formatted successfully!');
    } catch (e) {
        handleError(e, raw);
    }
}

function minifyJSON() {
    const raw = input.value.trim();
    if (!raw) {
        showToast('Please paste some JSON first.', 'error');
        return;
    }

    try {
        const parsed = JSON.parse(raw);
        const minified = JSON.stringify(parsed);
        lastFormattedText = minified;

        output.innerHTML = syntaxHighlight(minified);
        resultArea.className = 'result-area success';
        errorEl.style.display = 'none';
        statusEl.textContent = '✅ Minified';
        statusEl.style.color = 'var(--success)';
        outputBox.style.display = 'block';
        showToast('JSON minified!');
    } catch (e) {
        handleError(e, raw);
    }
}

function handleError(e, raw) {
    const msg = e.message;
    lastFormattedText = '';

    // Try to extract position info
    const posMatch = msg.match(/position (\d+)/);
    let errorHtml = `<div class="error-line">❌ Invalid JSON</div>`;
    errorHtml += `<div>${msg}</div>`;

    if (posMatch) {
        const pos = parseInt(posMatch[1]);
        const lines = raw.substring(0, pos).split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;
        errorHtml += `<div style="margin-top: var(--space-sm); opacity: 0.7;">Line ${line}, Column ${col}</div>`;
    }

    output.textContent = '';
    resultArea.className = 'result-area error';
    errorEl.innerHTML = errorHtml;
    errorEl.style.display = 'block';
    statusEl.textContent = '❌ Invalid JSON';
    statusEl.style.color = 'var(--error)';
    outputBox.style.display = 'block';
}

formatBtn.addEventListener('click', formatJSON);
minifyBtn.addEventListener('click', minifyJSON);
clearBtn.addEventListener('click', () => {
    input.value = '';
    outputBox.style.display = 'none';
    lastFormattedText = '';
    showToast('Cleared!');
});

copyBtn.addEventListener('click', () => {
    if (lastFormattedText) {
        copyToClipboard(lastFormattedText);
    }
});

// Format on Ctrl+Enter
input.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        formatJSON();
    }
});
