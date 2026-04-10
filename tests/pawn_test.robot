*** Settings ***
Suite Setup     Setup
Suite Teardown  Teardown
Test Setup      Reset Emulation
Resource        ${RENODEKEYWORDS}

*** Variables ***
${UART}           sysbus.uart0
${BIN}            ${CURDIR}/../build/pawn_led.elf

*** Test Cases ***
Should Blink LED Via Pawn Script
    [Documentation]             Verifies that the Pawn script correctly toggles the LED by checking UART output.
    [Tags]                      pawn  led  blink
    Execute Command             mach create
    # Define a minimal platform with NVIC linked to CPU
    Execute Command             machine LoadPlatformDescriptionFromString "nvic0: IRQControllers.NVIC @ sysbus 0xe000e000; cpu0: CPU.CortexM @ sysbus { nvic: nvic0; cpuType: \\"cortex-m0+\\" }; sram0: Memory.MappedMemory @ sysbus 0x20000000 { size: 0x42000 }; flash0: Memory.MappedMemory @ sysbus 0x10000000 { size: 0x200000 }; uart0: UART.PL011 @ sysbus 0x40034000"
    Execute Command             sysbus LoadELF ${BIN}
    Create Terminal Tester      ${UART}
    Start Emulation
    Wait For Line On Uart       Pawn LED Runtime Starting...
    Wait For Line On Uart       Executing Pawn script...
    Wait For Line On Uart       LED STATE: 1
    Wait For Line On Uart       LED STATE: 0
    Wait For Line On Uart       LED STATE: 1
    Wait For Line On Uart       LED STATE: 0
