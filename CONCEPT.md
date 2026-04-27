# XDRscript: Concept and Architecture

## Big Picture
XDRscript (xDuinoRails-PAWN-scripting) is a powerful, flexible scripting platform designed for the next generation of model railroad decoders. By integrating the **PAWN scripting language** into an RP2040-based firmware, it enables hobbyists and developers to define complex locomotive behaviors, lighting effects, and automation logic without needing to recompile the entire firmware.

The project provides a complete ecosystem, including a web-based "No-Code" Blockly editor, a web-integrated PAWN compiler, and a robust runtime environment on the Seeed Studio XIAO RP2040.

## Business Cases
1.  **Hobbyist Customization**: Most model railroad decoders offer a fixed set of "CV" (Configuration Variable) options. XDRscript breaks this limitation by allowing users to write custom logic for how their locomotives respond to commands and environmental sensors.
2.  **Reduced Development Cycle**: Manufacturers can provide a stable base firmware while allowing end-users or third-party developers to create specialized "behavior profiles" as scripts, which can be updated via serial/YMODEM without specialized hardware.
3.  **Educational Platform**: By combining Blockly (visual programming) with a real-world embedded target, XDRscript serves as an excellent tool for teaching embedded systems and automation in a hobbyist context.
4.  **Hardware Standardization**: A common scripting interface (API) allows the same behavior scripts to be ported across different hardware revisions or even different manufacturers, provided they implement the standard XDRscript native functions.

## Use Cases
-   **Advanced Lighting Effects**: Create realistic firebox flickers, ditch lights that cross-flash when the horn is active, or station-arrival lighting sequences triggered by speed changes.
-   **Smart Automation**: Implement logic where a locomotive automatically slows down or reverses after a specific delay, or when it detects a specific RailCom signal.
-   **Telemetry-Driven Behavior**: Use real-time data like `actual_speed`, `load`, or `temperature` to adjust sound or light intensity, simulating a hard-working steam engine or a modern diesel.
-   **Interactive Scenery**: Script stationary decoders to control level crossings, signal towers, or turntable logic based on external inputs.

## Architecture
The XDRscript architecture is divided into three main layers:

### 1. Frontend: Web IDE & Compiler
-   **Blockly Interface**: A visual editor that allows users to drag-and-drop logic blocks.
-   **Text Editor**: A standard code editor for advanced PAWN scripting.
-   **WASM Compiler**: The PAWN compiler (`pawncc`) is cross-compiled to WebAssembly, allowing the browser to generate `.amx` binaries directly from the source code.

### 2. Transport: YMODEM / Serial
-   **Protocol**: Compiled scripts are transmitted to the hardware using the YMODEM protocol over a serial connection.
-   **Persistence**: The firmware receives the script and stores it in the RP2040's internal Flash memory for persistent execution across reboots.

### 3. Backend: Firmware Runtime
-   **PAWN AMX**: The core "Abstract Machine" (interpreter) that executes the `.amx` bytecode. It is highly memory-efficient and designed for embedded targets.
-   **Native Function API**: A bridge between the script and the hardware. Functions like `set_led()`, `delay()`, and `CV()` are implemented in C and exposed to the PAWN environment.
-   **Event System**: The firmware can trigger "public" functions in the script (e.g., `onSpeedChange`, `onDirectionChange`) to respond to real-time events.

## Component Overview
| Component | Technology | Responsibility |
| :--- | :--- | :--- |
| **Web UI** | HTML/JS/Blockly | User interface and block-to-code generation. |
| **Compiler** | PAWN (WASM) | Compiles `.p` source to `.amx` bytecode in-browser. |
| **Runtime** | C (Pico SDK) | Orchestrates hardware, handles YMODEM, and hosts the AMX. |
| **Scripting** | PAWN | User-defined logic executed by the AMX. |
| **Hardware** | RP2040 | Physical execution target (Seeed XIAO RP2040). |
