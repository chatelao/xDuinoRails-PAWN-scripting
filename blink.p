#include <console>

native delay(ms);
native setled(id, val);

main() {
    print("Blink script started!\n");
    for (new i = 0; i < 10; i++) {
        setled(0, 1);
        delay(500);
        setled(0, 0);
        setled(1, 1);
        delay(500);
        setled(1, 0);
        setled(2, 1);
        delay(500);
        setled(2, 0);
    }
}
