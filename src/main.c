#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "pico/stdlib.h"
#include "pico/stdio_uart.h"
#include "hardware/gpio.h"
#include "hardware/uart.h"
#include "third_party/pawn/amx.h"
#include "blink_amx.h"
#include "ymodem.h"
#include "flash_storage.h"

// Default LED pin for Seeed Studio XIAO RP2040
#ifndef LED_PIN
#define LED_PIN 25
#endif

#define SCRIPT_MAX_SIZE (64 * 1024)

static bool is_renode = false;

static void detect_renode() {
#ifdef RENODE_CI
    is_renode = true;
    return;
#endif
    uint32_t *sysinfo = (uint32_t *)0x40000000;
    if (*sysinfo == 0xDEADBEEF) {
        is_renode = true;
    }
}

static void safe_delay_ms(uint32_t ms) {
    if (is_renode) {
        for (volatile uint32_t i = 0; i < ms * 10000; i++) {
            __asm("nop");
        }
    } else {
        sleep_ms(ms);
    }
}
static uint8_t script_buffer[SCRIPT_MAX_SIZE];
static size_t script_len = 0;

// Native function: set_led(status)
static cell AMX_NATIVE_CALL n_set_led(AMX *amx, const cell *params) {
    (void)amx;
    printf("LED STATE: %d\r\n", (int)params[1]);
    fflush(stdout);
    gpio_put(LED_PIN, params[1]);
    return 0;
}

// Native function: delay(ms)
static cell AMX_NATIVE_CALL n_delay(AMX *amx, const cell *params) {
    (void)amx;
    safe_delay_ms(params[1]);
    return 0;
}

// Native function: print(const string[])
static cell AMX_NATIVE_CALL n_print(AMX *amx, const cell *params) {
    char *str;
    amx_StrParam(amx, params[1], str);
    if (str != NULL) {
        printf("%s\r\n", str);
        fflush(stdout);
    }
    return 0;
}

// Native function: speed()
static cell AMX_NATIVE_CALL n_speed(AMX *amx, const cell *params) {
    (void)amx;
    (void)params;
    return 55;
}

// Native function: direction()
static cell AMX_NATIVE_CALL n_direction(AMX *amx, const cell *params) {
    (void)amx;
    (void)params;
    return 1; // Forward
}

// Native function: CV(id)
static cell AMX_NATIVE_CALL n_cv(AMX *amx, const cell *params) {
    (void)amx;
    (void)params;
    return rand() % 256;
}

// Native function: set_output(id, value)
static cell AMX_NATIVE_CALL n_set_output(AMX *amx, const cell *params) {
    (void)amx;
    printf("OUTPUT %d STATE: %d\r\n", (int)params[1], (int)params[2]);
    fflush(stdout);
    return 0;
}

// Native function: get_function(id)
static cell AMX_NATIVE_CALL n_get_function(AMX *amx, const cell *params) {
    (void)amx;
    (void)params;
    return rand() % 2;
}

// Native function: actual_speed()
static cell AMX_NATIVE_CALL n_actual_speed(AMX *amx, const cell *params) {
    (void)amx;
    (void)params;
    return 45 + (rand() % 20);
}

// Native function: load()
static cell AMX_NATIVE_CALL n_load(AMX *amx, const cell *params) {
    (void)amx;
    (void)params;
    return rand() % 100;
}

// Native function: temperature()
static cell AMX_NATIVE_CALL n_temperature(AMX *amx, const cell *params) {
    (void)amx;
    (void)params;
    return 20 + (rand() % 30);
}

// Native function: voltage()
static cell AMX_NATIVE_CALL n_voltage(AMX *amx, const cell *params) {
    (void)amx;
    (void)params;
    return 12000 + (rand() % 4000);
}

static const AMX_NATIVE_INFO led_natives[] = {
    { "set_led",       n_set_led },
    { "delay",         n_delay },
    { "print",         n_print },
    { "speed",         n_speed },
    { "direction",     n_direction },
    { "CV",            n_cv },
    { "set_output",    n_set_output },
    { "get_function",  n_get_function },
    { "actual_speed",  n_actual_speed },
    { "load",          n_load },
    { "temperature",   n_temperature },
    { "voltage",       n_voltage },
    { NULL, NULL }
};

// Required by Pawn
int AMXEXPORT amx_CoreInit(AMX *amx);
int AMXEXPORT amx_CoreCleanup(AMX *amx);

void amx_ErrorHandler(AMX *amx, int error) {
    (void)amx;
    printf("Pawn error %d\r\n", error);
    fflush(stdout);
}

