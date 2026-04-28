# Renode Simulation Failure Analysis: RP2040 Pawn Runtime

This document provides an in-depth analysis of why the Renode simulation for the RP2040-based Pawn runtime fails or hangs in CI/CD environments.

## 1. Early CPU Halt: PC/SP Initialization Failure
The most critical failure observed is an immediate CPU halt during the boot sequence.

*   **Symptom**: `[ERROR] cpu: PC does not lay in memory or PC and SP are equal to zero. CPU was halted.`
*   **Root Cause**: Renode's `CortexM` model attempts to "guess" the `VectorTableOffset` based on the loaded ELF. For RP2040 binaries, which include a 256-byte Boot Stage 2 (`.boot2`) at the start of Flash, the actual vector table starts at `0x10000100`.
*   **Failure Mechanism**: If Renode guesses `0x10000000`, it attempts to read the initial Stack Pointer (SP) from the first 4 bytes of Flash and the Reset Handler address (PC) from the next 4 bytes. Since these contain bootloader code/data rather than a vector table, the resulting PC/SP values are invalid, causing the CPU to halt before executing a single instruction.

## 2. Pico SDK Peripheral Polling Deadlocks
The Raspberry Pi Pico SDK performs extensive hardware checks before reaching `main()`.

*   **Symptom**: Simulation hangs with high virtual time progression but no UART output.
*   **Root Cause**: The SDK uses "busy-wait" loops that poll status registers for XOSC stability, PLL locks, and peripheral reset completion.
*   **Failure Mechanism**: If the Renode `.repl` file uses simple `Tag` mocks that return `0`, the SDK gets stuck in infinite loops. For example, `xosc_init` waits for the `STABLE` bit (bit 31) of `XOSC_STATUS` (0x40024004). If this bit never becomes `1`, the firmware never proceeds to initialize the UART or the Pawn runtime.

## 3. SIO (Single-cycle IO) Configuration
The SIO block is essential for basic RP2040 operations, including determining the CPU ID and using spinlocks.

*   **Symptom**: Random crashes or synchronization failures in the SDK.
*   **Root Cause**: Mapping SIO as a simple `Tag` does not support the expected behavior of registers like `CPUID` or the atomic nature of spinlocks.
*   **Failure Mechanism**: If the SDK reads a non-zero value from the `CPUID` register (at `0xd0000000`), it may attempt to execute Core 1 initialization logic on Core 0, leading to unexpected state transitions and hangs.

## 4. USB Controller & `stdio_init_all()`
*   **Symptom**: Firmware hangs during `stdio_init_all()`.
*   **Root Cause**: The RP2040 USB controller is complex and often unmodeled or only partially mocked in Renode.
*   **Failure Mechanism**: `stdio_init_all()` attempts to initialize the USB CDC stack. Without a responsive USB controller model, the TinyUSB stack may wait indefinitely for a hardware handshake or an interrupt that never arrives in the simulated environment.

## 5. UART Synchronization & Timeouts
*   **Symptom**: `InvalidOperationException: Terminal tester failed! ... Line containing >>UART_OK<< event: failure`
*   **Root Cause**: The mismatch between virtual time and real time in CI runners.
*   **Failure Mechanism**: If the simulation takes too long to bypass the SDK initialization (due to slow virtual time progression), the Renode "Terminal Tester" reaches its timeout (e.g., 120s or 240s) before the firmware has a chance to write the first byte to the UART Data Register.

## 6. Atomic Register Aliases
*   **Symptom**: `Unhandled Access` errors at offsets like `+0x1000`, `+0x2000`, or `+0x3000`.
*   **Root Cause**: RP2040 peripherals support atomic bit-set, bit-clear, and bit-xor via memory address aliasing.
*   **Failure Mechanism**: If a peripheral `Tag` in the `.repl` file is only defined with a size of `0x1000` (4KB), any write by the SDK to the atomic alias addresses results in a Renode error, halting or corrupting the simulation.
