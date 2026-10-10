import type * as COMPONENTS from './';
export type COLOR_SCHEME = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'white' | 'light' | 'muted' | 'silver' | 'gray' | 'dark' | 'black' | (string & {});
export type VARIANT_BUTTON = "solid" | "outline" | "ghost" | 'link' | 'subtle' | 'unstyled';
/**
 * Los colores por defecto. Cada uno tiene .50 (suave, translúcido), .100 (normal) y .200 (oscuro). Se usan por nombre
 * en las props de color (bg="primary.100") y se cambian en el tema del ThemeProvider
 */
export declare const COLORS_THEME: {
    'primary.50': string;
    'primary.100': string;
    'primary.200': string;
    'secondary.50': string;
    'secondary.100': string;
    'secondary.200': string;
    white: string;
    'white.50': string;
    'white.100': string;
    'white.200': string;
    light: string;
    'light.50': string;
    'light.100': string;
    'light.200': string;
    muted: string;
    'muted.50': string;
    'muted.100': string;
    'muted.200': string;
    silver: string;
    'silver.50': string;
    'silver.100': string;
    'silver.200': string;
    gray: string;
    'gray.50': string;
    'gray.100': string;
    'gray.200': string;
    dark: string;
    'dark.50': string;
    'dark.100': string;
    'dark.200': string;
    black: string;
    'black.50': string;
    'black.100': string;
    'black.200': string;
    'success.50': string;
    'success.100': string;
    'success.200': string;
    'danger.50': string;
    'danger.100': string;
    'danger.200': string;
    'warning.50': string;
    'warning.100': string;
    'warning.200': string;
    'info.50': string;
    'info.100': string;
    'info.200': string;
    background: string;
    surface: string;
    'surface.50': string;
    border: string;
    text: string;
    'text.muted': string;
    'text.subtle': string;
    /** Texto e iconos encima de un color (botones solid, etiquetas): blanco en los dos modos */
    contrast: string;
};
/**
 * Los colores del modo oscuro que cambian respecto al claro: los semánticos y la escala de grises (invertida: "light"
 * sigue siendo el gris suave de fondos y bordes, "dark" el texto fuerte). Los de marca (primary, success…) son los mismos.
 * Se cambian en theme.dark.colors del ThemeProvider
 */
export declare const DARK_COLORS: {
    background: string;
    surface: string;
    'surface.50': string;
    border: string;
    text: string;
    'text.muted': string;
    'text.subtle': string;
    contrast: string;
    light: string;
    'light.50': string;
    'light.100': string;
    'light.200': string;
    muted: string;
    'muted.50': string;
    'muted.100': string;
    'muted.200': string;
    silver: string;
    'silver.50': string;
    'silver.100': string;
    'silver.200': string;
    gray: string;
    'gray.50': string;
    'gray.100': string;
    'gray.200': string;
    dark: string;
    'dark.50': string;
    'dark.100': string;
    'dark.200': string;
};
export type ALL_PROPS = COMPONENTS.EATextProps & COMPONENTS.EATextInputProps & COMPONENTS.EABoxProps & COMPONENTS.EAFlatListProps<any> & COMPONENTS.EAPressableProps & COMPONENTS.EAModalProps & COMPONENTS.EAButtonProps;
export type VARIANTS_TYPE = Record<string, Partial<ALL_PROPS>>;
export type ComponentTheme<P> = Partial<P> & {
    variants?: Record<string, Partial<P>>;
};
/**
 * Props por defecto y variantes de cada componente: theme.components.Button = { rounded: 2, variants: { ... } }.
 * Orden de aplicación: defaults del componente → estas props → variante → tamaño → props → _ios/_android/_web
 */
