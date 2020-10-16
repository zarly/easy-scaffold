const clc = require('cli-color');
const { resolveFile, ensureParentDirsExist, ensureDirsExist, isDir } = require('../utils');
const { handleTemplateDir, handleTemplateFile } = require('../templator');

module.exports = {
    detect (entity) {
        return Boolean(entity.input && entity.output);
    },
    async execute (entity, { cwd, configDir, data }) {
        const resolvedInput = resolveFile(entity.input, configDir, cwd);
        const resolvedOutput = resolveFile(entity.output, configDir, cwd);

        if (await isDir(resolvedInput)) {
            console.log(clc.blackBright(resolvedInput), '*=>', clc.blackBright(resolvedOutput));
            await ensureDirsExist(resolvedOutput);
            await handleTemplateDir(resolvedInput, resolvedOutput, data);
        } else {
            console.log(clc.blackBright(resolvedInput), '=>', clc.blackBright(resolvedOutput));
            await ensureParentDirsExist(resolvedOutput);
            await handleTemplateFile(resolvedInput, resolvedOutput, data);
        }
    },
};
