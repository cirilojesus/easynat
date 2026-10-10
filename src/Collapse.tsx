import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    type SharedValue,
} from 'react-native-reanimated';

import { Box, EABoxProps } from './Box';
import { EAButtonProps } from './Button';
import { Icon } from './Icon';
import { mergeProps, useThemeProps } from './utils/useThemeProps';

/* ----------------------- TYPES ------------------------- */

export type CollapseHandle = {
    open: () => void;
    close: () => void;
    toggle: () => void;
    isOpen: () => boolean;
};

/** Lo que recibe la función `trigger`: props listas para un Button (estilo, icono, accesibilidad) */
export type CollapseTriggerProps = Omit<EAButtonProps, 'onPress'> & {
    isOpen: boolean;
    onPress: (e?: any) => void;
};

export type CollapseProps = EABoxProps & {
    /** El trigger: normalmente un <Button {...props}>Título</Button> */
    trigger: (props: CollapseTriggerProps) => React.ReactNode;
    /** Empieza abierto (sin animación) */
    defaultOpen?: boolean;
    /** Controlado: abierto o cerrado según esta prop (usa onChange para cambiarla) */
    isOpen?: boolean;
    /** Se llama al pedir abrir o cerrar (por el trigger o por ref) */
    onChange?: (isOpen: boolean) => void;
    /** Se llama cuando termina de abrirse */
    onOpen?: () => void;
    /** Se llama cuando termina de cerrarse */
    onClose?: () => void;
    /** Duración de la animación en ms (por defecto 250) */
    duration?: number;
    /** No monta el contenido hasta la primera vez que se abre (para contenido pesado) */
    lazy?: boolean;
    /** El trigger no responde */
    disabled?: boolean;
    /** Icono del trigger (gira al abrir). false para quitarlo */
    icon?: React.ReactElement | false;
    _contentStyle?: EABoxProps;
    /** Props del trigger */
    _trigger?: EAButtonProps;
    /** Props del trigger cuando está abierto (se fusionan con _trigger) */
    _open?: EAButtonProps;
};

/**
 * Icono que gira con `progress`. El giro va en un Animated.View (vista nativa): animar el Icon directamente
 * no se aplica bien (no es una vista nativa) y el giro llegaba tarde. Recibe el color y tamaño que le da el
 * Button (cloneElement de iconRight) y se los pasa al icono.
 */
const RotatingIcon = ({ progress, icon, ...iconProps }: { progress: SharedValue<number>; icon?: React.ReactElement<any> } & Record<string, any>) => {
    const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${progress.value * 180}deg` }] }));
    return (
        <Animated.View style={style}>
            {icon ? React.cloneElement(icon, { ...iconProps, ...icon.props }) : <Icon as="Feather" name="chevron-down" {...iconProps} />}
        </Animated.View>
    );
};

const TRIGGER_DEFAULTS: EAButtonProps = {
    p: 2.5,
    borderWidth: 1,
    borderColor: 'light.100',
    rounded: 1,
    flexDir: 'row',
    justifyContent: 'space-between',
};

/* ---------------- INTERNAL COMPONENT ------------------- */

function InternalCollapse(
    rawProps: CollapseProps,
    ref: React.Ref<CollapseHandle>
) {
    // Defaults → theme.components.Collapse → variante → props → plataforma (el variant no pasa al Box)
    const [{
        trigger, defaultOpen, isOpen: controlledOpen, onChange, onOpen, onClose, duration = 250, lazy, disabled, icon,
        variant: _variant, _trigger, _open, _contentStyle, children, ...props
    }] = useThemeProps<CollapseProps>('Collapse', rawProps);

    // El estado vive en React (el trigger recibe isOpen al momento); la animación solo lo sigue
    const controlled = controlledOpen !== undefined;
    const [innerOpen, setInnerOpen] = useState(!!defaultOpen);
    const open = controlled ? !!controlledOpen : innerOpen;
    // lazy: el contenido se monta la primera vez que se abre y luego se queda montado
    const [mounted, setMounted] = useState(!lazy || open);

    // Un solo valor (0 cerrado → 1 abierto) para la altura y el giro del icono: van sincronizados
    const progress = useSharedValue(open ? 1 : 0);
    const contentHeight = useSharedValue(0);

    const callbacks = useRef({ onChange, onOpen, onClose });
    callbacks.current = { onChange, onOpen, onClose };
    const openRef = useRef(open);
    openRef.current = open;

    const first = useRef(true);
    useEffect(() => {
        if (open) setMounted(true);
        // La primera vez (defaultOpen o isOpen inicial) no se anima ni se avisa
        if (first.current) { first.current = false; return; }
        progress.value = withTiming(open ? 1 : 0, { duration });
        // Se avisa al terminar, desde JS (sin pasar por el hilo de UI)
        const timer = setTimeout(() => (open ? callbacks.current.onOpen : callbacks.current.onClose)?.(), duration);
        return () => clearTimeout(timer);
    }, [open]);

    const setOpen = (next: boolean) => {
        if (next === openRef.current) return;
        if (!controlled) setInnerOpen(next);
        callbacks.current.onChange?.(next);
    };

    useImperativeHandle(ref, () => ({
        open: () => setOpen(true),
        close: () => setOpen(false),
        toggle: () => setOpen(!openRef.current),
        isOpen: () => openRef.current,
    }), [controlled]);

    const bodyStyle = useAnimatedStyle(() => ({
        height: progress.value * contentHeight.value,
        overflow: 'hidden',
    }));

    const triggerProps = mergeProps<EAButtonProps>(TRIGGER_DEFAULTS, _trigger, open && _open);

    return (
        <Box {...props}>
            {trigger({
                ...triggerProps,
                isOpen: open,
                disabled,
                accessibilityRole: 'button',
                accessibilityState: { expanded: open, disabled: !!disabled },
                iconRight: icon === false ? undefined : <RotatingIcon progress={progress} icon={icon || undefined} />,
                onPress: () => !disabled && setOpen(!openRef.current),
            })}

            {/* La altura se anima entre 0 y la del contenido, que se mide en posición absoluta */}
            {/* Animated.View (vista nativa) para que Reanimated anime la altura sin pasar por React */}
            <Animated.View style={bodyStyle}>
                <Box
                    onLayout={e => (contentHeight.value = e.nativeEvent.layout.height)}
                    position="absolute"
                    w="100%"
                    {..._contentStyle}
                >
                    {mounted ? children : null}
                </Box>
            </Animated.View>
        </Box>
    );
}

/* ----------------- FIX AUTOCOMPLETADO ------------------ */

export type CollapseComponent = (
    props: CollapseProps & { ref?: React.Ref<CollapseHandle> }
) => React.ReactElement | null;

/**
 * forwardRef pierde los tipos al compilar.
 * Aquí los restauramos para que funcione el autocompletado
 * en el proyecto donde usas la librería.
 */
export const Collapse = forwardRef(InternalCollapse) as unknown as CollapseComponent;
