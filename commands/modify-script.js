const fs = require('fs');
const clc = require('cli-color');
const ts = require('typescript');
const { resolveFile } = require('../utils');

// Doc hints:
// https://blog.scottlogic.com/2017/05/02/typescript-compiler-api-revisited.html

module.exports = {
    detect (entity) {
        return Boolean(entity.script && entity.modify);
    },
    async execute (entity, { cwd, configDir, data }) {
        const filename = resolveFile(entity.script, configDir, cwd);
        console.log('modify script:', clc.blackBright(filename));
        
        const inputText = await fs.promises.readFile(filename, { encoding: 'utf8' });
        const inputFile = ts.createSourceFile(filename, inputText, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
        const outputFile = await entity.modify(inputFile, data, ts);
        const outputText = ts.createPrinter().parseFile(outputFile);
        await fs.promises.writeFile(filename, outputText, { encoding: 'utf8' });
    },
};
