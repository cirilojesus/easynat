import React, { ReactNode, useEffect, useLayoutEffect, useState, useSyncExternalStore } from "react";
import RootSiblings from "react-native-root-siblings";

/**
 * Renderiza `children` por encima de la app (sobre RootSiblings).
 *
 * Sustituye a RootSiblingPortal, que crea el sibling vacío y envía el contenido en una
 * actualización aparte: ambas se aplican de forma asíncrona y, si la actualización llega
 * antes que la creación, root-siblings la descarta y el sibling queda vacío para siempre
 * (el modal "no abre"). Aquí el sibling se crea una sola vez y el contenido llega por un
 * store propio, sin depender del mecanismo de actualización de root-siblings.
 */

type Store = {
    get: () => ReactNode;
    set: (value: ReactNode) => void;
    subscribe: (listener: () => void) => () => void;
};

const createStore = (initial: ReactNode): Store => {
    let value = initial;
    const listeners = new Set<() => void>();
    return {
        get: () => value,
        set: next => {
            value = next;
            listeners.forEach(listener => listener());
        },
        subscribe: listener => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
};

const PortalHost = ({ store }: { store: Store }) => {
    const content = useSyncExternalStore(store.subscribe, store.get);
    return <>{content}</>;
};

/**
 * Renderiza su contenido por encima de toda la app (overlays, tooltips, toasts propios, etc.).
 * Requiere estar dentro de ThemeProvider.
 *
 * El contenido se monta junto a ThemeProvider, no donde se declara el Portal: recibe el tema de
 * la librería, pero NO los contextos de la pantalla (p. ej. useNavigation() o providers propios
 * montados debajo de ThemeProvider).
 *
 * @example
 * // Overlay de carga que bloquea la pantalla mientras se guarda
 * {saving && (
 *     <Portal>
 *         <Box style={StyleSheet.absoluteFill} bg="black.50" justifyContent="center" alignItems="center">
 *             <Spinner size="large" color="white" />
 *         </Box>
 *     </Portal>
 * )}
 */
export const Portal = ({ children }: { children: ReactNode }) => {
    const [store] = useState(() => createStore(children));

    // Tras cada render se publica el contenido actual en el sibling
    useLayoutEffect(() => {
        store.set(children);
    });

    useEffect(() => {
        const sibling = new RootSiblings(<PortalHost store={store} />);
        return () => sibling.destroy();
    }, [store]);

    return null;
};
