import type { ComponentsTheme, Theme } from "../theme";
type AnyProps = Record<string, any>;
/**
 * Fusiona props de izquierda a derecha (las de la derecha ganan). Las props de estilo anidadas
 * (_text, _icon, _pressed...) se fusionan en vez de reemplazarse: un `_text: { color }` del tema y un
 * `_text: { fontSize }` de las props se aplican los dos. Los undefined no pisan valores anteriores.
 */
export declare const mergeProps: <P extends AnyProps>(...sources: (Partial<P> | null | undefined | false)[]) => P;
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
export declare const useThemeProps: <P extends AnyProps>(name: keyof ComponentsTheme, props: P, options?: ThemePropsOptions<P>) => [P, Theme];
export {};
