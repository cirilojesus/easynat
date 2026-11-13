// Genera src/utils/pdfjs.ts: pdf.js (build legacy, minificado, módulos ES) como texto, y los decodificadores wasm de
// imágenes (JPEG 2000 y JBIG2) en base64, para que PDFViewer funcione sin internet.
// Uso: node scripts/build-pdfjs.js [versión]   (por defecto la que usa PDFViewer)
// No va en el índice de la librería: quien lo quiera lo importa una vez (import 'easynat/pdfjs', o 'easynat/dist/utils/pdfjs'); sin él,
// PDFViewer carga pdf.js del CDN
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const version = process.argv[2] || '6.5.438';
// Los que hacen falta para dibujar imágenes de PDFs escaneados; qcms (perfiles de color) y quickjs (scripts) no
const WASM = ['openjpeg.wasm', 'jbig2.wasm'];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pdfjs-'));
execSync(`npm pack pdfjs-dist@${version} --silent`, { cwd: tmp, stdio: 'ignore' });
execSync(`tar -xzf pdfjs-dist-${version}.tgz`, { cwd: tmp });
const read = f => fs.readFileSync(path.join(tmp, 'package', 'legacy', 'build', f), 'utf8');
const main = read('pdf.min.mjs');
const worker = read('pdf.worker.min.mjs');
const wasm = Object.fromEntries(WASM.map(f => [f, fs.readFileSync(path.join(tmp, 'package', 'wasm', f)).toString('base64')]));
// Se cargan desde un blob: no pueden importar otros archivos
if (/(^|[;}\s])import\s*[{*"']/.test(main + worker)) throw new Error('pdf.js importa otros módulos: no se puede cargar desde un blob');
if (/<\/script/i.test(main + worker)) throw new Error('pdf.js contiene </script: habría que escaparlo');

const out = `// GENERADO por scripts/build-pdfjs.js (pdfjs-dist ${version}, build legacy). No editar a mano.
// pdf.js © Mozilla, licencia Apache-2.0 (https://github.com/mozilla/pdf.js/blob/master/LICENSE)
// Importarlo una vez hace que PDFViewer funcione sin internet: import 'easynat/pdfjs'
import { registerPdfJs } from '../PDFViewer';

registerPdfJs({
    version: ${JSON.stringify(version)},
    main: ${JSON.stringify(main)},
    worker: ${JSON.stringify(worker)},
    wasm: ${JSON.stringify(wasm)},
});
`;
fs.writeFileSync(path.join(__dirname, '..', 'src', 'utils', 'pdfjs.ts'), out);
fs.rmSync(tmp, { recursive: true, force: true });
const mb = n => (n / 1024 / 1024).toFixed(2) + ' MB';
console.log(`src/utils/pdfjs.ts: pdf.js ${version} (${mb(main.length + worker.length)} + wasm ${mb(Object.values(wasm).join('').length)})`);
