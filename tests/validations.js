// Validaciones de EAForm
const assert = require('assert');
const { lib } = require('./harness');
const { FormGroupRef } = lib('EAForm');
const { setLang } = lib('utils/translate');
const ok = msg => console.log('OK ' + msg);

const err = (rules, value, extra = {}) => {
  const form = new FormGroupRef({ campo: [null, rules], ...extra });
  form.setControlValue('campo', value);
  return form.controls.campo.error;
};
const valido = (rules, ...values) => values.forEach(v => assert.equal(err(rules, v), '', JSON.stringify(rules) + ' debería aceptar ' + JSON.stringify(v)));
const invalido = (rules, ...values) => values.forEach(v => assert.notEqual(err(rules, v), '', JSON.stringify(rules) + ' debería rechazar ' + JSON.stringify(v)));

(async () => {
  await setLang('es');
  valido({ integer: true }, '12', '-3', 7); invalido({ integer: true }, '1.5', 'a', '1,2');
  valido({ positive: true }, '1', '0,5', 3); invalido({ positive: true }, '0', '-2', 'x');
  valido({ min: 18, max: 65 }, '18', 30, '65'); invalido({ min: 18 }, '17'); invalido({ max: 65 }, '66');
  assert.equal(err({ min: 18 }, '10'), 'El valor mínimo es 18');
  valido({ maxLength: 5 }, 'hola', 'hola!'); invalido({ maxLength: 5 }, 'demasiado');
  valido({ phone: true }, '+34 612 345 678', '(01) 234-5678', '612345678'); invalido({ phone: true }, '12345', 'abc1234567', '+1234567890123456');
  valido({ url: true }, 'https://easynat.dev', 'www.google.com/search?q=1', 'http://localhost.com:8080'); invalido({ url: true }, 'no es url', 'http://', 'hola.c');
  valido({ alpha: true }, 'José Ñandú', 'María'); invalido({ alpha: true }, 'Ana1', 'a_b');
  valido({ alphanumeric: true }, 'Calle 12', 'Ñu3'); invalido({ alphanumeric: true }, 'a-b', 'hola!');
  valido({ minItems: 2, maxItems: 3 }, [1, 2], [1, 2, 3]); invalido({ minItems: 2 }, [1]); invalido({ maxItems: 3 }, [1, 2, 3, 4]);
  ok('integer, positive, min, max, maxLength, phone, url, alpha, alphanumeric, minItems y maxItems');

  // Archivos: por extensión o tipo MIME; texto, objeto del selector o lista
  valido({ fileTypes: ['png', '.jpg'] }, 'foto.png', 'file:///a/b/FOTO.JPG', { uri: 'file:///x/y.png?x=1' }, [{ name: 'a.png' }, { name: 'b.jpg' }]);
  invalido({ fileTypes: ['png'] }, 'video.mp4', [{ name: 'a.png' }, { name: 'b.gif' }]);
  valido({ fileTypes: ['image/*', 'application/pdf'] }, { uri: 'x', mimeType: 'image/jpeg' }, { name: 'doc', type: 'application/pdf' });
  invalido({ fileTypes: ['image/*'] }, { uri: 'x', mimeType: 'video/mp4' });
  valido({ maxFileSize: 1024 * 1024 }, { name: 'a.png', size: 500000 }, { uri: 'a', fileSize: 1048576 }, 'sin-tamaño.png');
  invalido({ maxFileSize: 1024 * 1024 }, { name: 'a.png', size: 2000000 });
  assert.equal(err({ fileTypes: ['png', 'jpg'] }, 'a.gif'), 'Tipo de archivo no permitido (png, jpg)');
  assert.equal(err({ maxFileSize: 5 * 1024 * 1024 }, { size: 6e6 }), 'El archivo es demasiado grande (máx. 5 MB)');
  ok('fileTypes (extensión, MIME, comodín, objeto del selector y listas) y maxFileSize');

  // sameAs y revalidación del dependiente
  {
    const form = new FormGroupRef({ password: ['', { required: true }], confirmar: ['', { sameAs: 'password' }] });
    form.setControlValue('password', 'secreto');
    form.setControlValue('confirmar', 'secreto');
    assert.equal(form.controls.confirmar.error, '');
    form.setControlValue('password', 'otro');
    assert.equal(form.controls.confirmar.error, 'Los valores no coinciden', 'al cambiar la contraseña, confirmar se revalida');
    form.setControlValue('password', 'secreto');
    assert.equal(form.controls.confirmar.error, '', 'y al volver a coincidir, el error se quita');
    ok('sameAs y revalidación del campo dependiente');
  }

  // Mensajes propios y en inglés
  assert.equal(err({ required: true, messages: { required: 'Pon tu nombre' } }, ''), 'Pon tu nombre');
  assert.equal(err({ min: 18, messages: { min: 'Mínimo {{min}} años' } }, '3'), 'Mínimo 18 años');
  await setLang('en');
  assert.equal(err({ phone: true }, '123'), 'Invalid phone number');
  await setLang('es');
  ok('messages propios (con parámetros) y textos en inglés');
})().catch(e => { console.error('FALLO', e); process.exit(1) });
