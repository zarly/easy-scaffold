const clc = require('chalk');

module.exports = {
    name: 'scaffold',
    detect (entity) {
        return Boolean(entity.scaffold);
    },
    async execute (entity, { cwd, scaffold, options }) {
        console.log('scaffold exec:', clc.blackBright(entity.scaffold));
        await scaffold(
            entity.scaffold,
            entity.args,
            {
                ...options,
                cwd: entity.cwd || cwd,
            }
        );
        console.log('scaffold done:', clc.blackBright(entity.scaffold));
    },
    async revert (entity, { cwd, scaffold, options }) {
        console.log('revert scaffold exec:', clc.blackBright(entity.scaffold));
        await scaffold.revert(
            entity.scaffold,
            entity.args,
            {
                ...options,
                cwd: entity.cwd || cwd,
            }
        );
        console.log('revert scaffold done:', clc.blackBright(entity.scaffold));
    },
};