export type ComponentsTheme = {
    Accordion?: ComponentTheme<COMPONENTS.AccordionProps>;
    Alert?: ComponentTheme<COMPONENTS.EAAlertProps>;
    AsyncList?: ComponentTheme<COMPONENTS.AsyncListProps<any>>;
    Box?: ComponentTheme<COMPONENTS.EABoxProps>;
    Button?: ComponentTheme<COMPONENTS.EAButtonProps>;
    Carousel?: ComponentTheme<COMPONENTS.CarouselType>;
    /** Para todos los tipos (los defaults de cada type van por debajo) */
    Chart?: ComponentTheme<COMPONENTS.ChartProps>;
    CheckBox?: ComponentTheme<COMPONENTS.EACheckBoxProps>;
    Collapse?: ComponentTheme<COMPONENTS.CollapseProps>;
    DatePicker?: ComponentTheme<COMPONENTS.DatePickerType>;
    /** Solo _box (contenedor) y _error (mensaje de error): el resto lo tematiza cada control */
    EAForm?: ComponentTheme<Pick<COMPONENTS.InputFormParams<any>, '_box' | '_error'>>;
    Filter?: ComponentTheme<COMPONENTS.FilterProps>;
    FlatList?: ComponentTheme<COMPONENTS.EAFlatListProps<any>>;
    Icon?: ComponentTheme<COMPONENTS.IconProps<any>>;
    Image?: ComponentTheme<COMPONENTS.EAImageProps>;
    Input?: ComponentTheme<COMPONENTS.EATextInputProps>;
    KeyboardAvoidingView?: ComponentTheme<COMPONENTS.EAKeyboardAvoidingProps>;
    Label?: ComponentTheme<COMPONENTS.LabelType>;
    LinearGradient?: ComponentTheme<COMPONENTS.EALinearGradientProps>;
    Menu?: ComponentTheme<COMPONENTS.EAMenuProps<any>>;
    Modal?: ComponentTheme<COMPONENTS.EAModalProps>;
    Pressable?: ComponentTheme<COMPONENTS.EAPressableProps>;
    ProgressBar?: ComponentTheme<COMPONENTS.EAProgressBarProps>;
    Radio?: ComponentTheme<COMPONENTS.EARadioProps>;
    RenderHTML?: ComponentTheme<COMPONENTS.EARenderHTMLProps>;
    RichTextEditor?: ComponentTheme<COMPONENTS.RichTextEditorProps>;
    ImageViewer?: ComponentTheme<COMPONENTS.ImageViewerProps>;
    ImageEditor?: ComponentTheme<COMPONENTS.ImageEditorProps>;
    PDFViewer?: ComponentTheme<COMPONENTS.PDFViewerProps>;
    ScrollView?: ComponentTheme<COMPONENTS.EAScrollViewProps>;
    SearchInput?: ComponentTheme<COMPONENTS.SearchInputModel<any>>;
    Select?: ComponentTheme<COMPONENTS.EASelectProps>;
    Slider?: ComponentTheme<COMPONENTS.SliderProps>;
    Skeleton?: ComponentTheme<COMPONENTS.SkeletonProps>;
    Spinner?: ComponentTheme<COMPONENTS.EASpinnerProps>;
    Stagger?: ComponentTheme<COMPONENTS.StaggerProps>;
    SpinnerOverlay?: ComponentTheme<COMPONENTS.SpinnerOverlayOptions>;
    HoldButton?: ComponentTheme<COMPONENTS.HoldButtonProps>;
    SlideButton?: ComponentTheme<COMPONENTS.SlideButtonProps>;
    StatusBar?: ComponentTheme<COMPONENTS.EAStatusBarProps>;
    Switch?: ComponentTheme<COMPONENTS.EASwitchProps>;
    Table?: ComponentTheme<COMPONENTS.TableProps<any>>;
    Text?: ComponentTheme<COMPONENTS.EATextProps>;
};
export declare const defaultTheme: {
    colors?: Partial<Record<keyof typeof COLORS_THEME | (string & {}), string>>;
    shadows?: Record<1 | 2 | 3 | 4 | 5 | 6 | string, any>;
    fontFamily?: string;
    fonts?: Record<string, string>;
    components?: ComponentsTheme;
};
/** Un color: el nombre de uno del tema ('primary.100', 'surface', 'text'…; con autocompletado) o cualquier color ('#fff', 'transparent'…) */
export type ThemeColor = keyof typeof COLORS_THEME | (string & {});
/** Una sombra del tema: 1 a 6 (o el nombre de una propia) */
export type ThemeShadow = 1 | 2 | 3 | 4 | 5 | 6 | (string & {}) | (number & {});
export declare const theme: {
    light: typeof defaultTheme;
    dark: typeof defaultTheme;
};
export type Theme = typeof defaultTheme;
