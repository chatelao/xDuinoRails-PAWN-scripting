#ifndef FLASH_STORAGE_H
#define FLASH_STORAGE_H

#include <stdint.h>
#include <stddef.h>

#define FLASH_SCRIPT_MAGIC 0x5041574E // "PAWN"
#define FLASH_SCRIPT_MAX_SIZE (64 * 1024)

// We use the last 64KB of the 2MB flash on the XIAO RP2040
#define FLASH_SCRIPT_OFFSET (2048 * 1024 - 64 * 1024)

int flash_storage_save(const uint8_t *data, size_t length);
int flash_storage_load(uint8_t *data, size_t *length, size_t max_size);

#endif
