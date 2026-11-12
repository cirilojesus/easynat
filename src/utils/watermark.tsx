// Marca de agua en una imagen: devuelve una imagen nueva con el texto grabado. Es una función (no hay que montar
// nada): crea un WebView invisible, dibuja en un canvas y lo quita al terminar. Necesita react-native-webview
import React from "react";
import { View } from "react-native";
import RootSiblings from "react-native-root-siblings";
import { jsValue, loadWebView, toDataUri, WebViewHandle, WebViewMessageEvent } from "./webview";

export type WatermarkPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center' | 'tile';

export type WatermarkOptions = {
    /** Texto de la marca. Varias líneas con un array o con "\n" */
    text: string | string[];
    /** Añade una línea con la fecha y hora actuales (toLocaleString). Por defecto false */
    date?: boolean;
    /** Dónde va: una esquina, el centro, o 'tile' (repetida en diagonal por toda la imagen). Por defecto 'bottom-right' */
    position?: WatermarkPosition;
    /** Tamaño del texto en px de la imagen. Por defecto el 3,5% del lado menor (se ve igual en fotos grandes y pequeñas) */
    fontSize?: number;
    /** Color del texto (cualquier color CSS, con transparencia: '#000000b3', 'rgba(255,255,255,0.6)'). Por defecto '#000000b3' */
    color?: string;
    /** Fondo detrás del texto (null: sin fondo). Por defecto '#dddddd77'. En 'tile' no se usa */
    background?: string | null;
    /** Negrita. Por defecto false */
    bold?: boolean;
    /** Separación con los bordes de la imagen y relleno del fondo, en px. Por defecto la mitad de fontSize */
    margin?: number;
    /** Giro en grados del mosaico ('tile'). Por defecto -30 */
    angle?: number;
    /** Lado mayor máximo de la imagen resultante en px (las fotos de cámara pesan mucho). Por defecto sin cambiar */
    maxSize?: number;
    /** 'jpeg' (por defecto) o 'png' */
    format?: 'jpeg' | 'png';
    /** Calidad del jpeg, de 0 a 1. Por defecto 0.9 */
    quality?: number;
    /** Cabeceras para descargar la imagen si es https (p. ej. Authorization) */
    headers?: Record<string, string>;
    /** Tiempo máximo en ms. Por defecto 30000 */
    timeout?: number;
};

export type WatermarkResult = {
    /** data:image/...;base64,... */
    dataUri: string;
    /** Solo el base64 (sin el "data:...;base64,") */
    base64: string;
    mimeType: 'image/jpeg' | 'image/png';
    width: number;
    height: number;
};

