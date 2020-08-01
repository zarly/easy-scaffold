
require('./string');
const path = require('path');
var clc = require('cli-color');
const { handleTemplate } = require('./templator');

function resolveFile (filename, defaultDir, cwd) {
    return path.isAbsolute(filename) ? path.resolve(filename) : 
        filename[0] === '@' ? filename.replace(/^@/, cwd) :
        path.resolve(path.join(defaultDir, filename));
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
    
    for (let i = 0; i < config.entities.length; i++) {
        const { input, output } = config.entities[i];
        const resolvedInput = resolveFile(input, configDir, cwd);
        const resolvedOutput = resolveFile(output, configDir, cwd);
        console.log(clc.blackBright(resolvedInput), '=>', clc.blackBright(resolvedOutput));
        await handleTemplate(resolvedInput, resolvedOutput, data);
    }
}
