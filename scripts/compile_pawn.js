const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = process.cwd();
const pawnccPath = path.join(projectRoot, 'pawn_build_final/pawncc');
const inputPath = path.join(projectRoot, 'scripts/blink.p');
const outputPath = path.join(projectRoot, 'scripts/blink.amx');
const headerPath = path.join(projectRoot, 'src/blink_amx.h');
const includePath = path.join(projectRoot, 'web/include');

try {
    console.log('Compiling Pawn script...');

    if (process.platform === 'linux') {
        try { execSync(`chmod +x "${pawnccPath}"`); } catch (e) {}
    }

    let command = `"${pawnccPath}" "${inputPath}" -o"${outputPath}"`;
    if (fs.existsSync(includePath)) {
        command += ` -i"${includePath}"`;
    }

    console.log('Running:', command);
    execSync(command, { stdio: 'inherit' });

    if (!fs.existsSync(outputPath)) {
        throw new Error('Output file was not generated');
    }

    const amxData = fs.readFileSync(outputPath);
    console.log('Successfully compiled blink.p to blink.amx (' + amxData.length + ' bytes)');

    // Generate C header
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
