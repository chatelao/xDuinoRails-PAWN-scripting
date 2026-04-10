cmake_minimum_required(VERSION 3.13)

# Import the Pico SDK
include(pico_sdk_import.cmake)

project(pawn_led C CXX ASM)

pico_sdk_init()

add_executable(pawn_led
    main.c
    third_party/pawn/amx.c
    third_party/pawn/amxcore.c
    third_party/pawn/amxexec.c
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

target_link_libraries(pawn_led pico_stdlib hardware_gpio)

# Enable extra outputs (bin, hex, uf2)
pico_add_extra_outputs(pawn_led)
