#!/usr/bin/env node

import * as path from 'path';
import * as fs from 'fs';

import * as program from 'commander';

const packageJson = require('../../package.json');
import Transpiler from '../transpiler';

function languageFromExt(file: string) {
  switch (path.extname(file)) {
    case '.ts': return 'typescript';
    case '.go': return 'golang';
  }
}

async function main() {
  program
    .version(packageJson.version)
    .option('-i, --input <excel>', 'Excel file to process')
    .option('-o, --output <file>', 'Transpiled i18n file destination')
    .option('-l --language <lang>', 'Transpilation language. Currently supported: golang, typescript')
    .option('-m --module <module>', 'Golang module when using Go language', 'i18n')
    .parse(process.argv);

  if (!program.input || !program.output) {
    return program.outputHelp();
  }

  const language = program.language || languageFromExt(program.output);
  if (!language) {
    return program.outputHelp();
  }

  const transpiler = new Transpiler();
  const i18n = await transpiler.transpile(path.resolve(program.input), language, {
    module: program.module,
  });

  fs.writeFileSync(path.resolve(program.output), i18n, {
    encoding: 'utf-8',
  });
}

main().catch((e) => {
  console.log('Error', e);
});
