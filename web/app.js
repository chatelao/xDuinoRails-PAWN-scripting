// Blockly definitions
Blockly.Blocks['pawn_main'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("main()");
    this.appendStatementInput("STACK")
        .setCheck(null);
    this.setColour(230);
    this.setTooltip("The entry point of the script");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['pawn_set_led'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("set_led")
        .appendField(new Blockly.FieldDropdown([["ON","1"], ["OFF","0"]]), "STATUS");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Sets the LED state");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['pawn_delay'] = {
  init: function() {
    this.appendValueInput("MS")
        .setCheck("Number")
        .appendField("delay");
    this.appendDummyInput()
        .appendField("ms");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Pauses execution for specified milliseconds");
    this.setHelpUrl("");
  }
};

// PAWN Generator
const PawnGenerator = new Blockly.Generator('PAWN');

PawnGenerator.PRECEDENCE = {
  ATOMIC: 0,
};

PawnGenerator.forBlock['pawn_main'] = function(block) {
  const stack = PawnGenerator.statementToCode(block, 'STACK');
  return 'main() {\n' + stack + '}\n';
};

PawnGenerator.forBlock['pawn_set_led'] = function(block) {
  const status = block.getFieldValue('STATUS');
  return 'set_led(' + status + ');\n';
};

PawnGenerator.forBlock['pawn_delay'] = function(block) {
  const ms = PawnGenerator.valueToCode(block, 'MS', PawnGenerator.PRECEDENCE.ATOMIC) || '0';
  return 'delay(' + ms + ');\n';
};

PawnGenerator.forBlock['math_number'] = function(block) {
  const code = String(block.getFieldValue('NUM'));
  return [code, PawnGenerator.PRECEDENCE.ATOMIC];
};

PawnGenerator.forBlock['controls_repeat_ext'] = function(block) {
  const repeats = PawnGenerator.valueToCode(block, 'TIMES', PawnGenerator.PRECEDENCE.ATOMIC) || '0';
  const branch = PawnGenerator.statementToCode(block, 'DO');
  return 'for (new i = 0; i < ' + repeats + '; i++) {\n' + branch + '}\n';
};

PawnGenerator.forBlock['controls_whileUntil'] = function(block) {
  const argument0 = PawnGenerator.valueToCode(block, 'BOOL', PawnGenerator.PRECEDENCE.ATOMIC) || 'false';
  const branch = PawnGenerator.statementToCode(block, 'DO');
  return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

PawnGenerator.forBlock['logic_boolean'] = function(block) {
  const code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, PawnGenerator.PRECEDENCE.ATOMIC];
};

PawnGenerator.scrub_ = function(block, code, opt_thisOnly) {
  const nextBlock = block.getNextBlock();
  const nextCode = opt_thisOnly ? '' : PawnGenerator.blockToCode(nextBlock);
  return code + nextCode;
};

const compileBtn = document.getElementById('compile-btn');
const loadBtn = document.getElementById('load-btn');
const toggleBtn = document.getElementById('toggle-editor');
const fileInput = document.getElementById('file-input');
const downloadLink = document.getElementById('download-link');
const editor = document.getElementById('editor');
const editorContainer = document.getElementById('editor-container');
const blocklyContainer = document.getElementById('blockly-container');
const consoleArea = document.getElementById('console');

let isBlocklyMode = false;
let workspace;

toggleBtn.addEventListener('click', () => {
    isBlocklyMode = !isBlocklyMode;
    if (isBlocklyMode) {
        editorContainer.style.display = 'none';
        blocklyContainer.style.display = 'flex';
        toggleBtn.textContent = 'Switch to Code';
        if (!workspace) {
            workspace = Blockly.inject('blockly-div', {
                toolbox: document.getElementById('toolbox'),
                scrollbars: true,
                trashcan: true
            });
        } else {
            Blockly.svgResize(workspace);
        }
    } else {
        editorContainer.style.display = 'flex';
        blocklyContainer.style.display = 'none';
        toggleBtn.textContent = 'Switch to Blocks';
    }
});

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

    let code = editor.value;
    if (isBlocklyMode) {
        let generatedCode = '';
        try {
            generatedCode = PawnGenerator.workspaceToCode(workspace);
        } catch (e) {
            log('Error generating code: ' + e);
        }
        code = 'native set_led(status);\n' +
               'native delay(ms);\n\n' +
               generatedCode;
        log('Generated Code:\n' + code);
    }

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
