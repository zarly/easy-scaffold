const fs = require('fs');
const clc = require('chalk');
const { resolveFile } = require('../utils');

module.exports = {
    name: 'modify-json',
    detect (entity) {
        return Boolean(entity.json && entity.modify);
    },
    async execute (entity, { cwd, configDir, data }) {
        const filename = resolveFile(entity.json, configDir, cwd);
        console.log('modify json:', clc.blackBright(filename));
        
        const inputText = await fs.promises.readFile(filename, { encoding: 'utf8' });
        const inputJson = JSON.parse(inputText);
        const outputJson = await entity.modify(inputJson, data);
        const outputText = JSON.stringify(outputJson || inputJson, null, 2);
        await fs.promises.writeFile(filename, outputText, { encoding: 'utf8' });
    },
    async revert (entity, { cwd, configDir, data }) {
        const filename = resolveFile(entity.json, configDir, cwd);
        console.log('revert modify json:', clc.blackBright(filename));
        
        const inputText = await fs.promises.readFile(filename, { encoding: 'utf8' });
        const inputJson = JSON.parse(inputText);
        const outputJson = await entity.revert(inputJson, data);
        const outputText = JSON.stringify(outputJson || inputJson, null, 2);
        await fs.promises.writeFile(filename, outputText, { encoding: 'utf8' });
    },
};
