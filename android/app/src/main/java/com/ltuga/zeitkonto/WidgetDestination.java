package com.ltuga.zeitkonto;

/** Only navigation, never account data, URLs supplied by callers or clock mutations. */
public final class WidgetDestination {
    public static final String ACTION = "com.ltuga.zeitkonto.OPEN_WIDGET";
    public static final String EXTRA = "widget_destination";
    public static String url(String destination) {
        if ("calendar".equals(destination)) return NavigationPolicy.HOME + "?view=calendar";
        if ("balances".equals(destination)) return NavigationPolicy.HOME + "?view=balances";
        return NavigationPolicy.HOME;
    }
    private WidgetDestination() {}
}