void run_script(void *program, size_t size) {
    AMX amx;
    cell ret = 0;
    int err;

    void *program_copy = malloc(size);
    if (program_copy == NULL) {
        printf("Failed to allocate memory for Pawn program\r\n");
        fflush(stdout);
        return;
    }
    memcpy(program_copy, program, size);

    memset(&amx, 0, sizeof(amx));
    err = amx_Init(&amx, program_copy);
    if (err != AMX_ERR_NONE) {
        printf("amx_Init failed with error %d\r\n", err);
        fflush(stdout);
        free(program_copy);
        return;
    }

    amx_Register(&amx, led_natives, -1);

    printf("Executing Pawn script...\r\n");
    fflush(stdout);
    err = amx_Exec(&amx, &ret, AMX_EXEC_MAIN);
    if (err != AMX_ERR_NONE) {
        printf("amx_Exec failed with error %d\r\n", err);
        fflush(stdout);
    }

    printf("Pawn script finished with return value %ld\r\n", (long)ret);
    fflush(stdout);

    amx_Cleanup(&amx);
    free(program_copy);
}

// Dummy implementation of event handlers (never called)
void dummy_on_speed_change(AMX *amx) {
    int index;
    cell ret;
    if (amx_FindPublic(amx, "onSpeedChange", &index) == AMX_ERR_NONE) {
        amx_Exec(amx, &ret, index);
    }
}

void dummy_on_direction_change(AMX *amx) {
    int index;
    cell ret;
    if (amx_FindPublic(amx, "onDirectionChange", &index) == AMX_ERR_NONE) {
        amx_Exec(amx, &ret, index);
    }
}

int main() {
    detect_renode();
    if (is_renode) {
        // Direct UART access to ensure signal is sent even if stdio_init_all hangs
        uart_init(uart0, 115200);
        gpio_set_function(0, GPIO_FUNC_UART); // TX
        gpio_set_function(1, GPIO_FUNC_UART); // RX
        uart_puts(uart0, "UART_OK\r\n");

        // Initialize only UART stdio in Renode to avoid USB-related hangs
        stdio_uart_init();
        printf("Booting...\r\n");
        fflush(stdout);
    } else {
        stdio_init_all();
        printf("Booting...\r\n");
        fflush(stdout);
    }
    if (is_renode) {
        srand(42); // Fixed seed for Renode
    } else {
        srand(time_us_64());
    }
    gpio_init(LED_PIN);
    gpio_set_dir(LED_PIN, GPIO_OUT);

    printf("\r\n\r\nPawn LED Runtime Starting...\r\n");
    fflush(stdout);

    // Try to load script from FLASH
    if (!is_renode) {
        if (flash_storage_load(script_buffer, &script_len, SCRIPT_MAX_SIZE) == 0) {
            printf("Loaded script from FLASH (%d bytes)\r\n", (int)script_len);
            fflush(stdout);
        } else {
            printf("No script found in FLASH.\r\n");
            fflush(stdout);
        }
    } else {
        printf("Renode detected: skipping FLASH loading.\r\n");
        fflush(stdout);
    }

    bool upload_mode = false;
    if (!is_renode) {
        printf("Press 'u' within 5 seconds to upload a new script via YMODEM...\r\n");
        fflush(stdout);

        int64_t start_time = time_us_64();
        while (time_us_64() - start_time < 5000000) {
            int c = getchar_timeout_us(0);
            if (c == 'u') {
                upload_mode = true;
                break;
            } else if (c == 's') {
                break;
            }
            tight_loop_contents();
        }
    } else {
        printf("Renode detected: skipping YMODEM timeout.\r\n");
        fflush(stdout);
    }

    if (upload_mode) {
        printf("Entering YMODEM upload mode. Start your YMODEM transfer now...\r\n");
        fflush(stdout);

#if PICO_STDIO_USB
        extern stdio_driver_t stdio_usb;
        stdio_set_translate_crlf(&stdio_usb, false);
#endif
#if PICO_STDIO_UART
        extern stdio_driver_t stdio_uart;
        stdio_set_translate_crlf(&stdio_uart, false);
#endif

        char filename[64];
        int res = ymodem_receive(script_buffer, SCRIPT_MAX_SIZE, filename);

#if PICO_STDIO_USB
        stdio_set_translate_crlf(&stdio_usb, true);
#endif
#if PICO_STDIO_UART
        stdio_set_translate_crlf(&stdio_uart, true);
#endif

        if (res > 0) {
            printf("\r\nSuccessfully received %d bytes: %s\r\n", res, filename);
            fflush(stdout);
            script_len = res;

            // Save to FLASH
            if (flash_storage_save(script_buffer, script_len) == 0) {
                printf("Script saved to FLASH.\r\n");
                fflush(stdout);
            } else {
                printf("Failed to save script to FLASH.\r\n");
                fflush(stdout);
            }
        } else {
            printf("\r\nYMODEM upload failed with error %d\r\n", res);
            fflush(stdout);
        }
    }

    if (script_len > 0) {
        run_script(script_buffer, script_len);
    } else if (blink_amx_len > 0) {
        printf("Running embedded script...\r\n");
        fflush(stdout);
        run_script(blink_amx, blink_amx_len);
    } else {
        printf("No script to run.\r\n");
        fflush(stdout);
    }

    printf("Entering heartbeat loop...\r\n");
    fflush(stdout);
    while (true) {
        gpio_put(LED_PIN, 1);
        sleep_ms(100);
        gpio_put(LED_PIN, 0);
        sleep_ms(900);
    }

    return 0;
}
