/* LED Blink script for Seeed RP2040 */

native set_led(status);
native delay(ms);
native actual_speed();

main()
{
    while (true)
    {
        set_led(1);
        delay(actual_speed() * 10); // Use actual_speed (returns 42) -> 420ms delay
        set_led(0);
        delay(500);
    }
}
