import { DimensionValue } from "react-native"
import { ThemeType } from "../theme-provider"
import { BSTextProps, Text } from "../Text"
import React from "react"
import { BSTextInputProps } from "../Input"

export const calcSize = (size: DimensionValue) => {
    const sizes = [1, 2, 3, 4, 5, 6]
    if (typeof size == "number" && sizes.includes(size)) return size * 4
    return size
}

export const mergeTheme = (libTheme, theme): ThemeType => {
    const merge = { ...theme, ...libTheme }
    Object.keys(merge).map(x => {
        Object.keys(libTheme[x]).map(y => {
            merge[x][y] = { ...merge[x][y], ...theme[x][y] }
        })
        Object.keys(theme[x]).map(y => {
            merge[x][y] = { ...merge[x][y], ...theme[x][y] }
        })
    })
    return merge
}

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
