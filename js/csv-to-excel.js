// csv-to-excel.js
// Handles drag-and-drop, encoding detection, and conversion using SheetJS

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

    // --- Handle Files ---
    function handleFiles(files) {
        const newFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.csv'));

        if (newFiles.length === 0) {
            alert('Please upload valid CSV files (.csv).');
            return;
        }

        // Add to existing files (prevent duplicates by name)
        newFiles.forEach(newFile => {
            if (!selectedFiles.find(f => f.file.name === newFile.name)) {
                selectedFiles.push({
                    file: newFile,
                    status: 'ready' // ready, processing, done, error
                });
            }
        });

        renderFileList();
    }

    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
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
            else if (f.status === 'processing') statusBadge = '<span class="status-badge status-processing">Processing...</span>';
            else if (f.status === 'done') statusBadge = '<span class="status-badge status-done">Done</span>';
            else if (f.status === 'error') statusBadge = '<span class="status-badge status-error">Error</span>';

            item.innerHTML = `
        <span class="file-name" title="${f.file.name}">${f.file.name}</span>
        <span class="file-size">${formatBytes(f.file.size)}</span>
        ${statusBadge}
        ${f.status === 'ready' ? `<button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px; margin-left: 10px;" onclick="window.removeFile(${idx})">Remove</button>` : ''}
      `;
            fileList.appendChild(item);
        });

        btnConvert.disabled = !selectedFiles.some(f => f.status === 'ready');
    }

    // Global function for remove button
    window.removeFile = function (idx) {
        selectedFiles.splice(idx, 1);
        renderFileList();
    };

    // --- Convert Process ---
    btnConvert.addEventListener('click', async () => {
        btnConvert.disabled = true;

        for (let i = 0; i < selectedFiles.length; i++) {
            if (selectedFiles[i].status !== 'ready') continue;

            selectedFiles[i].status = 'processing';
            renderFileList();

            try {
                await processFile(selectedFiles[i].file);
                selectedFiles[i].status = 'done';
            } catch (err) {
                console.error('Conversion error:', err);
                selectedFiles[i].status = 'error';
            }

            renderFileList();
        }
    });

    async function processFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            // Read as ArrayBuffer first to detect encoding
            reader.onload = function (e) {
                try {
                    const buffer = e.target.result;
                    const uint8Array = new Uint8Array(buffer);

                    // Read a sample to detect encoding
                    let binaryStr = "";
                    const sampleLength = Math.min(uint8Array.length, 4000); // 4KB sample
                    for (let i = 0; i < sampleLength; i++) {
                        binaryStr += String.fromCharCode(uint8Array[i]);
                    }

                    // Detect encoding using jschardet
                    let encoding = 'UTF-8';
                    const detected = jschardet.detect(binaryStr);

                    if (detected && detected.encoding && detected.confidence > 0.5) {
                        encoding = detected.encoding;
                        // Map common encodings to Web-compatible names
                        if (encoding.toUpperCase() === 'SHIFT_JIS') encoding = 'Shift_JIS';
                        if (encoding.toUpperCase() === 'UTF-16LE') encoding = 'UTF-16LE';
                    }

                    // Now read the file as text with the correct encoding
                    const textReader = new FileReader();
                    textReader.onload = function (evt) {
                        const textData = evt.target.result;

                        try {
                            // 1. Parse CSV to Workbook
                            // We use SheetJS (XLSX) to read the CSV text
                            const wb = XLSX.read(textData, { type: 'string', raw: true });

                            // 2. Write Workbook to XLSX binary
                            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

                            // 3. Trigger download
                            const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                            const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
                            const newName = originalName + '.xlsx';

                            const a = document.createElement('a');
                            a.href = URL.createObjectURL(blob);
                            a.download = newName;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);

                            resolve();
                        } catch (xlsxErr) {
                            reject(xlsxErr);
                        }
                    };

                    textReader.onerror = reject;
                    textReader.readAsText(file, encoding);

                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
});
