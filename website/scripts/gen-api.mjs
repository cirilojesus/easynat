// Genera src/data/api.json a partir del código de la librería (../src): los tipos exportados (props, refs, opciones)
// con sus miembros y comentarios, y las funciones / constantes exportadas con su firma y su JSDoc.
// Se ejecuta antes de dev y build (npm run api), así la documentación nunca se queda desactualizada.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(here, '../../src');
const OUT = path.resolve(here, '../src/data/api.json');

// Archivos de la librería (pdfjs es pdf.js empaquetado: no se documenta)
const files = [];
(function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) walk(p);
        else if (/\.tsx?$/.test(f) && !/pdfjs\.ts$/.test(f) && !/\.d\.ts$/.test(f)) files.push(p);
    }
})(SRC);

// Qué exporta el índice (lo público). `export * from './X'` exporta todo lo del archivo; `export { a, b } from` solo eso
const index = fs.readFileSync(path.join(SRC, 'index.ts'), 'utf8');
const publicFiles = new Map(); // archivo → Set de nombres o '*'
for (const m of index.matchAll(/export\s+(\*|\{([^}]+)\})\s+from\s+['"](\.[^'"]+)['"]/g)) {
    const rel = m[3].replace(/^\.\//, '');
    const file = [`${rel}.tsx`, `${rel}.ts`].map(x => path.join(SRC, x)).find(fs.existsSync);
    if (!file) continue;
    const names = m[1] === '*' ? '*' : new Set(m[2].split(',').map(s => s.trim().split(/\s+as\s+/).pop()).filter(Boolean));
    publicFiles.set(file, names);
}

const program = ts.createProgram(files, { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, allowJs: false, skipLibCheck: true, noEmit: true });
const checker = program.getTypeChecker();

const docOf = node => {
    const jsDoc = ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc);
    if (!jsDoc.length) return { doc: '', examples: [], deprecated: false };
    const last = jsDoc[jsDoc.length - 1];
    const text = typeof last.comment === 'string' ? last.comment : (last.comment ?? []).map(c => c.text ?? '').join('');
    const examples = (last.tags ?? []).filter(t => t.tagName.text === 'example').map(t => (typeof t.comment === 'string' ? t.comment : (t.comment ?? []).map(c => c.text ?? '').join('')).trim());
    const deprecated = (last.tags ?? []).some(t => t.tagName.text === 'deprecated');
    // Las líneas de un mismo párrafo se juntan (el salto del código no es un salto del texto); los párrafos y las
    // listas ("- …") se quedan
    const joined = text.trim().replace(/\n(?!\n|\s*[-•*] )/g, ' ').replace(/ {2,}/g, ' ');
    return { doc: joined, examples, deprecated };
};
// Comentarios // justo encima (los que no son JSDoc)
const lineCommentOf = (node, sf) => {
    const ranges = ts.getLeadingCommentRanges(sf.text, node.getFullStart()) ?? [];
    return ranges.filter(r => r.kind === ts.SyntaxKind.SingleLineCommentTrivia).map(r => sf.text.slice(r.pos + 2, r.end).trim()).join(' ');
};
const text = (node, sf) => node.getText(sf).replace(/\s+/g, ' ').trim();

const types = {};
const functions = {};
const components = {};

