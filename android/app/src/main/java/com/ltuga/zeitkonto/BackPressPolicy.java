package com.ltuga.zeitkonto;

/** Monotonic timestamps, no account data and no persistence across backgrounding. */
final class BackPressPolicy {
    private long firstPress = -1;
    boolean shouldExit(long now) {
        if (firstPress >= 0 && now >= firstPress && now - firstPress <= 2000) {
            reset();
            return true;
        }
        firstPress = now;
        return false;
    }
    void reset() { firstPress = -1; }
}
