package com.ltuga.zeitkonto;

import java.net.URI;

/** Main-frame trust boundary. No wildcards or prefix checks. */
public final class NavigationPolicy {
    public static final String HOME = "https://meu-tempo-luis.ltugamatos.chatgpt.site/";
    private static final String HOST = "meu-tempo-luis.ltugamatos.chatgpt.site";
    public static boolean trusted(String value) {
        try {
            URI uri = new URI(value);
            return "https".equalsIgnoreCase(uri.getScheme()) && HOST.equalsIgnoreCase(uri.getHost())
                && uri.getRawUserInfo() == null && (uri.getPort() == -1 || uri.getPort() == 443);
        } catch (Exception ignored) { return false; }
    }
    private NavigationPolicy() {}
}
