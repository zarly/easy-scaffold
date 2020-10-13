
require('./string');
const fs = require('fs');
const path = require('path');
var clc = require('cli-color');
const { ask } = require('./requestor');
const execSync = require('child_process').execSync;
const { handleTemplateDir, handleTemplateFile } = require('./templator');

const ES_TEMPLATES_PATH = process.env.ES_TEMPLATES_PATH;

async function isFileExisit (filename) {
    const stat = await fs.promises.stat(filename).catch(() => false);
    return Boolean(stat && stat.isFile());
}

async function resolveConfigFile (filename, cwd) {
    if (path.isAbsolute(filename)) return path.resolve(filename);
    
    if (filename.indexOf('.') === -1) {
        if (ES_TEMPLATES_PATH && await isFileExisit(path.resolve(ES_TEMPLATES_PATH, filename))) {
            return path.resolve(ES_TEMPLATES_PATH, filename);
        }
    
        if (await isFileExisit(path.resolve(cwd, 'templates', filename, 'index.js'))) {
            return path.resolve(cwd, 'templates', filename, 'index.js');
        }
    }

    if (await isFileExisit(path.resolve(cwd, filename))) {
        return path.resolve(cwd, filename);
    }

    return null;
}

function resolveFile (filename, defaultDir, cwd) {
    return path.isAbsolute(filename) ? path.resolve(filename) : 
        filename[0] === '@' ? filename.replace(/^@/, cwd) :
        path.resolve(defaultDir, filename);
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
    cwd = cwd === undefined ? process.cwd() :
        path.isAbsolute(cwd[0]) ? cwd : path.resolve(process.cwd(), cwd);
    const configPath = await resolveConfigFile(configName, cwd);
    if (!configPath) throw new Error(`Config file with name "${configName}" was not found`);
    const ext = path.extname(configPath);
    const configFileName = ext === '.js' ? configPath : path.join(configPath, 'index.js');
    const configDir = path.dirname(configFileName);
    
    console.log('cwd:', clc.blackBright(cwd));
    console.log('config:', clc.blackBright(configFileName));
    const { getConfig } = require(configFileName);
    
    const config = await getConfig(args, cwd);
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
            execSync(cmd, { 
                stdio: 'inherit', 
                cwd: entity.cwd || cwd,
            });
        } else if (entity.scaffold) {
            console.log('scaffold exec:', clc.blackBright(entity.scaffold));
            await scaffold(entity.scaffold, entity.args, entity.cwd || cwd);
            console.log('scaffold done:', clc.blackBright(entity.scaffold));
        } else {
            throw new Error('Unexpected format of entity:', entity);
        }
    }

}

module.exports.resolveConfigFile = resolveConfigFile;
