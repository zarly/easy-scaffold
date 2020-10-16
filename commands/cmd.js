const clc = require('cli-color');
const execSync = require('child_process').execSync;

module.exports = {
    detect (entity) {
        return Boolean(entity.cmd);
    },
    async execute (entity, { cwd }) {
        console.log('command:', clc.blackBright(entity.cmd));
        execSync(entity.cmd, { 
            stdio: 'inherit',
            cwd: entity.cwd || cwd,
        });
    },
};
