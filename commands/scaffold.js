const clc = require('cli-color');

module.exports = {
    name: 'scaffold',
    detect (entity) {
        return Boolean(entity.scaffold);
    },
    async execute (entity, { cwd, scaffold }) {
        console.log('scaffold exec:', clc.blackBright(entity.scaffold));
        await scaffold(entity.scaffold, entity.args, entity.cwd || cwd);
        console.log('scaffold done:', clc.blackBright(entity.scaffold));
    },
    async revert (entity, { cwd, scaffold }) {
        console.log('revert scaffold exec:', clc.blackBright(entity.scaffold));
        await scaffold.revert(entity.scaffold, entity.args, entity.cwd || cwd);
        console.log('revert scaffold done:', clc.blackBright(entity.scaffold));
    },
};
