#include "ymodem.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "pico/stdlib.h"

#define SOH 0x01
#define STX 0x02
#define EOT 0x04
#define ACK 0x06
#define NAK 0x15
#define CAN 0x18
#define CRC_C 0x43

#define PACKET_SEQNO_INDEX      1
#define PACKET_SEQNO_COMP_INDEX 2
#define PACKET_HEADER           3
#define PACKET_TRAILER          2
#define PACKET_OVERHEAD         (PACKET_HEADER + PACKET_TRAILER)
#define PACKET_SIZE             128
#define PACKET_1K_SIZE          1024

#define MAX_ERRORS 10

typedef enum {
    RES_OK,
    RES_EOT,
    RES_CAN,
    RES_TIMEOUT,
    RES_ERROR
} receive_res_t;

static uint16_t crc16_ccitt(const uint8_t *buf, int len) {
    uint16_t crc = 0;
    while (len--) {
        crc ^= (uint16_t)*buf++ << 8;
        for (int i = 0; i < 8; i++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
        }
    }
    return crc;
}

static receive_res_t receive_packet(uint8_t *data, int *length, uint8_t *seqno, uint32_t timeout) {
    int c;
    *length = 0;
    c = getchar_timeout_us(timeout);
    if (c < 0) return RES_TIMEOUT;

    switch (c) {
        case SOH:
            *length = PACKET_SIZE;
            break;
        case STX:
            *length = PACKET_1K_SIZE;
            break;
        case EOT:
            return RES_EOT;
        case CAN:
            if (getchar_timeout_us(timeout) == CAN) return RES_CAN;
            return RES_ERROR;
        default:
            return RES_ERROR;
    }

    uint8_t packet[PACKET_1K_SIZE + PACKET_OVERHEAD];
    packet[0] = (uint8_t)c;
    for (int i = 1; i < (*length + PACKET_OVERHEAD); i++) {
        c = getchar_timeout_us(timeout);
        if (c < 0) return RES_TIMEOUT;
        packet[i] = (uint8_t)c;
    }

    if (packet[PACKET_SEQNO_INDEX] != (uint8_t)(~packet[PACKET_SEQNO_COMP_INDEX])) {
        return RES_ERROR;
    }

    uint16_t crc = (packet[*length + PACKET_HEADER] << 8) | packet[*length + PACKET_HEADER + 1];
    if (crc16_ccitt(&packet[PACKET_HEADER], *length) != crc) {
        return RES_ERROR;
    }

    *seqno = packet[PACKET_SEQNO_INDEX];
    memcpy(data, &packet[PACKET_HEADER], *length);
    return RES_OK;
}

int ymodem_receive(uint8_t *buf, size_t max_size, char *filename) {
    uint8_t packet_data[PACKET_1K_SIZE];
    int packet_length;
    uint8_t seqno;
    int errors = 0;
    int session_done = 0;
    int file_done = 0;
    int packet_count = 0;
    size_t total_received = 0;
    size_t file_size = 0;

    while (!session_done) {
        errors = 0;
        file_done = 0;
        packet_count = 0;

        // Start session / request CRC
        putchar(CRC_C);

        while (!file_done) {
            receive_res_t res = receive_packet(packet_data, &packet_length, &seqno, 1000000);
            if (res == RES_OK) {
                if (seqno == (uint8_t)(packet_count & 0xFF)) {
                    if (packet_count == 0) {
                        // Filename packet
                        if (packet_data[0] == 0) {
                            // Empty filename means end of session
                            putchar(ACK);
                            session_done = 1;
                            file_done = 1;
                        } else {
                            // Safely copy filename (max 63 characters + null)
                            if (filename) {
                                strncpy(filename, (char *)packet_data, 63);
                                filename[63] = '\0';
                            }
                            // Find file size (it's the first string after the filename)
                            size_t name_len = 0;
                            while (name_len < (size_t)packet_length && packet_data[name_len] != '\0') {
                                name_len++;
                            }

                            if (name_len < (size_t)packet_length - 1) {
                                char *size_ptr = (char *)&packet_data[name_len + 1];
                                file_size = (size_t)strtoul(size_ptr, NULL, 10);
                            } else {
                                file_size = 0;
                            }

                            putchar(ACK);
                            putchar(CRC_C);
                            packet_count++;
                        }
                    } else {
                        // Data packet
                        size_t to_copy = (size_t)packet_length;
                        if (file_size > 0 && (total_received + to_copy) > file_size) {
                            to_copy = file_size - total_received;
                        }
                        if (total_received + to_copy <= max_size) {
                            memcpy(buf + total_received, packet_data, to_copy);
                            total_received += to_copy;
                        }
                        putchar(ACK);
                        packet_count++;
                    }
                    errors = 0;
                } else {
                    // Wrong sequence number or duplicate
                    if (seqno == (uint8_t)((packet_count - 1) & 0xFF)) {
                        putchar(ACK); // Duplicate, just ACK it
                    } else {
                        errors++;
                        putchar(NAK);
                    }
                }
            } else if (res == RES_EOT) {
                putchar(NAK); // NAK the first EOT
                if (getchar_timeout_us(1000000) == EOT) {
                    putchar(ACK); // ACK the second EOT
                    putchar(CRC_C); // Request for next file or end block
                    file_done = 1;
                } else {
                    errors++;
                }
            } else if (res == RES_CAN) {
                return -1;
            } else {
                // Error or Timeout
                errors++;
                if (errors > MAX_ERRORS) return -2;
                if (packet_count == 0) {
                    putchar(CRC_C);
                } else {
                    putchar(NAK);
                }
            }
        }

        if (session_done) break;
    }

    return (int)total_received;
}
