#ifndef YMODEM_H
#define YMODEM_H

#include <stdint.h>
#include <stddef.h>

int ymodem_receive(uint8_t *buf, size_t max_size, char *filename);

#endif
