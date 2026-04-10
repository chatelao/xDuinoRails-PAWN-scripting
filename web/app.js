const compileBtn = document.getElementById('compile-btn');
const loadBtn = document.getElementById('load-btn');
const fileInput = document.getElementById('file-input');
const downloadLink = document.getElementById('download-link');
const editor = document.getElementById('editor');
const consoleArea = document.getElementById('console');

function log(text) {
    consoleArea.textContent += text + '\n';
    consoleArea.scrollTop = consoleArea.scrollHeight;
}

function clearLog() {
    consoleArea.textContent = '';
}

loadBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            editor.value = e.target.result;
            log('Loaded file: ' + file.name);
        };
        reader.readAsText(file);
    }
});

compileBtn.addEventListener('click', async () => {
    clearLog();
    downloadLink.style.display = 'none';
    const code = editor.value;

    if (!Module || !Module.FS) {
        log('Error: Module.FS not initialized yet.');
        return;
    }

    try {
        // Write the source code to the virtual filesystem
        Module.FS.writeFile('input.pwn', code);

        log('Compiling...');

        // Call the compiler
        // -i/include is preloaded at /include
        const result = Module.callMain(['input.pwn', '-ooutput.amx', '-i/include']);

        log('Compiler returned: ' + result);

        if (result === 0) {
            try {
                const amxData = Module.FS.readFile('output.amx');
                const blob = new Blob([amxData], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                downloadLink.href = url;
                downloadLink.style.display = 'inline';
                log('Success! .amx file generated.');
            } catch (e) {
                log('Error reading output file: ' + e);
            }
        } else {
            log('Compilation failed.');
        }
    } catch (e) {
        log('Exception: ' + e);
    }
});
