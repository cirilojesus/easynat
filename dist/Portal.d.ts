import { ReactNode } from "react";
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
export declare const Portal: ({ children }: {
    children: ReactNode;
}) => any;
