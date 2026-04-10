/* LED Blink script for Seeed RP2040 */

native set_led(status);
native delay(ms);

main()
{
    while (true)
    {
        set_led(1);
        delay(500);
        set_led(0);
        delay(500);
    }
}
