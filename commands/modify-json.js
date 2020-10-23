const fs = require('fs');
const clc = require('cli-color');
const { resolveFile } = require('../utils');

module.exports = {
    detect (entity) {
        return Boolean(entity.json && entity.modify);
    },
    async execute (entity, { cwd, configDir, data }) {
        const filename = resolveFile(entity.json, configDir, cwd);
        console.log('modify json:', clc.blackBright(filename));
        
        const inputText = await fs.promises.readFile(filename, { encoding: 'utf8' });
        const inputJson = JSON.parse(inputText);
        const outputJson = await entity.modify(inputJson, data);
        const outputText = JSON.stringify(outputJson, null, 2);
        await fs.promises.writeFile(filename, outputText, { encoding: 'utf8' });
    },
};
