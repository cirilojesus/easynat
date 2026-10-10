// Genera src/utils/pdfjs.ts: pdf.js (build legacy, minificado) como texto, para que PDFViewer funcione sin internet.
// Uso: node scripts/build-pdfjs.js [versión]   (por defecto la que usa PDFViewer)
// No va en el índice de la librería: quien lo quiera lo importa una vez (import 'easynat/dist/utils/pdfjs'); sin él,
// PDFViewer carga pdf.js del CDN
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const version = process.argv[2] || '3.11.174';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pdfjs-'));
execSync(`npm pack pdfjs-dist@${version} --silent`, { cwd: tmp, stdio: 'ignore' });
execSync(`tar -xzf pdfjs-dist-${version}.tgz`, { cwd: tmp });
const read = f => fs.readFileSync(path.join(tmp, 'package', 'legacy', 'build', f), 'utf8');
const main = read('pdf.min.js');
const worker = read('pdf.worker.min.js');
if (/<\/script/i.test(main + worker)) throw new Error('pdf.js contiene </script: habría que escaparlo');

const out = `// GENERADO por scripts/build-pdfjs.js (pdfjs-dist ${version}, build legacy). No editar a mano.
// pdf.js © Mozilla, licencia Apache-2.0 (https://github.com/mozilla/pdf.js/blob/master/LICENSE)
// Importarlo una vez hace que PDFViewer funcione sin internet: import 'easynat/dist/utils/pdfjs'
import { registerPdfJs } from '../PDFViewer';

registerPdfJs({
    version: ${JSON.stringify(version)},
    main: ${JSON.stringify(main)},
    worker: ${JSON.stringify(worker)},
});
`;
fs.writeFileSync(path.join(__dirname, '..', 'src', 'utils', 'pdfjs.ts'), out);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`src/utils/pdfjs.ts: pdf.js ${version} (${((main.length + worker.length) / 1024 / 1024).toFixed(2)} MB)`);
