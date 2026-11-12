// pdf.js dentro de la app para PDFViewer (sin internet). Importarlo una vez, p. ej. en App.tsx:
//   import 'easynat/pdfjs';
// Es lo mismo que import 'easynat/dist/utils/pdfjs' (que sigue funcionando). Pesa ~1,5 MB: por eso no va en el índice
require('./dist/utils/pdfjs');
