package com.ltuga.zeitkonto;

/** Pure decision logic. No coordinates or location history are persisted. */
public final class GeoEngine {
    public int candidate; // 1 arrival, -1 departure, 0 none
    public long since, lastAction;
    public int sample(boolean enabled, boolean open, double distance, double accuracy,
                      double radius, long now, long arrivalDelay, long exitDelay) {
        if (!enabled || !Double.isFinite(distance) || !Double.isFinite(accuracy) ||
            accuracy < 0 || accuracy > Math.min(75, radius / 2)) { reset(); return 0; }
        int side = distance + accuracy <= radius ? 1 : distance - accuracy >= radius + 25 ? -1 : 0;
        if (side == 0 || (side == 1 && open) || (side == -1 && !open)) { reset(); return 0; }
        if (lastAction > now || now - lastAction < 120000) { reset(); return 0; }
        if (candidate != side || now < since) { candidate = side; since = now; return 0; }
        return now - since >= (side == 1 ? arrivalDelay : exitDelay) ? side : 0;
    }
    public void reset() { candidate = 0; since = 0; }
}
