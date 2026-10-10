import { DimensionValue } from "react-native"
import { ThemeType } from "../theme-provider"
import { EATextProps, Text } from "../Text"
import React from "react"

export const calcSize = (size: DimensionValue) => {
    const sizes = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6]
    if (typeof size == "number" && sizes.includes(size)) return size * 4
    return size
}

/**
 * Junta el tema de la librería con el tuyo (lo hace el ThemeProvider). Por cada modo, tus colores, sombras y components
 * se mezclan con los de la librería en vez de reemplazarlos. El modo oscuro hereda lo que pongas en `light` (tus colores
 * de marca, fuentes, components…) salvo los colores que tienen versión oscura (semánticos y grises), y encima lo de `dark`
 * @example mergeTheme(libTheme, { light: { colors: { 'primary.100': '#0EA5E9' } } }) // primary también en oscuro
 */
export const mergeTheme = (libTheme: ThemeType, theme?: Partial<ThemeType>): ThemeType => {
    const mergeMode = (base: any, ...customs: any[]) => {
        const out = { ...base };
        for (const custom of customs) {
            if (!custom) continue;
            Object.keys(custom).forEach(key => {
                const v = custom[key];
                const isObject = typeof v == 'object' && v !== null && !Array.isArray(v);
                if (key === 'components' && isObject) {
                    // Por componente y por variante: Box en dark no borra el Box de light (ni sus variantes)
                    const comps = { ...out.components };
                    Object.keys(v).forEach(name => {
                        const prev = comps[name] ?? {}, next = v[name] ?? {};
                        comps[name] = { ...prev, ...next, ...(prev.variants || next.variants ? { variants: { ...prev.variants, ...next.variants } } : {}) };
                    });
                    out.components = comps;
                } else out[key] = isObject ? { ...out[key], ...v } : v;
            });
        }
        return out;
    };
    const lib = libTheme as any;
    // Los colores que el oscuro de la librería redefine: no se heredan de light
    const darkKeys = new Set(Object.keys(lib.dark?.colors ?? {}).filter(k => lib.dark.colors[k] !== lib.light?.colors?.[k]));
    const merge = {} as ThemeType;
    Object.keys({ ...libTheme, ...theme }).forEach(mode => {
        const base = lib[mode] || {};
        const custom = (theme as any)?.[mode];
        if (mode === 'dark') {
            const light = (theme as any)?.light;
            const fromLight = light ? { ...light, colors: Object.fromEntries(Object.entries(light.colors ?? {}).filter(([k]) => !darkKeys.has(k))) } : undefined;
            (merge as any)[mode] = mergeMode(base, fromLight, custom);
        } else (merge as any)[mode] = mergeMode(base, custom);
    });
    return merge;
}

export const renderChild = (children: React.ReactNode, props: EATextProps) => React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === 'number') return <Text {...props}>{child}</Text>;
    return child;
})

/**
 * El idioma del dispositivo, sin la región ('es-MX' → 'es'). Es el idioma inicial de las traducciones
 * @example getDeviceLanguage(); // 'es'
 */
export function getDeviceLanguage(): string {
    return Intl.DateTimeFormat().resolvedOptions().locale.split(/[-_]/)[0];
}

/**
 * La configuración regional del dispositivo según Intl: locale, calendario, sistema de números y zona horaria
 * @example getDeviceLocaleInfo().timeZone; // 'Europe/Madrid'
 */
export function getDeviceLocaleInfo(
    options: Intl.DateTimeFormatOptions = {}
) {
    const formatter = new Intl.DateTimeFormat(undefined, options);
    return formatter.resolvedOptions()
}
