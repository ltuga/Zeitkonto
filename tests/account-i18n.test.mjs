import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';
const { translate } = await loadTs('tests/account-i18n-entry.ts');

test('account translations load on the server and translate the delete action', () => {
  for (const [lang, expected] of Object.entries({
    pt: 'Eliminar conta', de: 'Konto löschen', en: 'Delete account', tr: 'Hesabı sil',
  })) assert.equal(translate(lang, 'Eliminar conta'), expected);
  assert.equal(translate('en', 'Não foi possível terminar sessão em segurança. Tenta novamente.'),
    'Could not sign out safely. Please retry.');
});
