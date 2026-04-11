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

Blockly.Blocks['pawn_on_speed_change'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("onSpeedChange()");
    this.appendStatementInput("STACK")
        .setCheck(null);
    this.setColour(230);
    this.setTooltip("Event triggered when speed changes");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['pawn_on_direction_change'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("onDirectionChange()");
    this.appendStatementInput("STACK")
        .setCheck(null);
    this.setColour(230);
    this.setTooltip("Event triggered when direction changes");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['pawn_on_function_change'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("onFunctionChange(id, state)");
    this.appendStatementInput("STACK")
        .setCheck(null);
    this.setColour(230);
    this.setTooltip("Event triggered when a DCC function changes. Use 'event id' and 'event state' blocks inside.");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['pawn_event_id'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("event id");
    this.setOutput(true, "Number");
    this.setColour(160);
    this.setTooltip("Returns the 'id' parameter of the current event");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['pawn_event_state'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("event state");
    this.setOutput(true, "Number");
    this.setColour(160);
    this.setTooltip("Returns the 'state' parameter of the current event");
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

Blockly.Blocks['pawn_cv'] = {
  init: function() {
    this.appendValueInput("ID")
        .setCheck("Number")
        .appendField("CV");
    this.setOutput(true, "Number");
    this.setColour(160);
    this.setTooltip("Returns a random value (0-255) for the given CV ID");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['pawn_get_function'] = {
  init: function() {
    this.appendValueInput("ID")
        .setCheck("Number")
        .appendField("get_function");
    this.setOutput(true, "Number");
    this.setColour(160);
    this.setTooltip("Returns the state of a DCC function");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['pawn_actual_speed'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("actual_speed");
    this.setOutput(true, "Number");
    this.setColour(160);
    this.setTooltip("Returns the actual speed (Railcom)");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['pawn_load'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("load");
    this.setOutput(true, "Number");
    this.setColour(160);
    this.setTooltip("Returns the motor load (Railcom)");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['pawn_temperature'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("temperature");
    this.setOutput(true, "Number");
    this.setColour(160);
    this.setTooltip("Returns the decoder temperature (Railcom)");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['pawn_voltage'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("voltage");
    this.setOutput(true, "Number");
    this.setColour(160);
    this.setTooltip("Returns the track voltage (Railcom)");
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

Blockly.Blocks['pawn_set_output'] = {
  init: function() {
    this.appendValueInput("ID")
        .setCheck("Number")
        .appendField("set_output");
    this.appendDummyInput()
        .appendField("to")
        .appendField(new Blockly.FieldDropdown([["ON","1"], ["OFF","0"]]), "STATUS");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Sets a physical output state");
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
        .setCheck(null)
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

PawnGenerator.forBlock['pawn_on_speed_change'] = function(block) {
  const stack = PawnGenerator.statementToCode(block, 'STACK');
  return 'public onSpeedChange() {\n' + stack + '}\n';
};

PawnGenerator.forBlock['pawn_on_direction_change'] = function(block) {
  const stack = PawnGenerator.statementToCode(block, 'STACK');
  return 'public onDirectionChange() {\n' + stack + '}\n';
};

PawnGenerator.forBlock['pawn_on_function_change'] = function(block) {
  const stack = PawnGenerator.statementToCode(block, 'STACK');
  return 'public onFunctionChange(id, state) {\n' + stack + '}\n';
};

PawnGenerator.forBlock['pawn_event_id'] = function(block) {
  return ['id', PawnGenerator.PRECEDENCE.ATOMIC];
};

PawnGenerator.forBlock['pawn_event_state'] = function(block) {
  return ['state', PawnGenerator.PRECEDENCE.ATOMIC];
};

PawnGenerator.forBlock['pawn_set_led'] = function(block) {
  const status = block.getFieldValue('STATUS');
  return 'set_led(' + status + ');\n';
};

PawnGenerator.forBlock['pawn_set_output'] = function(block) {
  const id = PawnGenerator.valueToCode(block, 'ID', PawnGenerator.PRECEDENCE.ATOMIC) || '0';
  const status = block.getFieldValue('STATUS');
  return 'set_output(' + id + ', ' + status + ');\n';
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

PawnGenerator.forBlock['pawn_cv'] = function(block) {
  const id = PawnGenerator.valueToCode(block, 'ID', PawnGenerator.PRECEDENCE.ATOMIC) || '0';
  return ['CV(' + id + ')', PawnGenerator.PRECEDENCE.ATOMIC];
};

PawnGenerator.forBlock['pawn_get_function'] = function(block) {
  const id = PawnGenerator.valueToCode(block, 'ID', PawnGenerator.PRECEDENCE.ATOMIC) || '0';
  return ['get_function(' + id + ')', PawnGenerator.PRECEDENCE.ATOMIC];
};

PawnGenerator.forBlock['pawn_actual_speed'] = function(block) {
  return ['actual_speed()', PawnGenerator.PRECEDENCE.ATOMIC];
};

PawnGenerator.forBlock['pawn_load'] = function(block) {
  return ['load()', PawnGenerator.PRECEDENCE.ATOMIC];
};

PawnGenerator.forBlock['pawn_temperature'] = function(block) {
  return ['temperature()', PawnGenerator.PRECEDENCE.ATOMIC];
};

PawnGenerator.forBlock['pawn_voltage'] = function(block) {
  return ['voltage()', PawnGenerator.PRECEDENCE.ATOMIC];
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
           'native direction();\n' +
           'native CV(id);\n' +
           'native get_function(id);\n' +
           'native actual_speed();\n' +
           'native load();\n' +
           'native temperature();\n' +
           'native voltage();\n' +
           'native set_output(id, state);\n\n' +
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
    const functions = [
        { name: 'main', block: 'pawn_main', args: false },
        { name: 'onSpeedChange', block: 'pawn_on_speed_change', args: false },
        { name: 'onDirectionChange', block: 'pawn_on_direction_change', args: false },
        { name: 'onFunctionChange', block: 'pawn_on_function_change', args: true }
    ];

    functions.forEach(fn => {
        const regex = fn.args ?
            new RegExp('(?:public\\s+)?' + fn.name + '\\s*\\([^)]*\\)\\s*\\{') :
            new RegExp('(?:public\\s+)?' + fn.name + '\\s*\\(\\s*\\)\\s*\\{');
        const match = code.match(regex);
        if (match) {
            const startIdx = match.index + match[0].length;
            let braceCount = 1;
            let i = startIdx;
            while (braceCount > 0 && i < code.length) {
                if (code[i] === '{') braceCount++;
                else if (code[i] === '}') braceCount--;
                i++;
            }
            if (braceCount === 0) {
                const body = code.substring(startIdx, i - 1).trim();
                const block = workspace.newBlock(fn.block);
                block.initSvg();
                block.render();
                parseStatements(body, block.getInput('STACK').connection);
            }
        }
    });
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
        // set_output(id, state)
        else if (match = remaining.match(/^set_output\((\d+),\s*(\d+)\);/)) {
            const block = workspace.newBlock('pawn_set_output');
            const numBlock = workspace.newBlock('math_number');
            numBlock.setFieldValue(match[1], 'NUM');
            numBlock.initSvg();
            numBlock.render();
            block.getInput('ID').connection.connect(numBlock.outputConnection);
            block.setFieldValue(match[2], 'STATUS');
            block.initSvg();
            block.render();
            currentConnection.connect(block.previousConnection);
            currentConnection = block.nextConnection;
            remaining = remaining.substring(match[0].length).trim();
        }
        // CV(id) - as a statement (though it's an expression)
        else if (match = remaining.match(/^CV\((\d+)\);/)) {
            // Technically CV(id); is valid but does nothing.
            // We don't have a statement block for CV, it's an expression.
            // If it appears as a statement, we just skip it for now or we could add a block.
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
