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
    Execute Command             logLevel 2
    Create Terminal Tester      ${UART}
    Start Emulation
    # Wait for the boot message
    Wait For Line On Uart       Pawn LED Runtime Starting...  timeout=30
    # Send 's' to skip the 5s YMODEM wait
    Execute Command             ${UART} WriteChar 115
    Wait For Line On Uart       Executing Pawn script...     timeout=30
    Wait For Line On Uart       LED STATE: 1
    Wait For Line On Uart       LED STATE: 0
    Wait For Line On Uart       LED STATE: 1
    Wait For Line On Uart       LED STATE: 0
