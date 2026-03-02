// pdf-to-word.js
// Extracts text from PDFs using pdf.js and creates a docx file using the docx library

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileListContainer = document.getElementById('file-list-container');
    const fileList = document.getElementById('file-list');
    const btnClear = document.getElementById('btn-clear');
    const btnConvert = document.getElementById('btn-convert');

    let selectedFiles = [];

    // --- Drag and Drop Events ---
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-active');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-active');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-active');
        handleFiles(e.dataTransfer.files);
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    btnClear.addEventListener('click', () => {
        selectedFiles = [];
        fileInput.value = '';
        renderFileList();
    });

    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    function handleFiles(files) {
        const newFiles = Array.from(files).filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));

        if (newFiles.length === 0) {
            alert('Please upload valid PDF files (.pdf).');
            return;
        }

        newFiles.forEach(newFile => {
            if (!selectedFiles.find(f => f.file.name === newFile.name)) {
                selectedFiles.push({
                    file: newFile,
                    status: 'ready'
                });
            }
        });

        renderFileList();
    }

    function renderFileList() {
        fileList.innerHTML = '';

        if (selectedFiles.length === 0) {
            fileListContainer.style.display = 'none';
            return;
        }

        fileListContainer.style.display = 'block';

        selectedFiles.forEach((f, idx) => {
            const item = document.createElement('div');
            item.className = 'file-item';

            let statusBadge = '';
            if (f.status === 'ready') statusBadge = '<span class="status-badge status-ready">Ready</span>';
            else if (f.status === 'processing') statusBadge = '<span class="status-badge status-processing">Extracting Text...</span>';
            else if (f.status === 'done') statusBadge = '<span class="status-badge status-done">Done</span>';
            else if (f.status === 'error') statusBadge = '<span class="status-badge status-error">Error</span>';

            item.innerHTML = `
                <span class="file-name" title="${f.file.name}">${f.file.name}</span>
                <span class="file-size">${formatBytes(f.file.size)}</span>
                ${statusBadge}
                ${f.status === 'ready' ? `<button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px; margin-left: 10px;" onclick="window.removePdfFile(${idx})">Remove</button>` : ''}
            `;
            fileList.appendChild(item);
        });

        btnConvert.disabled = !selectedFiles.some(f => f.status === 'ready');
    }

    window.removePdfFile = function (idx) {
        selectedFiles.splice(idx, 1);
        renderFileList();
    };

    // --- Conversion Process ---
    btnConvert.addEventListener('click', async () => {
        btnConvert.disabled = true;

        for (let i = 0; i < selectedFiles.length; i++) {
            if (selectedFiles[i].status !== 'ready') continue;

            selectedFiles[i].status = 'processing';
            renderFileList();

            try {
                await processPdfToWord(selectedFiles[i].file);
                selectedFiles[i].status = 'done';
            } catch (err) {
                console.error(`Error converting ${selectedFiles[i].file.name}:`, err);
                selectedFiles[i].status = 'error';
            }

            renderFileList();
        }

        btnConvert.disabled = false;
    });

    async function processPdfToWord(file) {
        return new Promise(async (resolve, reject) => {
            try {
                // 1. Read PDF as ArrayBuffer
                const arrayBuffer = await file.arrayBuffer();

                // 2. Load PDF document using PDF.js
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdfDocument = await loadingTask.promise;

                let fullTextLines = [];

                // 3. Extract text from each page
                for (let i = 1; i <= pdfDocument.numPages; i++) {
                    const page = await pdfDocument.getPage(i);
                    const textContent = await page.getTextContent();

                    // Simple heuristic to join text items that are roughly on the same line
                    // and separate ones that are on different lines.
                    let lastY = -1;
                    let currentLine = "";

                    textContent.items.forEach(item => {
                        // The item.transform[5] is the Y coordinate in PDF coordinates
                        const y = Math.round(item.transform[5] / 10) * 10; // Group vertically by ~10 units

                        if (lastY === -1) {
                            currentLine = item.str;
                            lastY = y;
                        } else if (Math.abs(y - lastY) < 15) {
                            // Elements on the same line
                            currentLine += item.str;
                        } else {
                            // New line
                            if (currentLine.trim()) {
                                fullTextLines.push(currentLine.trim());
                            }
                            currentLine = item.str;
                            lastY = y;
                        }
                    });

                    if (currentLine.trim()) {
                        fullTextLines.push(currentLine.trim());
                    }

                    // Add a page break marker (visually only) for separation
                    fullTextLines.push("--- PAGE BREAK ---");
                }

                // 4. Create a docx Document
                const { Document, Packer, Paragraph, TextRun } = docx;

                // Map our extracted lines into docx Paragraphs
                const paragraphs = fullTextLines.map(line => {
                    return new Paragraph({
                        children: [
                            new TextRun({
                                text: line,
                                size: 24 // 12pt (size is in half-points)
                            })
                        ]
                    });
                });

                const doc = new Document({
                    sections: [{
                        properties: {},
                        children: paragraphs
                    }]
                });

                // 5. Pack doc into a buffer and initiate download
                const blob = await Packer.toBlob(doc);

                const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
                const newName = originalName + '_extracted.docx';

                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = newName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }
});
