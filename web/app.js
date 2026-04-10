const compileBtn = document.getElementById('compile-btn');
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
