// text-formatter.js
// Handles text cleaning and formatting using RegEx

document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const btnFormat = document.getElementById('btn-format');
    const btnCopy = document.getElementById('btn-copy');
    const btnClear = document.getElementById('btn-clear');

    // Options
    const optSpaces = document.getElementById('opt-spaces');
    const optLines = document.getElementById('opt-lines');
    const optHalfwidth = document.getElementById('opt-halfwidth');
    const optFullkana = document.getElementById('opt-fullkana');
    const optBullets = document.getElementById('opt-bullets');

    // Mappings for Full/Half width Kana
    const kanaMapping = {
        'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
        'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
        'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
        'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
        'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ',
        'ｳﾞ': 'ヴ', 'ﾜﾞ': 'ヷ', 'ｦﾞ': 'ヺ',
        'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
        'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
        'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
        'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
        'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
        'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
        'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
        'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
        'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
        'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
        'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
        'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
        '｡': '。', '｢': '「', '｣': '」', '､': '、', '･': '・',
        'ｰ': 'ー', 'ﾞ': '゛', 'ﾟ': '゜'
    };

    const regKana = new RegExp('(' + Object.keys(kanaMapping).join('|') + ')', 'g');

    btnFormat.addEventListener('click', () => {
        let text = textInput.value;
        if (!text) return;

        const cursorPosition = textInput.selectionStart;

        // 1. Remove Extra Spaces
        // Removes trailing spaces on each line, and reduces multiple inline spaces to one
        if (optSpaces.checked) {
            text = text.replace(/[ \t]+$/gm, ''); // Trailing
            text = text.replace(/[ \t]{2,}/g, ' '); // Inline multiple
        }

        // 2. Reduce Empty Lines
        // Reduces 3 or more empty lines into just 2 empty lines (1 blank line between text)
        // Also remove extreme leading/trailing blank lines
        if (optLines.checked) {
            text = text.replace(/\n{3,}/g, '\n\n');
            text = text.trim();
        }

        // 3. Alphanumeric Full-width to Half-width (Ａ-Ｚａ-ｚ０-９ to A-Za-z0-9)
        if (optHalfwidth.checked) {
            text = text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
                return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
            });
            // Also convert full-width space to half-width space for consistency
            text = text.replace(/　/g, ' ');
        }

        // 4. Half-width Kana to Full-width Kana
        if (optFullkana.checked) {
            text = text.replace(regKana, function (match) {
                return kanaMapping[match];
            });
        }

        // 5. Standardize Bullets
        // Converts •, *, +, etc at the start of lines to "- " for clean Markdown/Word lists
        if (optBullets.checked) {
            text = text.replace(/^[ \t]*[•・●■◆*+][ \t]*/gm, '- ');
        }

        textInput.value = text;

        // Restore focus
        textInput.focus();
        textInput.setSelectionRange(cursorPosition, cursorPosition);

        // Visual feedback
        const originalText = btnFormat.innerHTML;
        btnFormat.innerHTML = '&#10004; Formatted!';
        setTimeout(() => {
            btnFormat.innerHTML = originalText;
        }, 1500);
    });

    btnCopy.addEventListener('click', () => {
        const text = textInput.value;
        if (!text) return;

        navigator.clipboard.writeText(text).then(() => {
            const originalText = btnCopy.innerHTML;
            btnCopy.innerHTML = '&#10004; Copied!';
            setTimeout(() => {
                btnCopy.innerHTML = originalText;
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy to clipboard.');
        });
    });

    btnClear.addEventListener('click', () => {
        textInput.value = '';
        textInput.focus();
    });
});
