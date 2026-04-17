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
    # Reset handler is at 0x100001f6 (Thumb). NM showed 0x100001f6.
    # LoadELF should set PC but if it fails we force it.
    Execute Command             cpu PC 0x100001f6
    Execute Command             cpu SP 0x20042000
    Execute Command             logLevel 3
    Create Terminal Tester      ${UART}
    Start Emulation
    # Wait for line instead of any char to avoid keyword issues
    Wait For Line On Uart       UART_OK  timeout=60
    Wait For Line On Uart       Pawn LED Runtime Starting...  timeout=60
    Wait For Line On Uart       Executing Pawn script...
    Wait For Line On Uart       LED STATE: 1
    Wait For Line On Uart       LED STATE: 0
    Wait For Line On Uart       LED STATE: 1
    Wait For Line On Uart       LED STATE: 0
