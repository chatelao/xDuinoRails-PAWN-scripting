#include "flash_storage.h"
#include "hardware/flash.h"
#include "hardware/sync.h"
#include <string.h>

typedef struct {
    uint32_t magic;
    uint32_t length;
} flash_header_t;

int flash_storage_save(const uint8_t *data, size_t length) {
    if (length > FLASH_SCRIPT_MAX_SIZE - sizeof(flash_header_t)) {
        return -1;
    }

    flash_header_t header;
    header.magic = FLASH_SCRIPT_MAGIC;
    header.length = (uint32_t)length;

    uint8_t buffer[FLASH_PAGE_SIZE];
    memset(buffer, 0xFF, FLASH_PAGE_SIZE);
    memcpy(buffer, &header, sizeof(header));

    // Copy first part of data to fill the first page
    size_t first_part_len = FLASH_PAGE_SIZE - sizeof(header);
    if (length < first_part_len) {
        first_part_len = length;
    }
    memcpy(buffer + sizeof(header), data, first_part_len);

    uint32_t ints = save_and_disable_interrupts();

    // Erase the required sectors
    uint32_t erase_size = (length + sizeof(header) + FLASH_SECTOR_SIZE - 1) & ~(FLASH_SECTOR_SIZE - 1);
    flash_range_erase(FLASH_SCRIPT_OFFSET, erase_size);

    // Program the first page (header + first part of data)
    flash_range_program(FLASH_SCRIPT_OFFSET, buffer, FLASH_PAGE_SIZE);

    // Program the rest of the data
    if (length > first_part_len) {
        flash_range_program(FLASH_SCRIPT_OFFSET + FLASH_PAGE_SIZE, data + first_part_len, (length - first_part_len + FLASH_PAGE_SIZE - 1) & ~(FLASH_PAGE_SIZE - 1));
    }

    restore_interrupts(ints);
    return 0;
}

int flash_storage_load(uint8_t *data, size_t *length, size_t max_size) {
    const uint8_t *flash_ptr = (const uint8_t *)(XIP_BASE + FLASH_SCRIPT_OFFSET);
    flash_header_t header;
    memcpy(&header, flash_ptr, sizeof(header));

    if (header.magic != FLASH_SCRIPT_MAGIC) {
        return -1;
    }

    if (header.length > max_size) {
        return -2;
    }

    *length = header.length;
    memcpy(data, flash_ptr + sizeof(header), header.length);
    return 0;
}
