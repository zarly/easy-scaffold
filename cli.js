#!/usr/bin/env node

require('./string');
const path = require('path');
var clc = require('cli-color');
const yargs = require('yargs').argv;
const { handleTemplate } = require('./templator');

function resolveFile (filename, defaultDir, cwd) {
    return path.isAbsolute(filename) ? path.resolve(filename) : 
        filename[0] === '@' ? filename.replace(/^@/, cwd) :
        path.resolve(path.join(defaultDir, filename));
}

async function main () {
    const {_: cmds, $0, ...args} = yargs;
    const cwd = process.cwd();
    const firstArg = cmds[0];
    const configPath = resolveFile(firstArg, cwd, cwd);
    const ext = path.extname(configPath);
    const configFileName = ext === '.js' ? configPath : path.join(configPath, 'index.js');
    const configDir = path.dirname(configFileName);
    
    console.log('config:', clc.blackBright(configFileName));
    const { getConfig } = require(configFileName);
    
    const config = await getConfig(args);
    const data = await config.data();
    console.log('data:', clc.blackBright(JSON.stringify(data)));
    
    for (let i = 0; i < config.entities.length; i++) {
        const { input, output } = config.entities[i];
        const resolvedInput = resolveFile(input, configDir, cwd);
        const resolvedOutput = resolveFile(output, configDir, cwd);
        console.log(clc.blackBright(resolvedInput), '=>', clc.blackBright(resolvedOutput));
        await handleTemplate(resolvedInput, resolvedOutput, data);
    }
}

main().then(function () {
    console.log(clc.green.bold('Завершено успешно!'));
    process.exit(0);
}).catch(function () {
    console.warn(clc.red.bold('Завершено с ошибками!'));
    process.exit(1);
});
