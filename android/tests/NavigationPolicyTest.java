package com.ltuga.zeitkonto;

public final class NavigationPolicyTest {
    public static void main(String[] args) {
        String[] allowed = {NavigationPolicy.HOME, NavigationPolicy.HOME + "?view=calendar",
            "https://meu-tempo-luis.ltugamatos.chatgpt.site:443/?auth=recovery"};
        String[] blocked = {null, "", "http://meu-tempo-luis.ltugamatos.chatgpt.site/",
            "https://meu-tempo-luis.ltugamatos.chatgpt.site.evil.test/",
            "https://meu-tempo-luis.ltugamatos.chatgpt.site@evil.test/",
            "https://evil.test@meu-tempo-luis.ltugamatos.chatgpt.site/",
            "https://meu-tempo-luis.ltugamatos.chatgpt.site:8443/",
            "javascript:alert(1)", "file:///data/data/", "content://private/data",
            "intent://host/", "data:text/html,hi", "https://evil.test/",
            "https://meu-tempo-luis.ltugamatos.chatgpt.site\\@evil.test/"};
        for (String value : allowed) if (!NavigationPolicy.trusted(value)) throw new AssertionError("Rejected trusted URL");
        for (String value : blocked) if (NavigationPolicy.trusted(value)) throw new AssertionError("Accepted untrusted URL");
        System.out.println("PASS: " + (allowed.length + blocked.length) + " navigation trust cases");
    }
}
