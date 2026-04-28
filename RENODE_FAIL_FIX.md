# Proposed Fixes for Renode Simulation Failures

This document proposes three distinct solutions (A, B, and C) for each of the failure categories identified in `RENODE_FAIL.md`.

## 1. Pico SDK Initialization & Peripheral Polling
*   **Solution A (REPL Mocks):** Update `rp2040_pico.repl` to return specific success values for status registers. Use `0x80000000` for XOSC/PLL status bits and `0x01FFFFFF` for `RESET_DONE` to satisfy SDK polling loops.
*   **Solution B (Firmware Bypass):** Wrap SDK initialization calls in `#ifndef RENODE_CI` blocks. Use a custom `renode_init()` function that manually enables UART and skips complex clock/reset logic when the `RENODE_CI` flag is set.
*   **Solution C (Python Hooks):** Use Renode's Python integration to create dynamic hooks on peripheral read access. If the address matches a status register, return the value that indicates the peripheral is ready/stable.

## 2. SIO (Single-cycle IO) Block Misconfiguration
*   **Solution A (Mapped Memory):** Redefine the SIO block as `Memory.MappedMemory` with a size of `0x1000` in the `.repl` file. This allows the simulation to correctly handle register read/writes and effectively "mocks" the CPUID and spinlocks as simple memory locations.
*   **Solution B (Custom Peripheral Model):** Implement a small C# peripheral model for the SIO block that explicitly handles the CPUID register (offset `0x000`) and the spinlock registers (offsets `0x100`-`0x160`) with their expected atomic behavior.
*   **Solution C (Firmware Macro):** Redefine SIO register access macros in the firmware when `is_renode` is true. Redirect reads of `CPUID` to a constant `0` and ignore spinlock operations entirely to prevent deadlocks in the emulator.

## 3. Vector Table & Entry Point Guessing
*   **Solution A (Manual Robot Script Set):** Explicitly set the PC and SP registers in the `pawn_test.robot` file *after* the `LoadELF` command. Use `Execute Command sysbus.cpu PC 0x100001f7` (pointing to the reset handler) and `Execute Command sysbus.cpu SP 0x20042000` (pointing to the top of SRAM).
*   **Solution B (Platform Script Injection):** Use a Renode script (`.resc`) that sets the CPU properties immediately after loading the platform but before starting the simulation.
*   **Solution C (Linker Script Modification):** Update the firmware linker script to place the vector table at the very beginning of Flash (`0x10000000`) instead of following the boot2 stage. This aligns the binary with Renode's default guessing logic.

## 4. USB Controller & `stdio_init_all()`
*   **Solution A (Conditional Init):** Replace `stdio_init_all()` with `stdio_uart_init()` when `RENODE_CI` is defined. This bypasses the entire TinyUSB stack and avoids hangs waiting for USB hardware responses.
*   **Solution B (Fake USB Peripheral):** Add a `Tag` for the USB controller range (`0x50110000`) in the `.repl` file that returns `0` for all reads, preventing the SDK from detecting any "busy" or "error" states that might trigger infinite loops.
*   **Solution C (Linker Wrapping):** Use the GCC linker's `--wrap` feature for `stdio_init_all`. Implement `__wrap_stdio_init_all` to only call `uart_init` if the environment is detected as Renode.

## 5. Virtual Time and Delays
*   **Solution A (Busy-Wait Loop):** Implement a `safe_delay_ms` function that uses a simple `for` loop with `nop` instructions when Renode is detected. Use a modest multiplier (e.g., 100) to ensure virtual time advances without causing excessive real-time execution overhead.
*   **Solution B (Timer Mocking):** Map the Timer peripheral (`0x40054000`) as `Memory.MappedMemory` and use a Python script in Renode to increment the "time" value at that memory location every few instructions.
*   **Solution C (Timeout Extension):** Significantly increase the timeouts in the Robot Framework script (e.g., to 240 seconds for the initial sync) to accommodate the potentially high virtual-to-real-time ratio in cloud CI environments.

## 6. Atomic Register Aliases
*   **Solution A (Increased Tag Size):** Increase the size of all peripheral `Tag` blocks to `0x4000` (16KB) instead of `0x1000`. This accommodates the RP2040's atomic SET/CLR/XOR register aliases.
*   **Solution B (Contiguous Tag Blocks):** Define peripheral mocks as contiguous blocks in the `.repl` file to ensure any access within the standard RP2040 peripheral range is handled by *some* tag, preventing "Unhandled Access" errors.
*   **Solution C (Ignore Unhandled Access):** Use the Renode command `sysbus LogUnhandledAccess false` to prevent the simulation from logging or halting on accesses to unimplemented atomic alias registers, allowing the SDK to proceed even if the write is a "no-op" in the emulator.
