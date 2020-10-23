const fs = require('fs');
const clc = require('cli-color');
const { resolveFile } = require('../utils');

module.exports = {
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
};
