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
    Execute Command             machine LoadPlatformDescriptionFromString "cpu: CPU.CortexM @ sysbus { cpuType: \\"cortex-m0+\\" }; nvic: IRQControllers.NVIC @ sysbus 0xE000E000 { cpu: cpu }; sram: Memory.MappedMemory @ sysbus 0x20000000 { size: 0x40000 }; flash: Memory.MappedMemory @ sysbus 0x10000000 { size: 0x200000 }; uart0: UART.PL011 @ sysbus 0x40034000 { nvic: nvic }"
    Execute Command             sysbus LoadELF ${BIN}
    Create Terminal Tester      ${UART}
    Start Emulation
    Wait For Line On Uart       Pawn LED Runtime Starting...
    Wait For Line On Uart       Executing Pawn script...
    Wait For Line On Uart       LED STATE: 1
    Wait For Line On Uart       LED STATE: 0
    Wait For Line On Uart       LED STATE: 1
    Wait For Line On Uart       LED STATE: 0
