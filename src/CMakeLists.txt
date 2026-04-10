cmake_minimum_required(VERSION 3.13)

set(PICO_BOARD seeed_xiao_rp2040)

include(pico_sdk_import.cmake)

project(pawn_rp2040 C CXX ASM)

pico_sdk_init()

add_executable(pawn_rp2040
    main.c
    pawn/amx.c
    pawn/amxcore.c
    pawn/amxcons.c
    pawn/amxaux.c
    pawn/amxexec_cortexm0_gas.s
)

target_include_directories(pawn_rp2040 PRIVATE
    ${CMAKE_CURRENT_LIST_DIR}
    ${CMAKE_CURRENT_LIST_DIR}/pawn
)

target_compile_definitions(pawn_rp2040 PRIVATE
    AMX_ANSIONLY
    PAWN_CELL_SIZE=32
    AMX_NOCALLBACKS
)

target_link_libraries(pawn_rp2040
    pico_stdlib
    hardware_flash
    hardware_sync
    hardware_watchdog
)

pico_add_extra_outputs(pawn_rp2040)

pico_enable_stdio_usb(pawn_rp2040 1)
pico_enable_stdio_uart(pawn_rp2040 0)
