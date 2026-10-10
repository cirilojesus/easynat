"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openImageViewer = exports.ImageViewer = void 0;
// ImageViewer: visor de imágenes (una o una galería) sobre react-native-webview (opcional). Zoom por imagen con dos
// dedos, arrastrar con zoom, doble toque para acercar o alejar y deslizar para cambiar de imagen. Va dentro de una
// pantalla (<ImageViewer>) o a pantalla completa con openImageViewer(imagenes, { index })
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const Box_1 = require("./Box");
const Icon_1 = require("./Icon");
const Modal_1 = require("./Modal");
const Text_1 = require("./Text");
const useThemeProps_1 = require("./utils/useThemeProps");
const webview_1 = require("./utils/webview");
const uriOf = (item) => (typeof item === 'string' ? item : item.uri);
const titleOf = (item) => (typeof item === 'string' ? undefined : item.title);
const thumbOf = (item) => { var _a; return (typeof item === 'string' ? item : (_a = item.thumbnail) !== null && _a !== void 0 ? _a : item.uri); };
/* ---------------- El documento del WebView ---------------- */
const viewerDocument = (cfg) => `<!DOCTYPE html>
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
<script>window.__CFG=${(0, webview_1.jsValue)(cfg)};</script>
<script>${VIEWER_SCRIPT}</script></body></html>`;
// En ES5 a propósito: así funciona también en WebViews de Android antiguos
const VIEWER_SCRIPT = String.raw `(function () {
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
const ArrowButton = ({ dir, onPress }) => (<react_native_1.Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={dir === 'left' ? '←' : '→'} hitSlop={8} style={({ pressed }) => ({ position: 'absolute', top: '50%', marginTop: -22, [dir]: 8, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
        <Icon_1.Icon as="Feather" name={dir === 'left' ? 'chevron-left' : 'chevron-right'} size={26} color={'white'}/>
    </react_native_1.Pressable>);
/**
 * Visor de imágenes con zoom. Necesita react-native-webview (dependencia opcional)
 * @example <ImageViewer images={fotos} initialIndex={2} h={300} />
 * @example openImageViewer(fotos, { index: 2 })
 */
exports.ImageViewer = (0, react_1.forwardRef)((rawProps, ref) => {
    // Defaults → theme.components.ImageViewer → variante → props → plataforma
    const [p] = (0, useThemeProps_1.useThemeProps)('ImageViewer', rawProps);
    const { images, initialIndex = 0, onIndexChange, maxZoom = 5, doubleTapZoom = 2.5, indicator: indicatorProp, showArrows = true, onClose, onTap, backgroundColor = '#000', renderFooter, _title, _footer, variant: _v } = p, boxProps = __rest(p, ["images", "initialIndex", "onIndexChange", "maxZoom", "doubleTapZoom", "indicator", "showArrows", "onClose", "onTap", "backgroundColor", "renderFooter", "_title", "_footer", "variant"]);
    const WebView = (0, webview_1.loadWebView)();
    const insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    const web = (0, react_1.useRef)(null);
    const ready = (0, react_1.useRef)(false);
    const queue = (0, react_1.useRef)([]);
    const run = (js) => { var _a; const code = `${js};true;`; if (ready.current)
        (_a = web.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript(code);
    else
        queue.current.push(code); };
    const [index, setIndex] = (0, react_1.useState)(Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1)));
    const [zoomed, setZoomed] = (0, react_1.useState)(false);
    const [chrome, setChrome] = (0, react_1.useState)(true);
    const uris = (0, react_1.useMemo)(() => images.map(uriOf), [images]);
    // Las que el WebView no puede cargar (file://, content://...) se convierten, solo las de alrededor de la visible
    const converted = (0, react_1.useRef)(new Map());
    const srcOf = (uri) => { var _a; return ((0, webview_1.webViewCanLoad)(uri) ? uri : (_a = converted.current.get(uri)) !== null && _a !== void 0 ? _a : null); };
    const source = (0, react_1.useMemo)(() => ({
        html: viewerDocument({ images: uris.map(srcOf), index, maxZoom, doubleTap: doubleTapZoom, bg: backgroundColor }),
    }), []);
    // Imágenes nuevas después de montar: se cargan sin recargar el WebView
    const first = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        const i = Math.min(index, Math.max(0, uris.length - 1));
        setIndex(i);
        run(`window.__setImages(${(0, webview_1.jsValue)(uris.map(srcOf))},${i})`);
    }, [uris.join('\n')]);
    (0, react_1.useEffect)(() => {
        [index - 1, index, index + 1].forEach(i => {
            const uri = uris[i];
            if (!uri || (0, webview_1.webViewCanLoad)(uri) || converted.current.has(uri))
                return;
            // Se guarda aunque ya se haya pasado de imagen: así no se vuelve a leer al volver
            (0, webview_1.toDataUri)(uri).then(data => {
                converted.current.set(uri, data);
                run(`window.__setSrc(${i},${(0, webview_1.jsValue)(data)})`);
            }).catch(() => { });
        });
    }, [index, uris]);
    const goTo = (i) => run(`window.__goTo(${Math.max(0, Math.min(uris.length - 1, i))},true)`);
    (0, react_1.useImperativeHandle)(ref, () => ({ goTo, next: () => goTo(index + 1), prev: () => goTo(index - 1), resetZoom: () => run('window.__resetZoom()') }));
    const onMessage = (e) => {
        let msg;
        try {
            msg = JSON.parse(e.nativeEvent.data);
        }
        catch (_a) {
            return;
        }
        switch (msg.type) {
            case 'ready':
                ready.current = true;
                queue.current.splice(0).forEach(code => { var _a; return (_a = web.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript(code); });
                break;
            case 'index':
                setIndex(msg.index);
                onIndexChange === null || onIndexChange === void 0 ? void 0 : onIndexChange(msg.index);
                break;
            case 'zoom':
                setZoomed(msg.scale > 1.01);
                break;
            case 'tap':
                onTap ? onTap(index) : setChrome(c => !c);
                break;
        }
    };
    if (!WebView)
        return <webview_1.MissingWebView name="ImageViewer" {...boxProps}/>;
    const many = images.length > 1;
    const indicator = indicatorProp !== null && indicatorProp !== void 0 ? indicatorProp : (images.length > 10 ? 'counter' : 'dots');
    const item = images[index];
    const title = item ? titleOf(item) : undefined;
    return (<Box_1.Box flex={1} style={{ backgroundColor }} overflow="hidden" {...boxProps}>
            <WebView ref={web} originWhitelist={['*']} source={source} onMessage={onMessage} style={{ flex: 1, backgroundColor }} containerStyle={{ backgroundColor }} scrollEnabled={false} bounces={false} overScrollMode="never" showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} setSupportMultipleWindows={false} javaScriptEnabled/>
            {chrome && (<>
                    {/* Arriba: "2 / 5" y cerrar */}
                    <react_native_1.View pointerEvents="box-none" style={[react_native_1.StyleSheet.absoluteFill, { paddingTop: onClose ? insets.top : 0 }]}>
                        <react_native_1.View pointerEvents="box-none" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 48, paddingHorizontal: 56 }}>
                            {many && indicator === 'counter' && <Text_1.Text color="white" fontWeight="600">{`${index + 1} / ${images.length}`}</Text_1.Text>}
                            {onClose && (<react_native_1.Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="close" hitSlop={10} style={({ pressed }) => ({ position: 'absolute', right: 8, top: 6, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
                                    <Icon_1.Icon as="Feather" name="x" size={22} color={'white'}/>
                                </react_native_1.Pressable>)}
                        </react_native_1.View>
                    </react_native_1.View>
                    {many && showArrows && !zoomed && index > 0 && <ArrowButton dir="left" onPress={() => goTo(index - 1)}/>}
                    {many && showArrows && !zoomed && index < images.length - 1 && <ArrowButton dir="right" onPress={() => goTo(index + 1)}/>}
                    {/* Abajo: título, puntos o miniaturas y lo propio */}
                    <react_native_1.View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: onClose ? insets.bottom + 8 : 8, gap: 8 }}>
                        {title ? <Text_1.Text color="white" textAlign="center" px={4} {..._title}>{title}</Text_1.Text> : null}
                        {many && indicator === 'dots' && (<react_native_1.View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                                {images.map((_, i) => (<react_native_1.Pressable key={i} onPress={() => goTo(i)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${i + 1}`} style={{ width: i === index ? 18 : 7, height: 7, borderRadius: 4, backgroundColor: i === index ? 'white' : 'rgba(255,255,255,0.45)' }}/>))}
                            </react_native_1.View>)}
                        {many && indicator === 'thumbnails' && (<react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 12, flexGrow: 1, justifyContent: 'center' }}>
                                {images.map((it, i) => (<react_native_1.Pressable key={i} onPress={() => goTo(i)} accessibilityRole="button" accessibilityLabel={`${i + 1}`} style={{ borderWidth: 2, borderColor: i === index ? 'white' : 'transparent', borderRadius: 8, overflow: 'hidden', opacity: i === index ? 1 : 0.6 }}>
                                        <react_native_1.Image source={{ uri: thumbOf(it) }} style={{ width: 52, height: 52 }}/>
                                    </react_native_1.Pressable>))}
                            </react_native_1.ScrollView>)}
                        {renderFooter && item ? <Box_1.Box {..._footer}>{renderFooter(index, item)}</Box_1.Box> : null}
                    </react_native_1.View>
                </>)}
        </Box_1.Box>);
});
/**
 * Abre el visor a pantalla completa (con su botón de cerrar). Devuelve el control del modal
 * @example openImageViewer(['https://…/1.jpg', { uri: fotoLocal, title: 'Recibo' }], { index: 1 })
 */
const openImageViewer = (images, options) => {
    var _a;
    const _b = options !== null && options !== void 0 ? options : {}, { index } = _b, rest = __rest(_b, ["index"]);
    return (0, Modal_1.openModal)({
        animationType: 'fade',
        buttonClose: false,
        _contentStyle: { h: '100%', my: 0, roundedTop: 0, roundedBottom: 0, bg: ((_a = rest.backgroundColor) !== null && _a !== void 0 ? _a : 'black') },
        children: ({ close }) => <exports.ImageViewer images={images} initialIndex={index} onClose={() => close()} {...rest}/>,
    });
};
exports.openImageViewer = openImageViewer;
