cmake_minimum_required(VERSION 3.13)

# Import the Pico SDK
include(pico_sdk_import.cmake)

project(pawn_led C CXX ASM)

pico_sdk_init()

add_executable(pawn_led
    main.c
    ymodem.c
    flash_storage.c
    third_party/pawn/amx.c
    third_party/pawn/amxcore.c
)

# Pawn configuration
target_compile_definitions(pawn_led PRIVATE
    AMX_ANSIONLY
    PAWN_CELL_SIZE=32
    NO_FLOAT
)

target_include_directories(pawn_led PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/third_party/pawn
)

target_link_libraries(pawn_led pico_stdlib hardware_gpio hardware_flash hardware_sync hardware_uart)

# Enable USB and UART stdio
pico_enable_stdio_usb(pawn_led 1)
pico_enable_stdio_uart(pawn_led 1)

# Enable extra outputs (bin, hex, uf2)
pico_add_extra_outputs(pawn_led)
