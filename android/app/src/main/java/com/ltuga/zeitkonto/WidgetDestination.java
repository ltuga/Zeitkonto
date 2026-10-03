package com.ltuga.zeitkonto;

/** Native widget destinations; no remote URL is required. */
public final class WidgetDestination {
    public static final String ACTION = "com.ltuga.zeitkonto.OPEN_WIDGET";
    public static final String EXTRA = "widget_destination";
    public static final String RECORD = "record";
    public static final String CALENDAR = "calendar";
    public static final String BALANCES = "balances";
    public static String destination(String value) {
        if (CALENDAR.equals(value)) return CALENDAR;
        if (BALANCES.equals(value)) return BALANCES;
        return RECORD;
    }
    private WidgetDestination() {}
}
