# Proposed Fixes for Renode Simulation Failures

This document proposes three distinct solutions for each failure category identified in `RENODE_FAIL.md`.

## 1. Pico SDK Initialization & Peripheral Polling
*   **Solution A (REPL Mocks):** Update `rp2040_pico.repl` to return specific success values for status registers. Use `0x80000000` for XOSC/PLL status bits and `0x01FFFFFF` for `RESET_DONE` to satisfy SDK polling loops.
*   **Solution B (Firmware Bypass):** Wrap SDK initialization calls in `#ifndef RENODE_CI` blocks. Use a custom `renode_init()` function that manually enables UART and skips complex clock/reset logic when the `RENODE_CI` flag is set.
*   **Solution C (Python Hooks):** Use Renode's Python integration to create dynamic hooks on peripheral read access. If the address matches a status register, return the value that indicates the peripheral is ready/stable.

## 2. SIO (Single-cycle IO) Block Misconfiguration
*   **Solution A (Mapped Memory):** Redefine the SIO block as `Memory.MappedMemory` with a size of `0x1000` in the `.repl` file. This allows the simulation to correctly handle register read/writes and effectively "mocks" the CPUID and spinlocks as simple memory locations.
*   **Solution B (Custom Peripheral Model):** Implement a small C# peripheral model for the SIO block that explicitly handles the CPUID register (offset `0x000`) and the spinlock registers (offsets `0x100`-`0x160`) with their expected atomic behavior.
*   **Solution C (Firmware Macro):** Redefine SIO register access macros in the firmware when `is_renode` is true. Redirect reads of `CPUID` to a constant `0` and ignore spinlock operations entirely to prevent deadlocks in the emulator.

## 3. USB Controller & `stdio_init_all()`
*   **Solution A (Conditional Init):** Replace `stdio_init_all()` with `stdio_uart_init()` when `RENODE_CI` is defined. This bypasses the entire TinyUSB stack and avoids hangs waiting for USB hardware responses.
*   **Solution B (Fake USB Peripheral):** Add a `Tag` for the USB controller range (`0x50110000`) in the `.repl` file that returns `0` for all reads, preventing the SDK from detecting any "busy" or "error" states that might trigger infinite loops.
*   **Solution C (Linker Wrapping):** Use the GCC linker's `--wrap` feature for `stdio_init_all`. Implement `__wrap_stdio_init_all` to only call `uart_init` if the environment is detected as Renode.

## 4. Virtual Time and Delays
*   **Solution A (Busy-Wait Loop):** Implement a `safe_delay_ms` function that uses a simple `for` loop with `nop` instructions when Renode is detected. This forces virtual time to advance through CPU instruction execution instead of relying on the hardware timer.
*   **Solution B (Timer Mocking):** Map the Timer peripheral (`0x40054000`) as `Memory.MappedMemory` and use a Python script in Renode to increment the "time" value at that memory location every few instructions.
*   **Solution C (Renode Quantum Adjustment):** Adjust the Renode execution "quantum" and performance settings in the `.resc` or Robot script (e.g., `emulation SetTimeStepping "Fixed"` and `cpu PerformanceInMips 100`) to ensure consistent time progression relative to the host clock.

## 5. REPL Syntax and Resource Mapping
*   **Solution A (Strict Ordering):** Reorganize `rp2040_pico.repl` to ensure the `nvic` is fully defined before it is assigned to the `cpu`. This prevents "undefined reference" errors during the platform loading phase.
*   **Solution B (Positional Tag Syntax):** Standardize all peripheral `Tag` definitions to use the `<address size>` positional format (e.g., `Tag <0x40000000 0x4000>`). This ensures compatibility across different Renode versions and avoids dictionary-style initialization issues.
*   **Solution C (Atomic Aliasing):** Increase the size of all peripheral `Tag` blocks to `0x4000` (16KB) instead of `0x1000`. This accommodates the RP2040's atomic SET/CLR/XOR register aliases, preventing "Unhandled Access" errors when the SDK uses these features.

## 6. UART Synchronization in CI
*   **Solution A (Manual UART Write):** Perform a direct register write to the UART Data Register (`0x40034000`) at the very beginning of `main()`. This sends a synchronization signal (like `UART_OK`) before any complex SDK or C-library initialization occurs.
*   **Solution B (Robot Framework Timeouts):** Increase the `timeout` values in `pawn_test.robot` (e.g., to 240 seconds) for the initial `Wait For Line On Uart` command. This accounts for the slow virtual-to-real-time ratio in GitHub Actions runners.
*   **Solution C (Explicit Flashing):** Call `fflush(stdout)` after every critical `printf` in the firmware. This ensures the Renode UART buffer is flushed immediately and the Terminal Tester receives the data without waiting for the internal buffer to fill or the stream to close.
