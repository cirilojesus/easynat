// ImageViewer: visor de imágenes (una o una galería) sobre react-native-webview (opcional). Zoom por imagen con dos
// dedos, arrastrar con zoom, doble toque para acercar o alejar y deslizar para cambiar de imagen. Va dentro de una
// pantalla (<ImageViewer>) o a pantalla completa con openImageViewer(imagenes, { index })
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Image as RNImage, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Box, EABoxProps } from "./Box";
import { Icon } from "./Icon";
import { openModal } from "./Modal";
import { EATextProps, Text } from "./Text";
import { useThemeProps } from "./utils/useThemeProps";
import { jsValue, loadWebView, MissingWebView, toDataUri, webViewCanLoad, WebViewHandle, WebViewMessageEvent } from "./utils/webview";

/* ---------------- Tipos ---------------- */

/** Una imagen: su uri (https, file://, data:) o con título y miniatura */
export type ImageViewerItem = string | { uri: string; title?: string; thumbnail?: string };

export type ImageViewerRef = {
    goTo: (index: number) => void;
    next: () => void;
    prev: () => void;
    resetZoom: () => void;
};

export type ImageViewerProps = Omit<EABoxProps, 'children'> & {
    images: ImageViewerItem[];
    /** La imagen con la que empieza. Por defecto 0 */
    initialIndex?: number;
    onIndexChange?: (index: number) => void;
    /** Zoom máximo. Por defecto 5 */
    maxZoom?: number;
    /** Zoom del doble toque. Por defecto 2.5 */
    doubleTapZoom?: number;
    /** Cómo se indica en cuál se está: puntos, miniaturas, "2 / 5" o nada. Por defecto puntos (o "2 / 5" con más de 10) */
    indicator?: 'dots' | 'thumbnails' | 'counter' | 'none';
    /** Flechas a los lados para pasar de imagen. Por defecto true (con más de una) */
    showArrows?: boolean;
    /** Botón de cerrar (arriba a la derecha) */
    onClose?: () => void;
    /** Un toque en la imagen. Por defecto muestra u oculta los controles */
    onTap?: (index: number) => void;
    /** Fondo. Por defecto negro */
    backgroundColor?: string;
    /** Contenido propio abajo (p. ej. botones de compartir o borrar) */
    renderFooter?: (index: number, item: ImageViewerItem) => React.ReactNode;
    _title?: EATextProps;
    _footer?: EABoxProps;
    variant?: (string & {});
};

const uriOf = (item: ImageViewerItem) => (typeof item === 'string' ? item : item.uri);
const titleOf = (item: ImageViewerItem) => (typeof item === 'string' ? undefined : item.title);
const thumbOf = (item: ImageViewerItem) => (typeof item === 'string' ? item : item.thumbnail ?? item.uri);

/* ---------------- El documento del WebView ---------------- */

const viewerDocument = (cfg: { images: (string | null)[]; index: number; maxZoom: number; doubleTap: number; bg: string }) => `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
html,body{margin:0;height:100%;background:${cfg.bg};overflow:hidden;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}
#car{display:flex;width:100vw;height:100vh;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}
#car::-webkit-scrollbar{display:none}
.slide{flex:0 0 100vw;height:100vh;scroll-snap-align:start;scroll-snap-stop:always;display:flex;align-items:center;justify-content:center;overflow:hidden}
.slide img{max-width:100%;max-height:100%;object-fit:contain;transform-origin:center center;will-change:transform}
</style></head>
<body><div id="car"></div>
<script>window.__CFG=${jsValue(cfg)};</script>
<script>${VIEWER_SCRIPT}</script></body></html>`;

