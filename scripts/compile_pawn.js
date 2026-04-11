const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = process.cwd();
const pawnccPath = path.join(projectRoot, 'pawn_build_final/pawncc');
const inputPath = path.join(projectRoot, 'scripts/blink.p');
const outputPath = path.join(projectRoot, 'scripts/blink.amx');
const headerPath = path.join(projectRoot, 'src/blink_amx.h');

try {
    console.log('Compiling Pawn script using native compiler (O0)...');

    if (process.platform === 'linux') {
        try { execSync(`chmod +x "${pawnccPath}"`); } catch (e) {}
    }

    // Try with -O0 to avoid optimizer assertions in newer pawncc versions
    // or when built from source with certain flags
    let command = `"${pawnccPath}" "${inputPath}" -o"${outputPath}" -O0`;

    console.log('Running:', command);
    execSync(command, { stdio: 'inherit' });

    const amxData = fs.readFileSync(outputPath);
    console.log('Successfully compiled blink.p to blink.amx (' + amxData.length + ' bytes)');

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
} catch (e) {
    console.error('Error during compilation:', e.message);
    process.exit(1);
}
