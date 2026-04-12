*** Settings ***
Suite Setup     Setup
Suite Teardown  Teardown
Test Setup      Reset Emulation
Resource        ${RENODEKEYWORDS}

*** Variables ***
${UART}           sysbus.uart0
${REPL}           ${CURDIR}/rp2040_pico.repl
${BIN}            ${CURDIR}/../build/pawn_led.elf

*** Test Cases ***
Should Blink LED Via Pawn Script
    [Documentation]             Verifies that the Pawn script correctly toggles the LED by checking UART output.
    [Tags]                      pawn  led  blink
    Execute Command             mach create
    Execute Command             machine LoadPlatformDescription @${REPL}
    Execute Command             sysbus LoadELF @${BIN}
    # Increase log level for debugging
    Execute Command             logLevel 3
    Create Terminal Tester      ${UART}
    Start Emulation
    # The firmware might need a bit more time or might be failing silently
    # Let's wait for ANY output first
    Wait For Line On Uart       Pawn LED Runtime Starting...  timeout=15
    Wait For Line On Uart       Executing Pawn script...
    Wait For Line On Uart       LED STATE: 1
    Wait For Line On Uart       LED STATE: 0
    Wait For Line On Uart       LED STATE: 1
    Wait For Line On Uart       LED STATE: 0
