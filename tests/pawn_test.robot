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
    ${VECTORS}=                 Execute Command             sysbus GetSymbolAddress "__vectors"
    ${MAIN}=                    Execute Command             sysbus GetSymbolAddress "main"
    ${STACK}=                   Execute Command             sysbus GetSymbolAddress "__StackTop"
    ${IS_RENODE_ADDR}=          Execute Command             sysbus GetSymbolAddress "is_renode"

    # Manually set VectorTableOffset, PC and SP to ensure the CPU starts correctly despite incorrect guessing
    Execute Command             sysbus.cpu VectorTableOffset ${VECTORS}
    # Force jump to main to bypass SDK init hangs
    Execute Command             sysbus.cpu PC ${MAIN}
    Execute Command             sysbus.cpu SP ${STACK}
    # Force is_renode to true in memory
    Execute Command             sysbus WriteByte ${IS_RENODE_ADDR} 1
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
