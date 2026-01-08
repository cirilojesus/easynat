import { DimensionValue } from "react-native"
import { ThemeType } from "../theme-provider"
import { BSTextProps, Text } from "../Text"
import React from "react"

export const calcSize = (size: DimensionValue) => {
    const sizes = [1, 2, 3, 4, 5, 6]
    if (typeof size == "number" && sizes.includes(size)) return size * 4
    return size
}

export const mergeTheme = (libTheme, theme): ThemeType => {
    const merge = { ...libTheme, ...theme };

    Object.keys(merge).forEach(key => {
        const libValue = libTheme?.[key];
        const themeValue = theme?.[key];

        if (isPlainObject(libValue) && isPlainObject(themeValue)) {
            merge[key] = {
                ...libValue,
                ...themeValue,
            };
        }
    });

    return merge;
}

const isPlainObject = (v: any) =>
    typeof v === 'object' &&
    v !== null &&
    !Array.isArray(v);

export const renderChild = (children: React.ReactNode, props: BSTextProps) => React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === 'number') return <Text {...props}>{child}</Text>;
    return child;
})

export function getDeviceLanguage(): string {
    return Intl.DateTimeFormat().resolvedOptions().locale.split(/[-_]/)[0];
}

export function getDeviceLocaleInfo(
    options: Intl.DateTimeFormatOptions = {}
) {
    const formatter = new Intl.DateTimeFormat(undefined, options);
    return formatter.resolvedOptions()
}
