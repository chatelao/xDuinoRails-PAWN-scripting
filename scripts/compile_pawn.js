const fs = require('fs');
const path = require('path');

// Paths relative to project root (assuming we run from project root)
const projectRoot = process.cwd();
const pawnccJsPath = path.join(projectRoot, 'web/wasm/pawncc.js');
const pawnccDir = path.dirname(pawnccJsPath);

// We need to be in the directory where pawncc.data is for it to be loaded correctly by the generated JS
process.chdir(pawnccDir);

const Module = require(pawnccJsPath);

Module.onRuntimeInitialized = () => {
    try {
        const inputPath = path.join(projectRoot, 'scripts/blink.p');
        const outputPath = path.join(projectRoot, 'scripts/blink.amx');
        const headerPath = path.join(projectRoot, 'src/blink_amx.h');

        const content = fs.readFileSync(inputPath, 'utf8');
        Module.FS.writeFile('input.p', content);

        // Compile
        const result = Module.callMain(['input.p', '-ooutput.amx', '-i/include']);

        if (result === 0) {
            const amxData = Module.FS.readFile('output.amx');
            fs.writeFileSync(outputPath, amxData);
            console.log('Successfully compiled blink.p to blink.amx');

            // Generate C header (similar to xxd -i)
            let headerContent = 'unsigned char blink_amx[] = {\n  ';
            for (let i = 0; i < amxData.length; i++) {
                headerContent += '0x' + amxData[i].toString(16).padStart(2, '0');
                if (i < amxData.length - 1) {
                    headerContent += (i % 12 === 11) ? ',\n  ' : ', ';
                }
            }
            headerContent += '\n};\n';
            headerContent += `unsigned int blink_amx_len = ${amxData.length};\n`;

            fs.writeFileSync(headerPath, headerContent);
            console.log('Successfully generated src/blink_amx.h');
            process.exit(0);
        } else {
            console.error('Compilation failed with result:', result);
            process.exit(1);
        }
    } catch (e) {
        console.error('Error during compilation:', e);
        process.exit(1);
    }
};
