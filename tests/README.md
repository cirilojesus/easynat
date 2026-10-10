# Pruebas

```bash
npm test                 # compila src en tests/.build y ejecuta todas
npm test -- select slider   # solo esas
```

No necesitan un móvil ni un emulador: `harness.js` simula React Native (vistas, Animated, Reanimated, PanResponder,
teclado, WebView, AsyncStorage…) y las pruebas montan los componentes con `react-test-renderer`. Cada archivo se ejecuta
en su propio proceso; una línea `OK …` por cada comprobación que pasa.

Lo que dependa del aspecto real (animaciones, gestos, WebView) hay que verlo también en la app de pruebas (`.playground`).
