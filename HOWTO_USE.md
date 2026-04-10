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

### Uploading a script via YMODEM

You can upload a compiled `.amx` script to the Seeed RP2040 without re-flashing the firmware:

1.  Connect to the device via a serial terminal (e.g., Minicom, Tera Term, or the built-in serial monitor).
2.  Reset the device.
3.  When you see `Press 'u' within 5 seconds to upload a new script via YMODEM...`, press the `u` key.
4.  The device will enter upload mode.
5.  Use your terminal's YMODEM send feature to send your `.amx` file.
    - On Linux using `sx`: `sb --ymodem myscript.amx < /dev/ttyACM0 > /dev/ttyACM0`
    - On Tera Term: `File -> Transfer -> YMODEM -> Send...`
6.  Once the transfer is complete, the script will start automatically.
### Documentation

For a comprehensive guide to the Pawn language, refer to the official [Pawn Language Guide](https://codeberg.org/compuphase/pawn/raw/branch/main/doc/Pawn_Language_Guide.pdf).

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
