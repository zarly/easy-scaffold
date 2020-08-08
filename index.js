
require('./string');
const fs = require('fs');
const path = require('path');
var clc = require('cli-color');
const { ask } = require('./requestor');
const execSync = require('child_process').execSync;
const { handleTemplate } = require('./templator');

function resolveFile (filename, defaultDir, cwd) {
    return path.isAbsolute(filename) ? path.resolve(filename) : 
        filename[0] === '@' ? filename.replace(/^@/, cwd) :
        path.resolve(path.join(defaultDir, filename));
}

function ensureParentDirsExist (filename) {
    const parentDir = path.dirname(filename);
    return fs.promises.mkdir(parentDir, { recursive: true });
}

module.exports = async function scaffold (configName, args, cwd) {
    cwd = cwd === undefined ? process.cwd() : cwd;
    const configPath = resolveFile(configName, cwd, cwd);
    const ext = path.extname(configPath);
    const configFileName = ext === '.js' ? configPath : path.join(configPath, 'index.js');
    const configDir = path.dirname(configFileName);
    
    console.log('config:', clc.blackBright(configFileName));
    const { getConfig } = require(configFileName);
    
    const config = await getConfig(args);
    const data = config.data ? await config.data() : args;
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
    
    for (let i = 0; i < config.entities.length; i++) {
        const entity = config.entities[i];
        const { input, output, cmd } = entity;
        if (input && output) {
            const resolvedInput = resolveFile(input, configDir, cwd);
            const resolvedOutput = resolveFile(output, configDir, cwd);
            console.log(clc.blackBright(resolvedInput), '=>', clc.blackBright(resolvedOutput));
            await ensureParentDirsExist(resolvedOutput);
            await handleTemplate(resolvedInput, resolvedOutput, data);
        } else if (cmd) {
            console.log('command:', clc.blackBright(cmd));
            execSync(cmd, { stdio: 'inherit', cwd });
        } else {
            throw new Error('Unexpected format of entity:', entity);
        }
    }
}
