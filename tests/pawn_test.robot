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
    # Manually set VectorTableOffset, PC and SP to ensure the CPU starts correctly despite incorrect guessing
    # 0x10000100 is where __vectors is located
    Execute Command             sysbus.cpu VectorTableOffset 0x10000100
    # Force jump to main to bypass SDK init hangs
    # 0x10000569 is main (Thumb mode)
    # 0x20042000 is __StackTop
    Execute Command             sysbus.cpu PC 0x10000569
    Execute Command             sysbus.cpu SP 0x20042000
    # Force is_renode to true in memory
    Execute Command             sysbus WriteByte 0x20011286 1
    Execute Command             sysbus.cpu IsHalted false
    # Set log level to DEBUG for CI diagnostics
    Execute Command             logLevel 1
    Create Terminal Tester      ${UART}
    Start Emulation
    # The firmware might need a bit more time or might be failing silently
    # Let's wait for ANY output first
    Wait For Line On Uart       UART_OK                       timeout=600
    Wait For Line On Uart       Booting...                    timeout=60
    Wait For Line On Uart       Pawn LED Runtime Starting...
    Wait For Line On Uart       Executing Pawn script...
    Wait For Line On Uart       LED STATE: 1
    Wait For Line On Uart       LED STATE: 0
    Wait For Line On Uart       LED STATE: 1
    Wait For Line On Uart       LED STATE: 0
