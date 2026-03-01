import { showToast, copyToClipboard, debounce } from '/js/common.js';

const input = document.getElementById('counter-input');
const limitSelect = document.getElementById('char-limit');
const limitCustom = document.getElementById('char-limit-custom');
const limitBar = document.getElementById('limit-bar');
const limitBarFill = document.getElementById('limit-bar-fill');
const limitInfo = document.getElementById('limit-info');
const limitUsed = document.getElementById('limit-used');
const limitRemaining = document.getElementById('limit-remaining');
const keywordsBox = document.getElementById('keywords-box');
const keywordList = document.getElementById('keyword-list');
const copyBtn = document.getElementById('counter-copy');
const clearBtn = document.getElementById('counter-clear');

// Common stop words to exclude from keyword analysis
const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'it', 'as', 'was', 'are', 'be',
    'this', 'that', 'which', 'who', 'whom', 'what', 'where', 'when',
    'how', 'not', 'no', 'do', 'does', 'did', 'has', 'have', 'had',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall',
    'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him', 'her', 'us',
    'them', 'my', 'your', 'his', 'its', 'our', 'their', 'if', 'then',
    'so', 'just', 'also', 'very', 'too', 'up', 'out', 'about', 'been',
    'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
    'some', 'such', 'than', 'into', 'over'
]);

function getLimit() {
    const custom = parseInt(limitCustom.value);
    if (custom > 0) return custom;
    return parseInt(limitSelect.value);
}

function analyze() {
    const text = input.value;

    // Character count
    const chars = text.length;
    document.getElementById('stat-chars').textContent = chars.toLocaleString();

    // Word count
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.getElementById('stat-words').textContent = words.toLocaleString();

    // Sentence count
    const sentences = text.trim() ? (text.match(/[.!?]+(?=\s|$)/g) || []).length : 0;
    document.getElementById('stat-sentences').textContent = sentences.toLocaleString();

    // Paragraph count
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
    document.getElementById('stat-paragraphs').textContent = paragraphs.toLocaleString();

    // Reading time (average 200 words per minute)
    const readingSeconds = Math.ceil((words / 200) * 60);
    let readingLabel;
    if (readingSeconds < 60) {
        readingLabel = `${readingSeconds}s`;
    } else {
        const min = Math.floor(readingSeconds / 60);
        const sec = readingSeconds % 60;
        readingLabel = sec > 0 ? `${min}m ${sec}s` : `${min}m`;
    }
    document.getElementById('stat-reading').textContent = readingLabel;

    // Character limit
    const limit = getLimit();
    if (limit > 0) {
        limitBar.style.display = 'block';
        limitInfo.style.display = 'flex';
        const pct = Math.min((chars / limit) * 100, 100);
        limitBarFill.style.width = `${pct}%`;
        limitBarFill.className = 'limit-bar-fill';
        if (pct >= 100) limitBarFill.classList.add('danger');
        else if (pct >= 80) limitBarFill.classList.add('warning');

        limitUsed.textContent = `${chars.toLocaleString()} / ${limit.toLocaleString()}`;
        const remaining = limit - chars;
        limitRemaining.textContent = remaining >= 0 ? `${remaining.toLocaleString()} remaining` : `${Math.abs(remaining).toLocaleString()} over limit`;
        limitRemaining.style.color = remaining >= 0 ? '' : 'var(--error)';
    } else {
        limitBar.style.display = 'none';
        limitInfo.style.display = 'none';
    }

    // Top keywords
    if (words >= 3) {
        const wordFreq = {};
        const allWords = text.toLowerCase().match(/[a-zA-Z\u00C0-\u024F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g) || [];
        allWords.forEach(w => {
            if (w.length > 2 && !STOP_WORDS.has(w)) {
                wordFreq[w] = (wordFreq[w] || 0) + 1;
            }
        });

        const sorted = Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        if (sorted.length > 0) {
            keywordsBox.style.display = 'block';
            keywordList.innerHTML = sorted.map(([word, count]) =>
                `<span class="keyword-tag">${word} <span class="keyword-count">${count}</span></span>`
            ).join('');
        } else {
            keywordsBox.style.display = 'none';
        }
    } else {
        keywordsBox.style.display = 'none';
    }
}

// Real-time analysis
input.addEventListener('input', debounce(analyze, 50));

// Limit changes
limitSelect.addEventListener('change', () => {
    limitCustom.value = '';
    analyze();
});
limitCustom.addEventListener('input', analyze);

// Copy
copyBtn.addEventListener('click', () => {
    if (input.value) {
        copyToClipboard(input.value);
    } else {
        showToast('Nothing to copy.', 'error');
    }
});

// Clear
clearBtn.addEventListener('click', () => {
    input.value = '';
    analyze();
    showToast('Cleared!');
});

// Initial
analyze();
