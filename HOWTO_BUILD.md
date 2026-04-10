# How to build the .uf2

To build the project and generate the \`.uf2\` file for the Seeed RP2040, follow these steps:

## Prerequisites

1.  **Raspberry Pi Pico SDK**: Ensure you have the Pico SDK installed.
    \`\`\`bash
    git clone --depth 1 https://github.com/raspberrypi/pico-sdk.git
    cd pico-sdk
    git submodule update --init
    export PICO_SDK_PATH=\$(pwd)
    cd ..
    \`\`\`
2.  **ARM Cross-Compiler**: Install \`gcc-arm-none-eabi\`.
3.  **CMake & Build Tools**: Ensure \`cmake\` and \`make\` are installed.

## Embedding your script

The firmware embeds a Pawn script into the executable. By default, \`scripts/blink.p\` is used.
To use your own script:
1.  Compile your script to \`.amx\`: \`pawncc myscript.p -o myscript.amx\`
2.  Convert it to a C header: \`xxd -i myscript.amx > src/blink_amx.h\`
3.  The variable name in the header must match what's expected in \`main.c\` (default is \`blink_amx\`).

## Building the Firmware

1.  Create a build directory:
    \`\`\`bash
    mkdir build
    cd build
    \`\`\`
2.  Configure the project:
    \`\`\`bash
    cmake .. -DPICO_SDK_PATH=/path/to/pico-sdk
    \`\`\`
3.  Build the project:
    \`\`\`bash
    make
    \`\`\`
    This will generate \`pawn_led.uf2\` in the build directory.
