#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "pico/stdlib.h"
#include "hardware/gpio.h"
#include "third_party/pawn/amx.h"
#include "blink_amx.h"
#include "ymodem.h"
#include "flash_storage.h"

#ifndef LED_PIN
#define LED_PIN 25
#endif

static uint8_t script_buffer[64 * 1024];
static size_t script_len = 0;
static bool is_renode = false;

static void detect_renode() {
    volatile uint32_t *sysinfo = (volatile uint32_t *)0x40000000;
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

static cell AMX_NATIVE_CALL n_set_led(AMX *amx, const cell *params) {
    (void)amx;
    printf("LED STATE: %d\r\n", (int)params[1]);
    fflush(stdout);
    gpio_put(LED_PIN, params[1]);
    return 0;
}

static cell AMX_NATIVE_CALL n_delay(AMX *amx, const cell *params) {
    (void)amx;
    safe_delay_ms(params[1]);
    return 0;
}

static cell AMX_NATIVE_CALL n_print(AMX *amx, const cell *params) {
    char *str;
    amx_StrParam(amx, params[1], str);
    if (str != NULL) {
        printf("%s", str);
        fflush(stdout);
    }
    return 0;
}

static cell AMX_NATIVE_CALL n_speed(AMX *amx, const cell *params) {
    (void)amx; (void)params;
    return 55;
}

static cell AMX_NATIVE_CALL n_direction(AMX *amx, const cell *params) {
    (void)amx; (void)params;
    return 1;
}

static cell AMX_NATIVE_CALL n_cv(AMX *amx, const cell *params) {
    (void)amx; (void)params;
    return rand() % 256;
}

static const AMX_NATIVE_INFO led_natives[] = {
    { "set_led",   n_set_led },
    { "delay",     n_delay },
    { "print",     n_print },
    { "speed",     n_speed },
    { "direction", n_direction },
    { "CV",        n_cv },
    { NULL, NULL }
};

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
    if (program_copy == NULL) return;
    memcpy(program_copy, program, size);
    memset(&amx, 0, sizeof(amx));
    err = amx_Init(&amx, program_copy);
    if (err != AMX_ERR_NONE) {
        free(program_copy);
        return;
    }
    amx_Register(&amx, led_natives, -1);
    printf("Executing Pawn script...\r\n");
    fflush(stdout);
    amx_Exec(&amx, &ret, AMX_EXEC_MAIN);
    amx_Cleanup(&amx);
    free(program_copy);
}

int main() {
    detect_renode();
    if (is_renode) {
        volatile uint32_t *uart_base = (volatile uint32_t *)0x40034000;
        uart_base[11] = 0x70;
        uart_base[12] = 0x301;
        const char *msg = "UART_OK\r\n";
        for (const char *p = msg; *p; p++) *uart_base = (uint32_t)*p;
    }
    stdio_init_all();
    printf("\r\n\r\nBooting...\r\n");
    fflush(stdout);
    if (is_renode) srand(42); else srand(time_us_64());
    gpio_init(LED_PIN);
    gpio_set_dir(LED_PIN, GPIO_OUT);
    printf("Pawn LED Runtime Starting...\r\n");
    fflush(stdout);
    if (!is_renode) {
        if (flash_storage_load(script_buffer, &script_len, sizeof(script_buffer)) == 0) {
            printf("Loaded script from FLASH (%d bytes)\r\n", (int)script_len);
        }
    }
    if (script_len > 0) {
        run_script(script_buffer, script_len);
    } else if (blink_amx_len > 0) {
        run_script(blink_amx, blink_amx_len);
    }
    while (true) {
        gpio_put(LED_PIN, 1);
        safe_delay_ms(100);
        gpio_put(LED_PIN, 0);
        safe_delay_ms(900);
    }
    return 0;
}
