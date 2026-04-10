# Implementation Plan - PAWN for Seeed XIAO RP2040

This plan outlines the steps to realize scriptable LED behavior on the Seeed XIAO RP2040 using the PAWN scripting language, as defined in `GEMINI.md`.

## 1. Project Structure
- `/src`: C source code for the RP2040 firmware.
- `/include`: PAWN include files (`.inc`) and C headers (`.h`).
- `/scripts`: Example PAWN scripts (`.pwn`).
- `HOWTO_USE.md`: Instructions for installation and script updates.
- `HOWTO_BUILD.md`: Build instructions for the firmware.

## 2. Technical Specifications
### Hardware: Seeed XIAO RP2040
- **LED Pins**:
  - Red: GPIO 17
  - Green: GPIO 16
  - Blue: GPIO 25
- **Logic**: Active-low (0 = ON, 1 = OFF).

### Software: PAWN AMX
- **Core Files**: `amx.c`, `amx.h`, `amxcore.c`.
- **Interpreter**: Embedded Abstract Machine (AMX) running on RP2040 (Cortex-M0+).

## 3. Implementation Roadmap

### Phase 1: Environment Setup
- Setup Raspberry Pi Pico SDK.
- Configure CMake project structure in `/src`.
- Fetch PAWN source code from official mirror.

### Phase 2: Firmware Core
- Integrate PAWN AMX interpreter into the firmware.
- Configure AMX memory management for the RP2040's 264KB SRAM.
- Implement a script loader to read `.amx` binaries from Flash.

### Phase 3: Hardware Integration (Native Functions)
- Map GPIOs 17, 16, and 25 for LED control.
- Implement C native functions (e.g., `set_led(color, state)`) and register them with the AMX.
- Handle active-low logic in the driver layer.

### Phase 4: Build System & Deployment
- Configure `CMakeLists.txt` to link Pico SDK and PAWN AMX.
- Implement automated `.uf2` generation.
- Reserve Flash memory region for script storage.

### Phase 5: Documentation
- Create `HOWTO_BUILD.md` with toolchain and CMake instructions.
- Create `HOWTO_USE.md` for flashing and script deployment.
- Provide example `.pwn` scripts.
