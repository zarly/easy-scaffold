const clc = require('cli-color');
const execSync = require('child_process').execSync;

module.exports = {
    name: 'cmd',
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
    async revert (entity, { cwd }) {
        console.log('revert command:', clc.blackBright(entity.cmd));
        execSync(entity.revert, { 
            stdio: 'inherit',
            cwd: entity.cwd || cwd,
        });
    },
};
