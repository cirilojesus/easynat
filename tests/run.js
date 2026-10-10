// Ejecuta todas las pruebas (cada archivo en su propio proceso) y resume el resultado.
// Antes, `npm test` compila src en tests/.build. Uso: npm test  ·  npm test -- select slider (solo esas)
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const only = process.argv.slice(2);
const files = fs.readdirSync(__dirname)
    .filter(f => f.endsWith('.js') && !['harness.js', 'run.js'].includes(f))
    .filter(f => !only.length || only.includes(f.replace(/\.js$/, '')))
    .sort();

const failed = [];
const t0 = Date.now();
for (const f of files) {
    const r = spawnSync(process.execPath, [path.join(__dirname, f)], { encoding: 'utf8' });
    const oks = (r.stdout.match(/^OK /gm) || []).length;
    if (r.status === 0) console.log(`✓ ${f.padEnd(18)} ${oks} comprobaciones`);
    else {
        failed.push(f);
        console.log(`✗ ${f}`);
        console.log((r.stdout + r.stderr).split('\n').filter(l => /FALLO|Error|assert/i.test(l)).slice(0, 8).map(l => '    ' + l).join('\n'));
    }
}
console.log(`\n${files.length - failed.length}/${files.length} archivos sin fallos (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
process.exit(failed.length ? 1 : 0);