// En ES5 a propósito: así funciona también en WebViews de Android antiguos
const VIEWER_SCRIPT = String.raw`(function () {
  var cfg = window.__CFG, car = document.getElementById('car'), RN = window.ReactNativeWebView;
  function post(o) { if (RN) RN.postMessage(JSON.stringify(o)); }
  var slides = [], current = 0, Z = { s: 1, x: 0, y: 0 };
  function W() { return car.clientWidth; }
  function H() { return car.clientHeight; }
  function build(list) {
    car.innerHTML = '';
    slides = list.map(function (src, i) {
      var d = document.createElement('div'); d.className = 'slide';
      var img = document.createElement('img'); img.draggable = false;
      if (src) img.src = src;
      d.appendChild(img); car.appendChild(d);
      return { el: d, img: img };
    });
  }
  // Que la imagen no se salga de la pantalla al moverla con zoom
  function clamp() {
    var sl = slides[current]; if (!sl) return;
    var mx = Math.max(0, (sl.img.clientWidth * Z.s - W()) / 2), my = Math.max(0, (sl.img.clientHeight * Z.s - H()) / 2);
    Z.x = Math.min(mx, Math.max(-mx, Z.x)); Z.y = Math.min(my, Math.max(-my, Z.y));
  }
  function apply(anim) {
    var sl = slides[current]; if (!sl) return;
    sl.img.style.transition = anim ? 'transform .22s ease-out' : 'none';
    sl.img.style.transform = 'translate(' + Z.x + 'px,' + Z.y + 'px) scale(' + Z.s + ')';
    // Con zoom no se pasa de imagen al arrastrar (se mueve la imagen)
    car.style.overflowX = Z.s > 1.01 ? 'hidden' : 'auto';
  }
  function zoomed() { post({ type: 'zoom', scale: Z.s }); }
  function resetZoom(anim) { Z = { s: 1, x: 0, y: 0 }; apply(anim); zoomed(); }
  function resetOn(i) {
    var sl = slides[i]; if (sl) { sl.img.style.transition = 'none'; sl.img.style.transform = 'none'; }
    Z = { s: 1, x: 0, y: 0 }; car.style.overflowX = 'auto';
  }
  function goTo(i, smooth) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (Z.s > 1.01) { resetOn(current); zoomed(); }
    car.scrollTo({ left: i * W(), behavior: smooth ? 'smooth' : 'auto' });
  }
  var scrollTimer;
  car.addEventListener('scroll', function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      var i = Math.round(car.scrollLeft / W());
      if (i !== current) { resetOn(current); current = i; post({ type: 'index', index: i }); }
    }, 60);
  }, { passive: true });

  // Gestos: dos dedos = zoom (y mover a la vez); uno con zoom = mover; toque y doble toque
  var pinch = null, pan = null, lastTap = 0, tapStart = null;
  function dist(a, b) { return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
  function rel(x, y) { return { x: x - W() / 2, y: y - H() / 2 }; }
  car.addEventListener('touchstart', function (e) {
    if (e.touches.length === 2) {
      var a = e.touches[0], b = e.touches[1];
      pinch = { d0: dist(a, b), s0: Z.s, x0: Z.x, y0: Z.y, m0: rel((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2) };
      pan = null; tapStart = null; e.preventDefault();
    } else if (e.touches.length === 1) {
      var t = e.touches[0];
      tapStart = { x: t.clientX, y: t.clientY, time: Date.now() };
      if (Z.s > 1.01) pan = { x: t.clientX, y: t.clientY, x0: Z.x, y0: Z.y };
    }
  }, { passive: false });
  car.addEventListener('touchmove', function (e) {
    // Si el dedo se mueve ya no es un toque (p. ej. al desplazar la página por encima del visor)
    var m0 = e.touches[0];
    if (tapStart && m0 && (Math.abs(m0.clientX - tapStart.x) > 10 || Math.abs(m0.clientY - tapStart.y) > 10)) tapStart = null;
    if (pinch && e.touches.length === 2) {
      e.preventDefault();
      var a = e.touches[0], b = e.touches[1];
      var s = Math.max(1, Math.min(cfg.maxZoom, pinch.s0 * dist(a, b) / pinch.d0));
      var m = rel((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2);
      // El punto que había bajo los dedos se queda bajo los dedos
      Z.x = m.x - (pinch.m0.x - pinch.x0) * (s / pinch.s0);
      Z.y = m.y - (pinch.m0.y - pinch.y0) * (s / pinch.s0);
      Z.s = s; clamp(); apply(false);
    } else if (pan && e.touches.length === 1) {
      e.preventDefault();
      var t = e.touches[0];
      Z.x = pan.x0 + (t.clientX - pan.x); Z.y = pan.y0 + (t.clientY - pan.y);
      clamp(); apply(false);
    }
  }, { passive: false });
  car.addEventListener('touchend', function (e) {
    if (pinch && e.touches.length < 2) {
      pinch = null;
      if (Z.s < 1.05) resetZoom(true); else zoomed();
      if (e.touches.length === 1 && Z.s > 1.01) { var r = e.touches[0]; pan = { x: r.clientX, y: r.clientY, x0: Z.x, y0: Z.y }; }
      return;
    }
    if (e.touches.length) return;
    pan = null;
    var t = e.changedTouches[0];
    if (tapStart && Math.abs(t.clientX - tapStart.x) < 10 && Math.abs(t.clientY - tapStart.y) < 10 && Date.now() - tapStart.time < 250) {
      var now = Date.now();
      if (now - lastTap < 300) {
        lastTap = 0;
        if (Z.s > 1.01) resetZoom(true);
        else {
          var s = cfg.doubleTap, m = rel(t.clientX, t.clientY);
          Z = { s: s, x: -m.x * (s - 1), y: -m.y * (s - 1) }; clamp(); apply(true); zoomed();
        }
      } else {
        lastTap = now;
        setTimeout(function () { if (lastTap === now) post({ type: 'tap' }); }, 300);
      }
    }
    tapStart = null;
  });

  // El gesto se lo queda otro (el ScrollView de la página): ni toque ni gesto a medias
  car.addEventListener('touchcancel', function () {
    tapStart = null; pan = null;
    if (pinch) { pinch = null; if (Z.s < 1.05) resetZoom(true); else zoomed(); }
  });

  window.__setImages = function (list, index) {
    build(list); current = Math.max(0, Math.min(list.length - 1, index || 0)); Z = { s: 1, x: 0, y: 0 };
    requestAnimationFrame(function () { car.scrollLeft = current * W(); });
  };
  window.__setSrc = function (i, src) { if (slides[i] && slides[i].img.getAttribute('src') !== src) slides[i].img.src = src; };
  window.__goTo = goTo;
  window.__resetZoom = function () { resetZoom(true); };
  window.addEventListener('resize', function () { resetOn(current); car.scrollLeft = current * W(); });
  window.__setImages(cfg.images, cfg.index);
  post({ type: 'ready' });
})();`;

