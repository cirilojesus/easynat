import { EABoxProps } from "./Box";
import { COLOR_SCHEME } from "./theme";
export type EAAlertProps = EABoxProps & {
    colorScheme?: COLOR_SCHEME;
};
/**
 * Muestra un aviso arriba de la pantalla desde cualquier parte (también fuera de los componentes). Baja animado y se
 * cierra solo a los `duration` ms o al tocarlo. Si ya hay uno, lo sustituye
 * @example showAlert('Guardado', 'success');
 * showAlert('Sin conexión', 'danger', { _text: { fontWeight: '700' } }, 5000);
 */
export declare const showAlert: (message: string, colorScheme: COLOR_SCHEME, props?: EABoxProps, duration?: number) => void;
/** Cierra el aviso que se esté mostrando (con su animación) */
export declare const hideAlert: () => void;
