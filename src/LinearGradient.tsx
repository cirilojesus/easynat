import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, SvgProps, RectProps } from "react-native-svg";
import { useTheme } from "./theme-provider";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { Theme } from "./theme";
import { Platform } from "react-native";

export type GradientColor = {
    color: keyof Theme["colors"];
    offset?: number;      // 0–100
    opacity?: number;     // 0–1
};

export type BSLinearGradientProps = SvgProps & BSDefaultProps & {
    colors: GradientColor[];
    angle?: number;
    type?: "linear" | "radial";
    _rect?: RectProps;
    _ios?: BSLinearGradientProps;
    _android?: BSLinearGradientProps;
    _web?: BSLinearGradientProps;
}

export const BSLinearGradient: React.FC<BSLinearGradientProps> = ({
    type = "linear",
    ...props
}) => {
    const { theme } = useTheme();
    const combinedProps: BSLinearGradientProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

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
            offset={`${c.offset ?? (i / (combinedProps.colors.length - 1)) * 100}%`}
            stopColor={theme.colors[c.color] || c.color}
            stopOpacity={c.opacity ?? 1}
        />
    );

    return (
        <Svg {...combinedProps} style={[combinedProps.style, ...svgStyle]}>
            <Defs>
                {type === "radial" ? (
                    <RadialGradient id="grad" cx="50%" cy="50%" r="50%">
                        {stops}
                    </RadialGradient>
                ) : (
                    <LinearGradient id="grad" {...coords}>
                        {stops}
                    </LinearGradient>
                )}
            </Defs>
            <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#grad)"
                {...combinedProps._rect}
            />
        </Svg>
    );
};
