#include <stdio.h>
#include <string.h>
#include "pico/stdlib.h"
#include "hardware/flash.h"
#include "hardware/sync.h"
#include "pawn/amx.h"
#include "pawn/amxaux.h"

// Flash area for the script: last 64KB of 2MB flash
#define FLASH_TARGET_OFFSET (2048 * 1024 - 64 * 1024)
const uint8_t *script_flash = (const uint8_t *)(XIP_BASE + FLASH_TARGET_OFFSET);

// Native function: delay(ms)
static cell AMX_NATIVE_CALL n_delay(AMX *amx, const cell *params) {
    (void)amx;
    sleep_ms(params[1]);
    return 0;
}

// Native function: setled(id, val)
// id: 0=Red, 1=Green, 2=Blue
// val: 0=off, 1=on
static cell AMX_NATIVE_CALL n_setled(AMX *amx, const cell *params) {
    (void)amx;
    int id = params[1];
    int val = params[2];

    int pin = -1;
    if (id == 0) pin = 17; // Red
    else if (id == 1) pin = 16; // Green
    else if (id == 2) pin = 25; // Blue

    if (pin != -1) {
        // Seeed XIAO RP2040 LEDs are active low
        gpio_put(pin, !val);
    }
    return 0;
}

AMX_NATIVE_INFO native_functions[] = {
    { "delay", n_delay },
    { "setled", n_setled },
    { NULL, NULL }
};

void run_script() {
    AMX amx;
    int err;
    void *program;

    // The script is in flash. AMX needs it in RAM if it's going to be modified,
    // but for simple execution we might be able to run it from flash if we are careful.
    // However, AMX usually expects to be able to write to the data section.
    // So we copy the header and data to RAM.

    AMX_HEADER hdr;
    memcpy(&hdr, script_flash, sizeof(hdr));

    if (hdr.magic != AMX_MAGIC) {
        printf("No valid script found in flash.\n");
        return;
    }

    program = malloc(hdr.stp);
    if (program == NULL) {
        printf("Failed to allocate memory for script.\n");
        return;
    }

    memcpy(program, script_flash, hdr.size);
    memset((uint8_t*)program + hdr.size, 0, hdr.stp - hdr.size);

    err = amx_Init(&amx, program);
    if (err == AMX_ERR_NONE) {
        amx_Register(&amx, native_functions, -1);
        printf("Running script...\n");
        cell retval;
        err = amx_Exec(&amx, &retval, AMX_EXEC_MAIN);
        if (err != AMX_ERR_NONE) {
            printf("Script execution error: %d\n", err);
        } else {
            printf("Script finished with return value: %ld\n", (long)retval);
        }
        amx_Cleanup(&amx);
    } else {
        printf("AMX Init error: %d\n", err);
    }

    free(program);
}

void upload_script() {
    printf("Waiting for .amx file (send size first, then data)...\n");
    uint32_t size;
    if (fread(&size, 1, 4, stdin) != 4) return;

    if (size > 64 * 1024) {
        printf("Script too large!\n");
        return;
    }

    uint8_t *buffer = malloc(64 * 1024);
    if (!buffer) return;

    if (fread(buffer, 1, size, stdin) != size) {
        printf("Failed to read script data.\n");
        free(buffer);
        return;
    }

    printf("Received %lu bytes. Writing to flash...\n", size);

    uint32_t ints = save_and_disable_interrupts();
    flash_range_erase(FLASH_TARGET_OFFSET, 64 * 1024);
    flash_range_program(FLASH_TARGET_OFFSET, buffer, (size + FLASH_PAGE_SIZE - 1) & ~(FLASH_PAGE_SIZE - 1));
    restore_interrupts(ints);

    printf("Done. Restarting...\n");
    free(buffer);
    watchdog_reboot(0, 0, 0);
}

int main() {
    stdio_init_all();

    gpio_init(16); gpio_set_dir(16, GPIO_OUT); gpio_put(16, 1);
    gpio_init(17); gpio_set_dir(17, GPIO_OUT); gpio_put(17, 1);
    gpio_init(25); gpio_set_dir(25, GPIO_OUT); gpio_put(25, 1);

    printf("Pawn RP2040 Host Started.\n");
    printf("Press 'u' for upload, 'r' to run script.\n");

    while (true) {
        int c = getchar_timeout_us(0);
        if (c == 'u') {
            upload_script();
        } else if (c == 'r') {
            run_script();
        }
        sleep_ms(10);
    }
}
