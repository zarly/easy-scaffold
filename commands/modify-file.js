const fs = require('fs');
const clc = require('chalk');
const { resolveFile } = require('../utils');

module.exports = {
    name: 'modify-file',
    detect (entity) {
        return Boolean(entity.file && entity.modify);
    },
    async execute (entity, { cwd, configDir, data }) {
        const filename = resolveFile(entity.file, configDir, cwd);
        console.log('modify file:', clc.blackBright(filename));
        
        const input = await fs.promises.readFile(filename, { encoding: 'utf8' });
        const output = await entity.modify(input, data);
        await fs.promises.writeFile(filename, output, { encoding: 'utf8' });
    },
    async revert (entity, { cwd, configDir, data }) {
        const filename = resolveFile(entity.file, configDir, cwd);
        console.log('revert modify file:', clc.blackBright(filename));
        
        const input = await fs.promises.readFile(filename, { encoding: 'utf8' });
        const output = await entity.revert(input, data);
        await fs.promises.writeFile(filename, output, { encoding: 'utf8' });
    },
};
