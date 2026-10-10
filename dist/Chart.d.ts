import React from "react";
import { EABoxProps } from "./Box";
import { EATextProps } from "./Text";
import { ThemeColor } from "./theme";
export type ChartColor = ThemeColor | (string & {});
/** Un punto de una serie simple: número o { label, value, color } */
export type ChartDatum = number | null | {
    label?: string;
    value: number | null;
    color?: ChartColor;
};
export type ChartSeries = {
    name?: string;
    data: (number | null)[];
    color?: ChartColor;
};
/** Lo que se selecciona al tocar un gráfico de ejes (líneas, áreas y barras) */
export type ChartSelection = {
    index: number;
    label?: string;
    values: {
        name?: string;
        value: number | null;
        color: string;
    }[];
};
export type ChartBaseProps = Omit<EABoxProps, 'children'> & {
    /** Ancho en px. Por defecto, el del contenedor */
    width?: number;
    /** Alto en px del área del gráfico (sin leyenda) */
    height?: number;
    /** Alto según el ancho (ancho / alto), en lugar de height: se adapta a cualquier pantalla */
    aspectRatio?: number;
    /** Paleta para las series o porciones sin color propio (claves del tema o colores) */
    colors?: ChartColor[];
    /** Animación al aparecer y al cambiar los datos. Por defecto true */
    animate?: boolean;
    /** Duración de la animación en ms. Por defecto 600 */
    duration?: number;
    /** Leyenda (por defecto, con varias series y en pie / donut) */
    legend?: boolean;
    /** Leyenda arriba o abajo. Por defecto abajo */
    legendPosition?: 'top' | 'bottom';
    /** Indicador de carga en lugar del gráfico (mientras llegan los datos) */
    loading?: boolean;
    /** Formato de los valores (tooltip, etiquetas, leyenda) */
    formatValue?: (value: number) => string;
    /** Texto sin datos. Por defecto "Sin datos" / "No data" */
    emptyText?: string;
    _legend?: EABoxProps;
    _legendText?: EATextProps;
    _tooltip?: EABoxProps;
    _tooltipText?: EATextProps;
    _emptyText?: EATextProps;
    variant?: (string & {});
};
/** Para los ejes: 1500 → "1,5k", 2300000 → "2,3M" */
export declare const compactNumber: (value: number) => string;
export type ChartCurve = 'linear' | 'monotone' | 'step';
/** Línea de referencia (objetivo, media, límite...) en un valor del eje de valores */
export type ChartReferenceLine = {
    value: number;
    label?: string;
    color?: ChartColor;
    dashed?: boolean;
    strokeWidth?: number;
};
/** Índices visibles con zoom (null = todo) */
export type ChartZoomRange = {
    start: number;
    end: number;
};
export type CartesianChartProps = ChartBaseProps & {
    /** Una serie: números o { label, value, color } */
    data?: ChartDatum[];
    /** Varias series: [{ name, data, color }] (con labels para el eje X) */
    series?: ChartSeries[];
    /** Etiquetas del eje de categorías */
    labels?: string[];
    yMin?: number;
    yMax?: number;
    /** Número aproximado de marcas en el eje de valores. Por defecto 5 */
    yTicks?: number;
    showGrid?: boolean;
    showXAxis?: boolean;
    showYAxis?: boolean;
    /** Valor encima de cada punto o barra */
    showValues?: boolean;
    /** Formato de las marcas del eje de valores. Por defecto compacto (1,5k) o formatValue si se pasa */
    formatYLabel?: (value: number) => string;
    /** Formato de las etiquetas del eje de categorías */
    formatLabel?: (label: string, index: number) => string;
    /** Tooltip al tocar. Por defecto true */
    tooltip?: boolean;
    renderTooltip?: (selection: ChartSelection) => React.ReactNode;
    /** Al tocar un punto o barra (null al quitar la selección) */
    onSelect?: (selection: ChartSelection | null) => void;
    /** Líneas de referencia: objetivo, media, límite... */
    referenceLines?: ChartReferenceLine[];
    /**
     * Zoom con dos dedos en el eje de categorías; con zoom, arrastrar con un dedo desplaza y un doble toque
     * lo quita. El eje de valores se ajusta a lo visible. No aplica a las barras horizontales
     */
    zoomable?: boolean;
    /** Zoom máximo (veces). Por defecto 10 */
    maxZoom?: number;
    /** Muestra solo los últimos N puntos (se desplaza para ver el resto). Útil con series largas */
    visiblePoints?: number;
    /** Al cambiar el zoom: los índices visibles (null = todo) */
    onZoomChange?: (range: ChartZoomRange | null) => void;
    _grid?: {
        stroke?: ChartColor;
        strokeWidth?: number;
        strokeDasharray?: string;
    };
    _axisLabel?: {
        fill?: ChartColor;
        fontSize?: number;
    };
    _valueLabel?: {
        fill?: ChartColor;
        fontSize?: number;
        fontWeight?: string;
    };
};
export type LineChartProps = CartesianChartProps & {
    /** linear, monotone (suave) o step (escalones). Por defecto linear */
    curve?: ChartCurve;
    strokeWidth?: number;
    /** Un punto en cada valor. Por defecto, si se ven 20 o menos */
    dots?: boolean;
    dotSize?: number;
    /** Rellena el área bajo la línea */
    area?: boolean;
    /** El relleno del área en degradado (si no, color plano). Por defecto true */
    gradient?: boolean;
    fillOpacity?: number;
};
export type BarChartProps = CartesianChartProps & {
    /** Barras horizontales */
    horizontal?: boolean;
    /** Series apiladas (si no, agrupadas) */
    stacked?: boolean;
    barRadius?: number;
    /** Hueco entre categorías, de 0 a 1 del ancho de cada una. Por defecto 0.3 */
    barGap?: number;
};
export type PieDatum = number | {
    label?: string;
    value: number;
    color?: ChartColor;
};
export type PieSelection = {
    index: number;
    label?: string;
    value: number;
    percent: number;
    color: string;
};
export type PieChartProps = ChartBaseProps & {
    data: PieDatum[];
    labels?: string[];
    /** Diámetro en px. Por defecto 200 (o el ancho disponible si es menor) */
    size?: number;
    /** Hueco central, de 0 a 0.95 del radio (0 = tarta). En type="donut", 0.62 */
    innerRadius?: number;
    /** Separación entre porciones, en grados */
    padAngle?: number;
    /** Ángulo de inicio en grados (0 = arriba, en sentido horario) */
    startAngle?: number;
    /** Texto sobre cada porción: el porcentaje o el valor */
    showValues?: boolean | 'percent' | 'value';
    /** Qué se muestra en la leyenda junto a cada etiqueta. Por defecto el porcentaje */
    legendValue?: 'percent' | 'value' | 'none';
    /** Centro del donut: por defecto el total (o lo seleccionado). false lo oculta */
    centerLabel?: React.ReactNode | false | ((info: {
        total: number;
        selected: PieSelection | null;
    }) => React.ReactNode);
    /** Tooltip al tocar una porción. Por defecto en pie sí y en donut no (lo muestra el centro) */
    tooltip?: boolean;
    renderTooltip?: (selection: PieSelection) => React.ReactNode;
    onSelect?: (selection: PieSelection | null) => void;
    /** Cuánto sale la porción seleccionada, en px. Por defecto 6 */
    selectedOffset?: number;
    /** Junta en una porción "Otros" las que no lleguen a este porcentaje (p. ej. 5) */
    groupSmall?: number;
    /** Nombre de la porción que junta las pequeñas. Por defecto "Otros" / "Others" */
    othersLabel?: string;
    formatPercent?: (percent: number) => string;
    _valueLabel?: {
        fill?: ChartColor;
        fontSize?: number;
        fontWeight?: string;
    };
    _centerValue?: EATextProps;
    _centerLabel?: EATextProps;
};
export type ProgressRingProps = Omit<EABoxProps, 'children'> & {
    value: number;
    /** Por defecto 100 */
    max?: number;
    /** Diámetro en px. Por defecto 120 */
    size?: number;
    /** Grosor del aro. Por defecto 12 */
    thickness?: number;
    color?: ChartColor;
    trackColor?: ChartColor;
    /** Medio círculo (indicador tipo velocímetro) */
    half?: boolean;
    animate?: boolean;
    duration?: number;
    /** El porcentaje en el centro. Por defecto true */
    showValue?: boolean;
    formatValue?: (value: number, percent: number) => string;
    /** Texto pequeño bajo el valor */
    label?: string;
    /** Contenido propio en el centro (en lugar del valor) */
    children?: React.ReactNode;
    _value?: EATextProps;
    _label?: EATextProps;
    variant?: (string & {});
};
export type ChartType = 'line' | 'area' | 'sparkline' | 'bar' | 'column' | 'horizontalBar' | 'pie' | 'donut' | 'progress';
export type ChartProps = ({
    type: 'line' | 'area' | 'sparkline';
} & LineChartProps) | ({
    type: 'bar' | 'column' | 'horizontalBar';
} & BarChartProps) | ({
    type: 'pie' | 'donut';
} & PieChartProps) | ({
    type: 'progress';
} & ProgressRingProps);
/**
 * Gráficos: type = line (evolución), area (tendencia con relleno), sparkline (mínimo, para tarjetas),
 * bar / column (categorías; bar con horizontal), horizontalBar, pie (porcentajes), donut o progress (aro de progreso).
 * @example <Chart type="line" data={[10, 40, 25]} labels={['Ene', 'Feb', 'Mar']} />
 * @example <Chart type="column" series={[{ name: 'Online', data: [4, 6] }, { name: 'Tienda', data: [7, 5] }]} labels={['2024', '2025']} stacked />
 * @example <Chart type="donut" data={[{ label: 'Casa', value: 900 }, { label: 'Ocio', value: 210 }]} />
 * @example <Chart type="progress" value={65} label="Completado" />
 */
export declare const Chart: React.FC<ChartProps>;