/* ---------------- Componente ---------------- */

const ArrowButton = ({ dir, onPress }: { dir: 'left' | 'right'; onPress: () => void }) => (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={dir === 'left' ? '←' : '→'} hitSlop={8}
        style={({ pressed }) => ({ position: 'absolute', top: '50%', marginTop: -22, [dir]: 8, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
        <Icon as="Feather" name={dir === 'left' ? 'chevron-left' : 'chevron-right'} size={26} color={'white' as any} />
    </Pressable>
);

/**
 * Visor de imágenes con zoom. Necesita react-native-webview (dependencia opcional)
 * @example <ImageViewer images={fotos} initialIndex={2} h={300} />
 * @example openImageViewer(fotos, { index: 2 })
 */
export const ImageViewer = forwardRef<ImageViewerRef, ImageViewerProps>((rawProps, ref) => {
    // Defaults → theme.components.ImageViewer → variante → props → plataforma
    const [p] = useThemeProps<ImageViewerProps>('ImageViewer', rawProps);
    const {
        images, initialIndex = 0, onIndexChange, maxZoom = 5, doubleTapZoom = 2.5, indicator: indicatorProp, showArrows = true,
        onClose, onTap, backgroundColor = '#000', renderFooter, _title, _footer, variant: _v, ...boxProps
    } = p;
    const WebView = loadWebView();
    const insets = useSafeAreaInsets();
    const web = useRef<WebViewHandle>(null);
    const ready = useRef(false);
    const queue = useRef<string[]>([]);
    const run = (js: string) => { const code = `${js};true;`; if (ready.current) web.current?.injectJavaScript(code); else queue.current.push(code) };

    const [index, setIndex] = useState(Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1)));
    const [zoomed, setZoomed] = useState(false);
    const [chrome, setChrome] = useState(true);
    const uris = useMemo(() => images.map(uriOf), [images]);
    // Las que el WebView no puede cargar (file://, content://...) se convierten, solo las de alrededor de la visible
    const converted = useRef(new Map<string, string>());
    const srcOf = (uri: string) => (webViewCanLoad(uri) ? uri : converted.current.get(uri) ?? null);
    const source = useMemo(() => ({
        html: viewerDocument({ images: uris.map(srcOf), index, maxZoom, doubleTap: doubleTapZoom, bg: backgroundColor }),
    }), []);

    // Imágenes nuevas después de montar: se cargan sin recargar el WebView
    const first = useRef(true);
    useEffect(() => {
        if (first.current) { first.current = false; return }
        const i = Math.min(index, Math.max(0, uris.length - 1));
        setIndex(i);
        run(`window.__setImages(${jsValue(uris.map(srcOf))},${i})`);
    }, [uris.join('\n')]);

    useEffect(() => {
        [index - 1, index, index + 1].forEach(i => {
            const uri = uris[i];
            if (!uri || webViewCanLoad(uri) || converted.current.has(uri)) return;
            // Se guarda aunque ya se haya pasado de imagen: así no se vuelve a leer al volver
            toDataUri(uri).then(data => {
                converted.current.set(uri, data);
                run(`window.__setSrc(${i},${jsValue(data)})`);
            }).catch(() => { });
        });
    }, [index, uris]);

    const goTo = (i: number) => run(`window.__goTo(${Math.max(0, Math.min(uris.length - 1, i))},true)`);
    useImperativeHandle(ref, () => ({ goTo, next: () => goTo(index + 1), prev: () => goTo(index - 1), resetZoom: () => run('window.__resetZoom()') }));

    const onMessage = (e: WebViewMessageEvent) => {
        let msg: any;
        try { msg = JSON.parse(e.nativeEvent.data) } catch { return }
        switch (msg.type) {
            case 'ready':
                ready.current = true;
                queue.current.splice(0).forEach(code => web.current?.injectJavaScript(code));
                break;
            case 'index': setIndex(msg.index); onIndexChange?.(msg.index); break;
            case 'zoom': setZoomed(msg.scale > 1.01); break;
            case 'tap': onTap ? onTap(index) : setChrome(c => !c); break;
        }
    };

    if (!WebView) return <MissingWebView name="ImageViewer" {...boxProps} />;

    const many = images.length > 1;
    const indicator = indicatorProp ?? (images.length > 10 ? 'counter' : 'dots');
    const item = images[index];
    const title = item ? titleOf(item) : undefined;

    return (
        <Box flex={1} style={{ backgroundColor }} overflow="hidden" {...boxProps}>
            <WebView
                ref={web}
                originWhitelist={['*']}
                source={source}
                onMessage={onMessage}
                style={{ flex: 1, backgroundColor }}
                containerStyle={{ backgroundColor }}
                scrollEnabled={false}
                bounces={false}
                overScrollMode="never"
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                setSupportMultipleWindows={false}
                javaScriptEnabled
            />
            {chrome && (
                <>
                    {/* Arriba: "2 / 5" y cerrar */}
                    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { paddingTop: onClose ? insets.top : 0 }]}>
                        <View pointerEvents="box-none" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 48, paddingHorizontal: 56 }}>
                            {many && indicator === 'counter' && <Text color="white" fontWeight="600">{`${index + 1} / ${images.length}`}</Text>}
                            {onClose && (
                                <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="close" hitSlop={10}
                                    style={({ pressed }) => ({ position: 'absolute', right: 8, top: 6, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
                                    <Icon as="Feather" name="x" size={22} color={'white' as any} />
                                </Pressable>
                            )}
                        </View>
                    </View>
                    {many && showArrows && !zoomed && index > 0 && <ArrowButton dir="left" onPress={() => goTo(index - 1)} />}
                    {many && showArrows && !zoomed && index < images.length - 1 && <ArrowButton dir="right" onPress={() => goTo(index + 1)} />}
                    {/* Abajo: título, puntos o miniaturas y lo propio */}
                    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: onClose ? insets.bottom + 8 : 8, gap: 8 }}>
                        {title ? <Text color="white" textAlign="center" px={4} {..._title}>{title}</Text> : null}
                        {many && indicator === 'dots' && (
                            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                                {images.map((_, i) => (
                                    <Pressable key={i} onPress={() => goTo(i)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${i + 1}`}
                                        style={{ width: i === index ? 18 : 7, height: 7, borderRadius: 4, backgroundColor: i === index ? 'white' : 'rgba(255,255,255,0.45)' }} />
                                ))}
                            </View>
                        )}
                        {many && indicator === 'thumbnails' && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 12, flexGrow: 1, justifyContent: 'center' }}>
                                {images.map((it, i) => (
                                    <Pressable key={i} onPress={() => goTo(i)} accessibilityRole="button" accessibilityLabel={`${i + 1}`}
                                        style={{ borderWidth: 2, borderColor: i === index ? 'white' : 'transparent', borderRadius: 8, overflow: 'hidden', opacity: i === index ? 1 : 0.6 }}>
                                        <RNImage source={{ uri: thumbOf(it) }} style={{ width: 52, height: 52 }} />
                                    </Pressable>
                                ))}
                            </ScrollView>
                        )}
                        {renderFooter && item ? <Box {..._footer}>{renderFooter(index, item)}</Box> : null}
                    </View>
                </>
            )}
        </Box>
    );
});

/**
 * Abre el visor a pantalla completa (con su botón de cerrar). Devuelve el control del modal
 * @example openImageViewer(['https://…/1.jpg', { uri: fotoLocal, title: 'Recibo' }], { index: 1 })
 */
export const openImageViewer = (images: ImageViewerItem[], options?: Omit<ImageViewerProps, 'images' | 'onClose'> & { index?: number }) => {
    const { index, ...rest } = options ?? {};
    return openModal({
        animationType: 'fade',
        buttonClose: false,
        _contentStyle: { h: '100%', my: 0, roundedTop: 0, roundedBottom: 0, bg: (rest.backgroundColor ?? 'black') as any },
        children: ({ close }) => <ImageViewer images={images} initialIndex={index} onClose={() => close()} {...rest} />,
    });
};
