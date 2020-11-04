'use strict';
require('./string');
const path = require('path');
const clc = require('cli-color');
const { resolveCwd, resolveConfigFile, resolveAndCheckConfigFileName } = require('./utils');
const { ask } = require('./requestor');
const commands = require('./commands');

async function prepare(configName, args, originalCwd) {
    const cwd = resolveCwd(originalCwd);
    const configFileName = await resolveAndCheckConfigFileName(configName, cwd);
    const configDir = path.dirname(configFileName);
    
    console.log('cwd:', clc.blackBright(cwd));
    console.log('config:', clc.blackBright(configFileName));
    const { getConfig } = require(configFileName);
    
    const config = await getConfig(args, cwd);
    const data = 'function' === typeof config.data ? await config.data() : (config.data || args);
    console.log('data:', clc.blackBright(JSON.stringify(data)));

    const required = config.required || [];
    for (let i = 0; i < required.length; i++) {
        const varName = required[i];
        if (data[varName] === undefined) {
            console.warn(clc.yellow(`Не объявлена обязательная переменная "${varName}"`));
            const value = await ask(`${varName}:`);
            console.log(clc.blackBright(`${varName} = ${JSON.stringify(value)}`));
            data[varName] = value;
            console.log('data:', clc.blackBright(JSON.stringify(data)));
        }
    }
    return { config, data, cwd, configDir };
}

async function scaffold (configName, args, originalCwd, options = {}) {
    const { config, data, cwd, configDir } = await prepare(configName, args, originalCwd);
    for (let i = 0; i < config.entities.length; i++) {
        const entity = config.entities[i];
        if (!entity) continue; // пропускаем шаг, если передан null или undefined (чтобы можно было пропускать шаги тернарным оператором при их написании) 

        let isEntityHandled = false;
        for (let n = 0; n < commands.length; n++) {
            const command = commands[n];
            if (command.detect(entity)) {
                if (!options.revert) {
                    await command.execute(entity, { cwd, configDir, data, scaffold });
                } else {
                    if (command.revert) {
                        await command.revert(entity, { cwd, configDir, data, scaffold });
                    } else {
                        console.warn(clc.yellow(`Не определён revert для команды "${command.name}"`));
                    }
                }
                isEntityHandled = true;
                break;
            }
        }
        if (!isEntityHandled) {
            throw new Error('Unexpected format of entity:', entity);
        }
    }
}

async function revert (configName, args, cwd, options) {
    return await scaffold(configName, args, cwd, { ...options, revert: true });
}

module.exports = scaffold;
module.exports.revert = revert;
module.exports.resolveConfigFile = resolveConfigFile;
