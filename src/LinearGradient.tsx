import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, SvgProps, RectProps } from "react-native-svg";
import { EADefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { ThemeColor } from "./theme";
import { useThemeProps } from "./utils/useThemeProps";
import React, { useRef } from "react";

let gradientId = 0;

export type GradientColor = {
    color: ThemeColor;
    offset?: number;      // 0–100
    opacity?: number;     // 0–1
};

export type EALinearGradientProps = SvgProps & EADefaultProps & {
    colors: GradientColor[];
    angle?: number;
    type?: "linear" | "radial";
    _rect?: RectProps;
    _ios?: EALinearGradientProps;
    _android?: EALinearGradientProps;
    _web?: EALinearGradientProps;
    variant?: (string & {});
}

export const EALinearGradient: React.FC<EALinearGradientProps> = (props) => {
    const id = useRef(`grad-${gradientId++}`).current;
    // Defaults → theme.components.LinearGradient → variante → props → plataforma
    const [{ type = "linear", variant: _variant, ...combinedProps }, theme] = useThemeProps<EALinearGradientProps>('LinearGradient', props);

    const svgStyle = DEFAULT_PROPS(combinedProps, theme);

    const coords = (() => {
        if (!combinedProps.angle) return { x1: 0, y1: 0, x2: 1, y2: 0 };
        const r = ((combinedProps.angle % 360) * Math.PI) / 180;
        return {
            x1: 0.5 - Math.cos(r) / 2,
            y1: 0.5 - Math.sin(r) / 2,
            x2: 0.5 + Math.cos(r) / 2,
            y2: 0.5 + Math.sin(r) / 2,
        };
    })();

    const stops = combinedProps.colors.map((c, i) =>
        <Stop
            key={i}
            offset={`${c.offset ?? (combinedProps.colors.length > 1 ? (i / (combinedProps.colors.length - 1)) * 100 : 0)}%`}
            stopColor={theme.colors[c.color] || c.color}
            stopOpacity={c.opacity ?? 1}
        />
    );

    return (
        <Svg {...combinedProps} style={[combinedProps.style, ...svgStyle]}>
            <Defs>
                {type === "radial" ? (
                    <RadialGradient id={id} cx="50%" cy="50%" r="50%">
                        {stops}
                    </RadialGradient>
                ) : (
                    <LinearGradient id={id} {...coords}>
                        {stops}
                    </LinearGradient>
                )}
            </Defs>
            <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill={`url(#${id})`}
                {...combinedProps._rect}
            />
        </Svg>
    );
};
