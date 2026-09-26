package com.ltuga.zeitkonto;

public final class BackPressPolicyTest {
    private static void expect(boolean actual, boolean expected) {
        if (actual != expected) throw new AssertionError("Unexpected Back action");
    }
    public static void main(String[] args) {
        BackPressPolicy policy = new BackPressPolicy();
        expect(policy.shouldExit(0), false);
        expect(policy.shouldExit(1000), true);
        expect(policy.shouldExit(2000), false); // Exit clears the previous pair.
        expect(policy.shouldExit(4001), false); // Expired; starts a new pair.
        expect(policy.shouldExit(6001), true); // Inclusive 2-second boundary.
        expect(policy.shouldExit(7000), false);
        policy.reset(); // Tab/overlay consumed Back, or app was backgrounded.
        expect(policy.shouldExit(7100), false);
        expect(policy.shouldExit(7200), true);
        expect(policy.shouldExit(8000), false);
        expect(policy.shouldExit(7999), false); // Never exit for a backwards clock.
        System.out.println("PASS: 10 double-Back and reset cases");
    }
}
