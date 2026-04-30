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
    # Manually set PC and SP to ensure the CPU starts correctly despite incorrect guessing
    # This must happen AFTER LoadELF as LoadELF resets PC/SP based on vector table guessing
    # 0x100001f7 is the _reset_handler (thumb bit set)
    # 0x20042000 is __StackTop
    Execute Command             sysbus.cpu PC 0x100001f7
    Execute Command             sysbus.cpu SP 0x20042000
    Execute Command             sysbus.cpu IsHalted false
    # Set log level to INFO
    Execute Command             logLevel 2
    Create Terminal Tester      ${UART}
    Start Emulation
    # The firmware might need a bit more time or might be failing silently
    # Let's wait for ANY output first
    Wait For Line On Uart       UART_OK                       timeout=240
    Wait For Line On Uart       Booting...                    timeout=10
    Wait For Line On Uart       Pawn LED Runtime Starting...
    Wait For Line On Uart       Executing Pawn script...
    Wait For Line On Uart       LED STATE: 1
    Wait For Line On Uart       LED STATE: 0
    Wait For Line On Uart       LED STATE: 1
    Wait For Line On Uart       LED STATE: 0