// Página del WebView: espera la configuración y dibuja la imagen con la marca en un canvas
const HTML = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width"></head><body><script>
(function () {
  var post = function (m) { window.ReactNativeWebView.postMessage(JSON.stringify(m)); };
  window.__wm = function (cfg) {
    var img = new Image();
    img.onerror = function () { post({ type: 'error', message: 'No se pudo leer la imagen' }); };
    img.onload = function () {
      try {
        var w = img.naturalWidth, h = img.naturalHeight;
        if (cfg.maxSize && Math.max(w, h) > cfg.maxSize) { var k = cfg.maxSize / Math.max(w, h); w = Math.round(w * k); h = Math.round(h * k); }
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        var lines = cfg.lines;
        var size = cfg.fontSize || Math.max(10, Math.round(Math.min(w, h) * 0.035));
        var font = function (s) { return (cfg.bold ? 'bold ' : '') + s + 'px sans-serif'; };
        ctx.font = font(size);
        var widest = function () { return Math.max.apply(null, lines.map(function (l) { return ctx.measureText(l).width; })); };
        // Si no cabe a lo ancho (90% de la imagen), se reduce
        var tw = widest();
        if (cfg.position !== 'tile' && tw > w * 0.9) { size = Math.max(8, Math.floor(size * w * 0.9 / tw)); ctx.font = font(size); tw = widest(); }
        var lh = Math.round(size * 1.25);
        var m = cfg.margin != null ? cfg.margin : Math.round(size / 2);
        ctx.textBaseline = 'top';
        if (cfg.position === 'tile') {
          // Repetida en diagonal por toda la imagen
          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.rotate((cfg.angle == null ? -30 : cfg.angle) * Math.PI / 180);
          ctx.fillStyle = cfg.color;
          ctx.textAlign = 'center';
          var diag = Math.sqrt(w * w + h * h);
          var stepX = tw + size * 3, stepY = lh * lines.length + size * 3;
          for (var y = -diag / 2; y < diag / 2; y += stepY) {
            var shift = (Math.round((y + diag) / stepY) % 2) * stepX / 2;
            for (var x = -diag / 2 - stepX + shift; x < diag / 2 + stepX; x += stepX) {
              lines.forEach(function (l, i) { ctx.fillText(l, x, y + i * lh); });
            }
          }
          ctx.restore();
        } else {
          var bw = tw + m * 2, bh = lh * lines.length + m * 2 - (lh - size);
          var p = cfg.position;
          var bx = p === 'center' ? (w - bw) / 2 : p.indexOf('left') >= 0 ? 0 : w - bw;
          var by = p === 'center' ? (h - bh) / 2 : p.indexOf('top') === 0 ? 0 : h - bh;
          if (cfg.background) { ctx.fillStyle = cfg.background; ctx.fillRect(bx, by, bw, bh); }
          ctx.fillStyle = cfg.color;
          var align = p === 'center' ? 'center' : p.indexOf('left') >= 0 ? 'left' : 'right';
          ctx.textAlign = align;
          var tx = align === 'center' ? bx + bw / 2 : align === 'left' ? bx + m : bx + bw - m;
          lines.forEach(function (l, i) { ctx.fillText(l, tx, by + m + i * lh); });
        }
        var mime = cfg.format === 'png' ? 'image/png' : 'image/jpeg';
        post({ type: 'done', dataUri: canvas.toDataURL(mime, cfg.quality), width: w, height: h });
      } catch (e) { post({ type: 'error', message: String(e && e.message || e) }); }
    };
    img.src = cfg.src;
  };
  post({ type: 'ready' });
})();
</script></body></html>`;

/**
 * Graba una marca de agua (texto) en una imagen y devuelve la imagen nueva. No hay que montar nada: usa un WebView
 * invisible que crea y quita ella sola (necesita react-native-webview y el ThemeProvider). Acepta file://, content://,
 * https o data:. Para guardarla como archivo, escribe `base64` con expo-file-system (u otra librería)
 * @example
 * const r = await watermarkImage(foto.uri, { text: usuario.nombre, date: true });
 * const archivo = new File(Paths.cache, 'foto.jpg'); archivo.write(r.base64, { encoding: 'base64' });
 * // Repetida en diagonal por toda la imagen
 * await watermarkImage(uri, { text: 'CONFIDENCIAL', position: 'tile', color: '#ff000040', bold: true });
 */
export const watermarkImage = async (source: string, options: WatermarkOptions): Promise<WatermarkResult> => {
    const WebView = loadWebView();
    if (!WebView) throw new Error('watermarkImage necesita react-native-webview: npx expo install react-native-webview');
    const {
        text, date, position = 'bottom-right', fontSize, color = '#000000b3', background = '#dddddd77', bold, margin,
        angle, maxSize, format = 'jpeg', quality = 0.9, headers, timeout = 30000,
    } = options;
    const lines = (Array.isArray(text) ? text : String(text ?? '').split('\n')).filter(l => l !== '');
    if (date) lines.push(new Date().toLocaleString());
    const src = await toDataUri(source, headers);
    const cfg = { src, lines, position, fontSize, color, background, bold, margin, angle, maxSize, format, quality };

    return new Promise<WatermarkResult>((resolve, reject) => {
        let sibling: RootSiblings | null = null;
        let ref: WebViewHandle | null = null;
        let done = false;
        const finish = (fn: () => void) => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            fn();
            // Se quita después de responder (no dentro del propio evento del WebView)
            setTimeout(() => sibling?.destroy());
        };
        const timer = setTimeout(() => finish(() => reject(new Error('watermarkImage: tiempo agotado'))), timeout);
        const onMessage = (e: WebViewMessageEvent) => {
            let msg: any;
            try { msg = JSON.parse(e.nativeEvent.data) } catch { return }
            if (msg.type === 'ready') ref?.injectJavaScript(`window.__wm(${jsValue(cfg)});true;`);
            else if (msg.type === 'error') finish(() => reject(new Error(msg.message)));
            else if (msg.type === 'done') {
                const dataUri: string = msg.dataUri;
                finish(() => resolve({
                    dataUri,
                    base64: dataUri.slice(dataUri.indexOf(',') + 1),
                    mimeType: format === 'png' ? 'image/png' : 'image/jpeg',
                    width: msg.width,
                    height: msg.height,
                }));
            }
        };
        // Invisible y fuera de la pantalla (1x1: con tamaño 0, Android puede no ejecutar el JS)
        sibling = new RootSiblings(
            <View pointerEvents="none" style={{ position: 'absolute', left: -10, top: -10, width: 1, height: 1, opacity: 0 }}>
                <WebView
                    ref={(r: WebViewHandle | null) => { ref = r }}
                    source={{ html: HTML }}
                    originWhitelist={['*']}
                    javaScriptEnabled
                    onMessage={onMessage}
                    onError={() => finish(() => reject(new Error('watermarkImage: no se pudo cargar el WebView')))}
                />
            </View>
        );
    });
};
