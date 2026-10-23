package com.pragatinursery.common.enums;

public enum CareIcon {
    SUN,
    WATER,
    SOIL;

    public static CareIcon fromString(String value) {
        if (value == null) return SUN;
        switch (value.toLowerCase()) {
            case "water": return WATER;
            case "soil": return SOIL;
            default: return SUN;
        }
    }
}
