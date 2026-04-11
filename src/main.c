#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "pico/stdlib.h"
#include "hardware/gpio.h"
#include "third_party/pawn/amx.h"
#include "blink_amx.h"
#include "ymodem.h"
#include "flash_storage.h"

// Default LED pin for Seeed Studio XIAO RP2040
#ifndef LED_PIN
#define LED_PIN 25
#endif

#define SCRIPT_MAX_SIZE (64 * 1024)
static uint8_t script_buffer[SCRIPT_MAX_SIZE];
static size_t script_len = 0;

// Native function: set_led(status)
static cell AMX_NATIVE_CALL n_set_led(AMX *amx, const cell *params) {
    (void)amx;
    printf("LED STATE: %d\n", (int)params[1]);
    gpio_put(LED_PIN, params[1]);
    return 0;
}

// Native function: delay(ms)
static cell AMX_NATIVE_CALL n_delay(AMX *amx, const cell *params) {
    (void)amx;
    sleep_ms(params[1]);
    return 0;
}

// Native function: print(const string[])
static cell AMX_NATIVE_CALL n_print(AMX *amx, const cell *params) {
    char *str;
    amx_StrParam(amx, params[1], str);
    if (str != NULL) {
        printf("%s", str);
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

// Native function: get_function(id)
static cell AMX_NATIVE_CALL n_get_function(AMX *amx, const cell *params) {
    (void)amx;
    return params[1] % 2;
}

// Native function: actual_speed()
static cell AMX_NATIVE_CALL n_actual_speed(AMX *amx, const cell *params) {
    (void)amx;
    (void)params;
    return 42;
}

// Native function: load()
static cell AMX_NATIVE_CALL n_load(AMX *amx, const cell *params) {
    (void)amx;
    (void)params;
    return 10;
}

// Native function: temperature()
static cell AMX_NATIVE_CALL n_temperature(AMX *amx, const cell *params) {
    (void)amx;
    (void)params;
    return 45;
}

// Native function: voltage()
static cell AMX_NATIVE_CALL n_voltage(AMX *amx, const cell *params) {
    (void)amx;
    (void)params;
    return 14500;
}

// Native function: set_output(id, state)
static cell AMX_NATIVE_CALL n_set_output(AMX *amx, const cell *params) {
    (void)amx;
    printf("OUTPUT %d STATE: %d\n", (int)params[1], (int)params[2]);
    return 0;
}

static const AMX_NATIVE_INFO led_natives[] = {
    { "set_led",       n_set_led },
    { "delay",         n_delay },
    { "print",         n_print },
    { "speed",         n_speed },
    { "direction",     n_direction },
    { "CV",            n_cv },
    { "get_function",  n_get_function },
    { "actual_speed",  n_actual_speed },
    { "load",          n_load },
    { "temperature",   n_temperature },
    { "voltage",       n_voltage },
    { "set_output",    n_set_output },
    { NULL, NULL }
};

// Required by Pawn
int AMXEXPORT amx_CoreInit(AMX *amx);
int AMXEXPORT amx_CoreCleanup(AMX *amx);

void amx_ErrorHandler(AMX *amx, int error) {
    (void)amx;
    printf("Pawn error %d\n", error);
}

void run_script(void *program, size_t size) {
    AMX amx;
    cell ret = 0;
    int err;

    void *program_copy = malloc(size);
    if (program_copy == NULL) {
        printf("Failed to allocate memory for Pawn program\n");
        return;
    }
    memcpy(program_copy, program, size);

    memset(&amx, 0, sizeof(amx));
    err = amx_Init(&amx, program_copy);
    if (err != AMX_ERR_NONE) {
        printf("amx_Init failed with error %d\n", err);
        free(program_copy);
        return;
    }

    amx_Register(&amx, led_natives, -1);

    printf("Executing Pawn script...\n");
    err = amx_Exec(&amx, &ret, AMX_EXEC_MAIN);
    if (err != AMX_ERR_NONE) {
        printf("amx_Exec failed with error %d\n", err);
    }

    printf("Pawn script finished with return value %ld\n", (long)ret);

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

void dummy_on_function_change(AMX *amx, int function_id, int state) {
    int index;
    cell ret;
    if (amx_FindPublic(amx, "onFunctionChange", &index) == AMX_ERR_NONE) {
        amx_Push(amx, (cell)state);
        amx_Push(amx, (cell)function_id);
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
    stdio_init_all();
    srand(time_us_64());
    gpio_init(LED_PIN);
    gpio_set_dir(LED_PIN, GPIO_OUT);

    printf("\n\nPawn LED Runtime Starting...\n");

    // Try to load script from FLASH
    if (flash_storage_load(script_buffer, &script_len, SCRIPT_MAX_SIZE) == 0) {
        printf("Loaded script from FLASH (%d bytes)\n", (int)script_len);
    } else {
        printf("No script found in FLASH.\n");
    }

    printf("Press 'u' within 5 seconds to upload a new script via YMODEM...\n");

    int64_t start_time = time_us_64();
    bool upload_mode = false;
    while (time_us_64() - start_time < 5000000) {
        int c = getchar_timeout_us(0);
        if (c == 'u') {
            upload_mode = true;
            break;
        }
        tight_loop_contents();
    }

    if (upload_mode) {
        printf("Entering YMODEM upload mode. Start your YMODEM transfer now...\n");

        extern stdio_driver_t stdio_usb;
        stdio_set_translate_crlf(&stdio_usb, false);
        extern stdio_driver_t stdio_uart;
        stdio_set_translate_crlf(&stdio_uart, false);

        char filename[64];
        int res = ymodem_receive(script_buffer, SCRIPT_MAX_SIZE, filename);

        stdio_set_translate_crlf(&stdio_usb, true);
        stdio_set_translate_crlf(&stdio_uart, true);

        if (res > 0) {
            printf("\nSuccessfully received %d bytes: %s\n", res, filename);
            script_len = res;

            // Save to FLASH
            if (flash_storage_save(script_buffer, script_len) == 0) {
                printf("Script saved to FLASH.\n");
            } else {
                printf("Failed to save script to FLASH.\n");
            }
        } else {
            printf("\nYMODEM upload failed with error %d\n", res);
        }
    }

    if (script_len > 0) {
        run_script(script_buffer, script_len);
    } else if (blink_amx_len > 0) {
        printf("Running embedded script...\n");
        run_script(blink_amx, blink_amx_len);
    } else {
        printf("No script to run.\n");
    }

    printf("Entering heartbeat loop...\n");
    while (true) {
        gpio_put(LED_PIN, 1);
        sleep_ms(100);
        gpio_put(LED_PIN, 0);
        sleep_ms(900);
    }

    return 0;
}
