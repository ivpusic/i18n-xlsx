import * as path from 'path';
import * as fs from 'fs';

import { assert } from 'chai';

import Transpiler from '../src/transpiler';

describe('transpiler', () => {

  const mockExcel = path.resolve(__dirname, 'mock/i18n.xlsx');

  it('can load model', async () => {
    const transpiler = new Transpiler();
    const model = transpiler.loadModel(path.resolve(__dirname, 'mock/i18n.xlsx'));
    assert.equal(model.languages.length, 2);
    assert.equal(model.sheets[Object.keys(model.sheets)[0]].codes.length, 2);
  });

  it('can read dsl file', async () => {
    const transpiler = new Transpiler();
    const dsl = await transpiler.readDsl('typescript');
    assert.equal(dsl, fs.readFileSync(path.resolve(__dirname, '..', 'src/dsl/typescript.hbs')).toString('utf-8'));
  });

  it('can transpile typescript', async () => {
    const transpiler = new Transpiler();
    const transpiled = await transpiler.transpile(mockExcel, 'typescript', {});
    assert.isTrue(transpiled.length > 0);
    // todo: validate ts code
  });

  it('can transpile golang', async () => {
    const transpiler = new Transpiler();
    const transpiled = await transpiler.transpile(mockExcel, 'golang', {
      module: 'test',
    });
    assert.isTrue(transpiled.length > 0);
    // todo: validate golang code
  });
});
