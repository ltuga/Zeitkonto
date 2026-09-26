package com.ltuga.zeitkonto;
public final class WidgetDestinationTest {
    public static void main(String[] args) {
        if (!WidgetDestination.url("calendar").equals(NavigationPolicy.HOME + "?view=calendar")) throw new AssertionError();
        if (!WidgetDestination.url("balances").equals(NavigationPolicy.HOME + "?view=balances")) throw new AssertionError();
        for (String input : new String[] {"today", null, "", "admin", "https://evil.test/", "javascript:alert(1)", "calendar&delete=1"}) {
            if (!WidgetDestination.url(input).equals(NavigationPolicy.HOME)) throw new AssertionError();
        }
        System.out.println("PASS: 9 widget destination cases");
    }
}
