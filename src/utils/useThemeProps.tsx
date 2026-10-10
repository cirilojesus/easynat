import React from "react";
import { Platform } from "react-native";
import { useTheme } from "../theme-provider";
import type { ComponentsTheme, Theme } from "../theme";

type AnyProps = Record<string, any>;

const isPlainObject = (v: unknown): v is AnyProps =>
    !!v && typeof v === "object" && !Array.isArray(v) && !React.isValidElement(v)
    && Object.getPrototypeOf(v) === Object.prototype;

/**
 * Fusiona props de izquierda a derecha (las de la derecha ganan). Las props de estilo anidadas
 * (_text, _icon, _pressed...) se fusionan en vez de reemplazarse: un `_text: { color }` del tema y un
 * `_text: { fontSize }` de las props se aplican los dos. Los undefined no pisan valores anteriores.
 */
export const mergeProps = <P extends AnyProps>(...sources: (Partial<P> | null | undefined | false)[]): P =>
    mergeWith<P>(undefined, sources);

const mergeWith = <P extends AnyProps>(mergeKeys: readonly string[] | undefined, sources: (Partial<P> | null | undefined | false)[]): P => {
    const result: AnyProps = {};
    for (const source of sources) {
        if (!source) continue;
        for (const key in source) {
            const value = source[key];
            if (value === undefined) continue;
            const prev = result[key];
            result[key] = (key[0] === "_" || mergeKeys?.includes(key)) && isPlainObject(value) && isPlainObject(prev)
                ? mergeProps(prev, value)
                : value;
        }
    }
    return result as P;
};

export type ThemePropsOptions<P> = {
    /** Props por defecto del propio componente (las del tema las pisan) */
    defaults?: Partial<P>;
    /**
     * Variantes propias del componente (las del tema con el mismo nombre se fusionan encima). Puede ser
     * una función si dependen del tema o de las props (p. ej. del colorScheme en Button)
     */
    variants?: Record<string, Partial<P>> | ((theme: Theme, props: P) => Record<string, Partial<P>>);
    /** Tamaños propios del componente, según props.size (o el size por defecto) */
    sizes?: Record<string, Partial<P>>;
    /** Props objeto que también se fusionan aunque no empiecen por _ (p. ej. header del Modal) */
    mergeKeys?: readonly string[];
};

/**
 * Props finales de un componente según el tema, en este orden (cada uno pisa al anterior):
 * defaults del componente → theme.components[name] → variante (del componente + del tema, según
 * props.variant o el variant por defecto; varias separadas por espacios, en orden) → tamaño → props → _ios / _android / _web de la plataforma.
 *
 * Devuelve [props, theme]: así el componente lee el contexto del tema una sola vez.
 * @example const [{ variant, ...rest }, theme] = useThemeProps('Box', props, { variants: BOX_VARIANTS });
 */
export const useThemeProps = <P extends AnyProps>(name: keyof ComponentsTheme, props: P, options?: ThemePropsOptions<P>): [P, Theme] => {
    const { theme } = useTheme();
    const { variants: themeVariants, ...themeDefaults } = (theme?.components?.[name] ?? {}) as AnyProps;
    const keys = options?.mergeKeys;
    const base = mergeWith<AnyProps>(keys, [options?.defaults, themeDefaults]);
    const variant = props.variant ?? base.variant;
    const size = props.size ?? base.size;
    const libVariants = typeof options?.variants === 'function'
        ? options.variants(theme, mergeWith<P>(keys, [base as Partial<P>, props]))
        : options?.variants;
    // Varias variantes separadas por espacios se aplican en orden: variant="card row"
    const names: string[] = typeof variant === 'string' ? variant.split(/\s+/).filter(Boolean) : variant != null ? [variant] : [];
    const merged = mergeWith<AnyProps>(keys, [
        base,
        ...names.flatMap(n => [libVariants?.[n], themeVariants?.[n]]),
        size != null && options?.sizes?.[size],
        props,
    ]);
    const platform = merged[`_${Platform.OS}`];
    return [(platform ? mergeWith(keys, [merged, platform]) : merged) as P, theme];
};