for (const sf of program.getSourceFiles()) {
    if (!files.includes(path.normalize(sf.fileName))) continue;
    const pub = publicFiles.get(path.normalize(sf.fileName));
    if (!pub) continue;
    const isPublic = name => pub === '*' || pub.has(name);
    const mod = path.relative(SRC, sf.fileName).replace(/\.tsx?$/, '');

    const collectMembers = (typeNode, out) => {
        if (!typeNode) return;
        if (ts.isParenthesizedTypeNode(typeNode)) return collectMembers(typeNode.type, out);
        if (ts.isTypeLiteralNode(typeNode)) {
            for (const m of typeNode.members) {
                if (!m.name) continue;
                const name = m.name.getText(sf).replace(/^['"]|['"]$/g, '');
                const d = docOf(m);
                const type = ts.isPropertySignature(m) && m.type ? text(m.type, sf)
                    : ts.isMethodSignature(m) ? `(${m.parameters.map(p => text(p, sf)).join(', ')}) => ${m.type ? text(m.type, sf) : 'void'}` : '';
                out.members.push({ name, type, optional: !!m.questionToken, doc: d.doc, deprecated: d.deprecated });
            }
            return;
        }
        if (ts.isIntersectionTypeNode(typeNode)) { typeNode.types.forEach(t => collectMembers(t, out)); return; }
        if (ts.isTypeReferenceNode(typeNode)) {
            const name = typeNode.typeName.getText(sf);
            // Omit<X, ...> / Partial<X> / Pick<X, ...>: se hereda X (con lo que se quite)
            if (['Omit', 'Partial', 'Pick', 'Required'].includes(name) && typeNode.typeArguments?.length) {
                const base = text(typeNode.typeArguments[0], sf);
                out.extends.push(name === 'Omit' && typeNode.typeArguments[1] ? `${base} (sin ${text(typeNode.typeArguments[1], sf)})` : name === 'Pick' ? `${name}<${base}, …>` : base);
                return;
            }
            out.extends.push(text(typeNode, sf));
            return;
        }
        out.alias = text(typeNode, sf);
    };

    for (const stmt of sf.statements) {
        const exported = stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
        if (!exported) continue;

        if (ts.isTypeAliasDeclaration(stmt) || ts.isInterfaceDeclaration(stmt)) {
            const name = stmt.name.text;
            if (!isPublic(name)) continue;
            const out = { name, module: mod, members: [], extends: [], alias: '', doc: docOf(stmt).doc || lineCommentOf(stmt, sf), typeParams: stmt.typeParameters?.map(p => p.name.text) ?? [] };
            if (ts.isTypeAliasDeclaration(stmt)) collectMembers(stmt.type, out);
            else {
                out.extends = (stmt.heritageClauses ?? []).flatMap(h => h.types.map(t => text(t, sf)));
                collectMembers(ts.factory.createTypeLiteralNode(stmt.members), out);
                // createTypeLiteralNode pierde el sourceFile: se recorre a mano
                out.members = [];
                for (const m of stmt.members) {
                    if (!m.name) continue;
                    const d = docOf(m);
                    out.members.push({ name: m.name.getText(sf), type: m.type ? text(m.type, sf) : '', optional: !!m.questionToken, doc: d.doc, deprecated: d.deprecated });
                }
            }
            types[name] = out;
            continue;
        }

        if (ts.isFunctionDeclaration(stmt) && stmt.name) {
            const name = stmt.name.text;
            if (!isPublic(name)) continue;
            // Con sobrecargas, la firma de la implementación (la que tiene cuerpo) no es pública
            if (stmt.body && functions[name]?.signatures.length) continue;
            const d = docOf(stmt);
            const sig = `${name}(${stmt.parameters.map(p => text(p, sf)).join(', ')})${stmt.type ? ': ' + text(stmt.type, sf) : ''}`;
            (functions[name] ??= { name, module: mod, signatures: [], doc: '', examples: [] }).signatures.push(sig);
            if (d.doc) functions[name].doc = d.doc;
            if (d.examples.length) functions[name].examples = d.examples;
            continue;
        }

        if (ts.isVariableStatement(stmt)) {
            for (const decl of stmt.declarationList.declarations) {
                if (!ts.isIdentifier(decl.name)) continue;
                const name = decl.name.text;
                if (!isPublic(name)) continue;
                const d = docOf(stmt);
                const doc = d.doc || lineCommentOf(stmt, sf);
                const init = decl.initializer;
                // Componente: empieza por mayúscula y es una función / forwardRef / memo
                const isComponent = /^[A-Z]/.test(name) && !!init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init) || ts.isCallExpression(init) || ts.isAsExpression(init));
                if (isComponent) {
                    const declared = decl.type ? text(decl.type, sf) : '';
                    components[name] = { name, module: mod, doc, examples: d.examples, declared };
                    continue;
                }
                // Constantes en mayúsculas (presets, listas): se enseñan con su valor si es corto
                if (/^[A-Z][A-Z0-9_]+$/.test(name)) {
                    const value = init ? text(init, sf) : '';
                    functions[name] = { name, module: mod, kind: 'const', signatures: [], value: value.length < 6000 ? value : value.slice(0, 6000) + ' …', doc, examples: d.examples };
                    continue;
                }
                if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) {
                    const params = init.parameters.map(p => text(p, sf)).join(', ');
                    const ret = init.type ? ': ' + text(init.type, sf) : '';
                    functions[name] = { name, module: mod, kind: 'function', signatures: [`${name}(${params})${ret}`], doc, examples: d.examples };
                    continue;
                }
                // Otros (stores, objetos): con su tipo inferido
                const t = checker.typeToString(checker.getTypeAtLocation(decl.name), undefined, ts.TypeFormatFlags.NoTruncation);
                functions[name] = { name, module: mod, kind: 'value', signatures: [`${name}: ${t.length < 300 ? t : t.slice(0, 300) + ' …'}`], doc, examples: d.examples };
            }
            continue;
        }

        if (ts.isClassDeclaration(stmt) && stmt.name && isPublic(stmt.name.text)) {
            const d = docOf(stmt);
            const methods = stmt.members.filter(m => (ts.isMethodDeclaration(m) || ts.isPropertyDeclaration(m)) && m.name && !m.modifiers?.some(x => x.kind === ts.SyntaxKind.PrivateKeyword) && !m.name.getText(sf).startsWith('#') && !m.name.getText(sf).startsWith('_'))
                .map(m => ({ name: m.name.getText(sf), type: ts.isMethodDeclaration(m) ? `(${m.parameters.map(p => text(p, sf)).join(', ')})${m.type ? ' => ' + text(m.type, sf) : ''}` : (m.type ? text(m.type, sf) : ''), optional: false, doc: docOf(m).doc, deprecated: false }));
            types[stmt.name.text] = { name: stmt.name.text, module: mod, members: methods, extends: [], alias: 'class', doc: d.doc, typeParams: [] };
            functions[stmt.name.text] = { name: stmt.name.text, module: mod, kind: 'class', signatures: [`new ${stmt.name.text}(…)`], doc: d.doc, examples: d.examples };
        }
    }
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), types, functions, components }, null, 1));
console.log(`api.json: ${Object.keys(components).length} componentes, ${Object.keys(types).length} tipos, ${Object.keys(functions).length} funciones y constantes`);
