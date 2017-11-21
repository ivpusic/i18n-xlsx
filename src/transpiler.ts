import * as xlsx from 'xlsx';
import * as hbs from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface ISheet {
  codes: string[];
  map?: { [key: string]: { [key: string]: string } };
}

export interface IModel {
  sheets: { [key: string]: ISheet };
  languages: string[];
}

export interface IGolangOptions {
  module: string;
}

export interface ITypescriptOptions {
}

export default class Transpiler {

  public supportedLanguages = [
    'typescript',
    'golang',
  ];

  public readDsl = async (name: string) => {
    return await new Promise((resolve, reject) => {
      fs.readFile(path.resolve(__dirname, `dsl/${name}.hbs`), (err, source) => {
        if (err) {
          reject(err);
        } else {
          resolve(source.toString());
        }
      });
    });
  }

  public loadModel = (file: string): IModel => {
    const workbook = xlsx.readFile(file);
    const response: IModel = {
      sheets: {},
      languages: [],
    };

    const languages = new Set();

    workbook.SheetNames.forEach((sheetName: string) => {
      const content: any[] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      const sheet: ISheet = {
        codes: content.map((c) => c.code),
        map: {},
      };

      Object.keys(content[0])
        .filter((key) => key !== 'code')
        .forEach((lang: string) => {
          languages.add(lang);
        });

      content.forEach((row: any) => {
        languages.forEach((lang: string) => {
          sheet.map[lang] = sheet.map[lang] || {};
          sheet.map[lang][row.code] = row[lang];
        });
      });

      response.sheets[sheetName] = sheet;
    });

    response.languages = Array.from(languages);
    return response;
  }

  public transpile = async (file: string, lang: string, options: IGolangOptions | ITypescriptOptions): Promise<string> => {
    if (!this.supportedLanguages.some((x) => x === lang)) {
      throw new Error(`
        Language "${lang}" is not yet supported.
        You can help us to support it by creating DSL file for it.
      `);
    }

    const data = await this.loadModel(file);
    const dsl = await this.readDsl(lang);
    return hbs.compile(dsl)({
      data,
      options,
    });
  }
}
