
require('./string');
const fs = require('fs');
const path = require('path');
var clc = require('cli-color');
const { ask } = require('./requestor');
const execSync = require('child_process').execSync;
const { handleTemplateDir, handleTemplateFile } = require('./templator');

function resolveFile (filename, defaultDir, cwd) {
    return path.isAbsolute(filename) ? path.resolve(filename) : 
        filename[0] === '@' ? filename.replace(/^@/, cwd) :
        path.resolve(path.join(defaultDir, filename));
}

function ensureParentDirsExist (filename) {
    const parentDir = path.dirname(filename);
    return fs.promises.mkdir(parentDir, { recursive: true });
}

function ensureDirsExist (dirname) {
    return fs.promises.mkdir(dirname, { recursive: true });
}

async function isDir (path) {
    const stat = await fs.promises.stat(path);
    return stat.isDirectory();
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

            if (await isDir(resolvedInput)) {
                console.log(clc.blackBright(resolvedInput), '*=>', clc.blackBright(resolvedOutput));
                await ensureDirsExist(resolvedOutput);
                await handleTemplateDir(resolvedInput, resolvedOutput, data);
            } else {
                console.log(clc.blackBright(resolvedInput), '=>', clc.blackBright(resolvedOutput));
                await ensureParentDirsExist(resolvedOutput);
                await handleTemplateFile(resolvedInput, resolvedOutput, data);
            }
        } else if (cmd) {
            console.log('command:', clc.blackBright(cmd));
            execSync(cmd, { stdio: 'inherit', cwd });
        } else if (entity.scaffold) {
            console.log('scaffold exec:', clc.blackBright(entity.scaffold));
            await scaffold(entity.scaffold, entity.args, entity.cwd || cwd);
            console.log('scaffold done:', clc.blackBright(entity.scaffold));
        } else {
            throw new Error('Unexpected format of entity:', entity);
        }
    }
}
