# How to install and run the software

## Installing the firmware

1.  Put your Seeed RP2040 into bootloader mode (usually by holding the BOOT button while connecting to USB).
2.  Drag and drop the `pawn_led.uf2` file into the RPI-RP2 drive.
3.  The device will reboot and start running the firmware.

## Running Pawn scripts

Currently, the firmware expects scripts to be embedded or uploaded via a specific method (e.g., serial or flash storage).

### Compiling a script

To compile a Pawn script (e.g., `blink.p`), use the `pawncc` compiler:
```bash
pawncc blink.p -o blink.amx
```

### Example script (blink.p)

```pawn
native set_led(status);
native delay(ms);

main()
{
    while (true)
    {
        set_led(1);
        delay(500);
        set_led(0);
        delay(1000);
    }
}
```

### Native functions available

- `set_led(status)`: Sets the LED state (1 for ON, 0 for OFF).
- `delay(ms)`: Pauses execution for the specified number of milliseconds.
