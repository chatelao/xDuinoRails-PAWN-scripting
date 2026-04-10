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

Blockly.Blocks['pawn_speed'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("speed");
    this.setOutput(true, "Number");
    this.setColour(160);
    this.setTooltip("Returns the current speed (fixed at 55)");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['pawn_direction'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("direction");
    this.setOutput(true, "Number");
    this.setColour(160);
    this.setTooltip("Returns the current direction (Forward)");
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

Blockly.Blocks['pawn_print'] = {
  init: function() {
    this.appendValueInput("TEXT")
        .setCheck("String")
        .appendField("print");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Prints text to the console");
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

PawnGenerator.forBlock['pawn_print'] = function(block) {
  const text = PawnGenerator.valueToCode(block, 'TEXT', PawnGenerator.PRECEDENCE.ATOMIC) || '""';
  return 'print(' + text + ');\n';
};

PawnGenerator.forBlock['pawn_speed'] = function(block) {
  return ['speed()', PawnGenerator.PRECEDENCE.ATOMIC];
};

PawnGenerator.forBlock['pawn_direction'] = function(block) {
  return ['direction()', PawnGenerator.PRECEDENCE.ATOMIC];
};

PawnGenerator.forBlock['text'] = function(block) {
  const code = JSON.stringify(block.getFieldValue('TEXT'));
  return [code, PawnGenerator.PRECEDENCE.ATOMIC];
};

PawnGenerator.forBlock['math_number'] = function(block) {
  const code = String(block.getFieldValue('NUM'));
  return [code, PawnGenerator.PRECEDENCE.ATOMIC];
};

PawnGenerator.forBlock['logic_boolean'] = function(block) {
  const code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, PawnGenerator.PRECEDENCE.ATOMIC];
};

PawnGenerator.forBlock['controls_if'] = function(block) {
  let n = 0;
  let code = '';
  do {
    let conditionCode = PawnGenerator.valueToCode(block, 'IF' + n, PawnGenerator.PRECEDENCE.ATOMIC);
    if (!conditionCode && block.getField('COND' + n)) {
        conditionCode = block.getFieldValue('COND' + n);
    }
    if (!conditionCode) conditionCode = 'false';

    const branchCode = PawnGenerator.statementToCode(block, 'DO' + n);
    code += (n === 0 ? 'if (' : ' else if (') + conditionCode + ') {\n' + branchCode + '}';
    n++;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE')) {
    const branchCode = PawnGenerator.statementToCode(block, 'ELSE');
    code += ' else {\n' + branchCode + '}';
  }
  return code + '\n';
};

PawnGenerator.forBlock['logic_compare'] = function(block) {
  const OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  const operator = OPERATORS[block.getFieldValue('OP')];
  const argument0 = PawnGenerator.valueToCode(block, 'A', PawnGenerator.PRECEDENCE.ATOMIC) || '0';
  const argument1 = PawnGenerator.valueToCode(block, 'B', PawnGenerator.PRECEDENCE.ATOMIC) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, PawnGenerator.PRECEDENCE.ATOMIC];
};

PawnGenerator.forBlock['logic_operation'] = function(block) {
  const operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  const argument0 = PawnGenerator.valueToCode(block, 'A', PawnGenerator.PRECEDENCE.ATOMIC) || 'false';
  const argument1 = PawnGenerator.valueToCode(block, 'B', PawnGenerator.PRECEDENCE.ATOMIC) || 'false';
  const code = '(' + argument0 + ' ' + operator + ' ' + argument1 + ')';
  return [code, PawnGenerator.PRECEDENCE.ATOMIC];
};

PawnGenerator.forBlock['math_arithmetic'] = function(block) {
  const OPERATORS = {
    'ADD': [' + ', PawnGenerator.PRECEDENCE.ATOMIC],
    'MINUS': [' - ', PawnGenerator.PRECEDENCE.ATOMIC],
    'MULTIPLY': [' * ', PawnGenerator.PRECEDENCE.ATOMIC],
    'DIVIDE': [' / ', PawnGenerator.PRECEDENCE.ATOMIC],
    'POWER': [null, PawnGenerator.PRECEDENCE.ATOMIC]  // Pawn doesn't have **
  };
  const tuple = OPERATORS[block.getFieldValue('OP')];
  const operator = tuple[0];
  const argument0 = PawnGenerator.valueToCode(block, 'A', PawnGenerator.PRECEDENCE.ATOMIC) || '0';
  const argument1 = PawnGenerator.valueToCode(block, 'B', PawnGenerator.PRECEDENCE.ATOMIC) || '0';
  let code;
  if (!operator) {
    code = 'pow(' + argument0 + ', ' + argument1 + ')';
  } else {
    code = argument0 + operator + argument1;
  }
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
let lastGeneratedCode = '';

function generatePawnCode() {
    let generatedCode = '';
    try {
        const ws = workspace || Blockly.getMainWorkspace();
        if (ws) {
            generatedCode = PawnGenerator.workspaceToCode(ws);
        }
    } catch (e) {
        log('Error generating code: ' + e);
    }
    return 'native set_led(status);\n' +
           'native delay(ms);\n' +
           'native speed();\n' +
           'native direction();\n\n' +
           'const FORWARD = 1;\n' +
           'const BACKWARD = 0;\n\n' +
           generatedCode;
}

function generateBlocksFromCode(code) {
    if (!workspace) {
        workspace = Blockly.inject('blockly-div', {
            toolbox: document.getElementById('toolbox'),
            scrollbars: true,
            trashcan: true
        });
    }
    workspace.clear();

    // Remove comments and native declarations
    code = code.replace(/\/\/.*$/gm, '');
    code = code.replace(/native\s+\w+\([^)]*\);/g, '');

    // Basic regex-based parser for the most common blocks
    const mainMatch = code.match(/main\s*\(\s*\)\s*\{([\s\S]*)\}/);
    if (mainMatch) {
        const mainBlock = workspace.newBlock('pawn_main');
        mainBlock.initSvg();
        mainBlock.render();

        const body = mainMatch[1].trim();
        parseStatements(body, mainBlock.getInput('STACK').connection);
    }
}

function parseStatements(code, connection) {
    let currentConnection = connection;
    let remaining = code.trim();

    while (remaining.length > 0) {
        let match;
        // set_led(status)
        if (match = remaining.match(/^set_led\((\d+)\);/)) {
            const block = workspace.newBlock('pawn_set_led');
            block.setFieldValue(match[1], 'STATUS');
            block.initSvg();
            block.render();
            currentConnection.connect(block.previousConnection);
            currentConnection = block.nextConnection;
            remaining = remaining.substring(match[0].length).trim();
        }
        // print("text")
        else if (match = remaining.match(/^print\(\"([^\"]*)\"\);/)) {
            const block = workspace.newBlock('pawn_print');
            const textBlock = workspace.newBlock('text');
            textBlock.setFieldValue(match[1], 'TEXT');
            textBlock.initSvg();
            textBlock.render();
            block.getInput('TEXT').connection.connect(textBlock.outputConnection);
            block.initSvg();
            block.render();
            currentConnection.connect(block.previousConnection);
            currentConnection = block.nextConnection;
            remaining = remaining.substring(match[0].length).trim();
        }
        // delay(ms)
        else if (match = remaining.match(/^delay\((\d+)\);/)) {
            const block = workspace.newBlock('pawn_delay');
            const numBlock = workspace.newBlock('math_number');
            numBlock.setFieldValue(match[1], 'NUM');
            numBlock.initSvg();
            numBlock.render();
            block.getInput('MS').connection.connect(numBlock.outputConnection);
            block.initSvg();
            block.render();
            currentConnection.connect(block.previousConnection);
            currentConnection = block.nextConnection;
            remaining = remaining.substring(match[0].length).trim();
        }
        // if (cond) { ... } [else if (cond) { ... }] [else { ... }]
        else if (match = remaining.match(/^if\s*\(([^)]+)\)\s*\{/)) {
            const block = workspace.newBlock('controls_if');
            let elseIfCount = 0;
            let hasElse = false;

            const handleBranch = (condition, body, index) => {
                // Handle condition
                if (condition === 'true' || condition === 'false') {
                    const boolBlock = workspace.newBlock('logic_boolean');
                    boolBlock.setFieldValue(condition.toUpperCase(), 'BOOL');
                    boolBlock.initSvg();
                    boolBlock.render();
                    block.getInput('IF' + index).connection.connect(boolBlock.outputConnection);
                } else {
                    // For complex conditions, we add a text field to the IF input
                    const input = block.getInput('IF' + index);
                    input.appendField(new Blockly.FieldTextInput(condition), 'COND' + index);
                }
                // Handle body
                parseStatements(body, block.getInput('DO' + index).connection);
            };

            const firstCondition = match[1].trim();
            let i = match[0].length;
            let start = i;
            let braceCount = 1;
            while (braceCount > 0 && i < remaining.length) {
                if (remaining[i] === '{') braceCount++;
                if (remaining[i] === '}') braceCount--;
                i++;
            }
            const firstBody = remaining.substring(start, i - 1).trim();
            remaining = remaining.substring(i).trim();

            const branches = [{cond: firstCondition, body: firstBody}];

            while (true) {
                if (match = remaining.match(/^else\s+if\s*\(([^)]+)\)\s*\{/)) {
                    elseIfCount++;
                    const cond = match[1].trim();
                    i = match[0].length;
                    start = i;
                    braceCount = 1;
                    while (braceCount > 0 && i < remaining.length) {
                        if (remaining[i] === '{') braceCount++;
                        if (remaining[i] === '}') braceCount--;
                        i++;
                    }
                    const body = remaining.substring(start, i - 1).trim();
                    branches.push({cond, body});
                    remaining = remaining.substring(i).trim();
                } else if (match = remaining.match(/^else\s*\{/)) {
                    hasElse = true;
                    i = match[0].length;
                    start = i;
                    braceCount = 1;
                    while (braceCount > 0 && i < remaining.length) {
                        if (remaining[i] === '{') braceCount++;
                        if (remaining[i] === '}') braceCount--;
                        i++;
                    }
                    const body = remaining.substring(start, i - 1).trim();
                    branches.push({body});
                    remaining = remaining.substring(i).trim();
                    break; // else is always last
                } else {
                    break;
                }
            }

            // Update mutation
            if (elseIfCount > 0 || hasElse) {
                block.loadExtraState({
                    'elseIfCount': elseIfCount,
                    'hasElse': hasElse
                });
            }

            // Connect everything
            for (let j = 0; j < branches.length; j++) {
                if (j <= elseIfCount) { // IF or ELSE IF
                    handleBranch(branches[j].cond, branches[j].body, j);
                } else { // ELSE
                    parseStatements(branches[j].body, block.getInput('ELSE').connection);
                }
            }

            block.initSvg();
            block.render();
            currentConnection.connect(block.previousConnection);
            currentConnection = block.nextConnection;
        }
        else {
            // Skip unknown statement until semicolon or end
            const nextSemi = remaining.indexOf(';');
            if (nextSemi !== -1) {
                remaining = remaining.substring(nextSemi + 1).trim();
            } else {
                remaining = "";
            }
        }
    }
}

toggleBtn.addEventListener('click', () => {
    if (isBlocklyMode) {
        // Switch to Code
        const code = generatePawnCode();
        editor.value = code;
        lastGeneratedCode = code;

        isBlocklyMode = false;
        editorContainer.style.display = 'flex';
        blocklyContainer.style.display = 'none';
        toggleBtn.textContent = 'Switch to Blocks';
    } else {
        // Switch to Blocks
        const currentCode = editor.value;
        const needsConfirmation = lastGeneratedCode !== '' && currentCode !== lastGeneratedCode;

        if (needsConfirmation) {
            if (!confirm('You have made manual changes to the code. Switching to blocks will attempt to re-parse your code, and some manual changes might be lost. Continue?')) {
                return;
            }
        }

        isBlocklyMode = true;
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

        if (needsConfirmation || lastGeneratedCode === '') {
            generateBlocksFromCode(currentCode);
        }
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
        code = generatePawnCode();
        lastGeneratedCode = code;
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
