#!/usr/bin/env node

var clc = require('cli-color');
const yargs = require('yargs').argv;
const scaffold = require('./index');


const {_: cmds, $0, ...args} = yargs;
const configName = cmds[0];
scaffold(configName, args, process.cwd()).then(function () {
    console.log(clc.green.bold('Завершено успешно!'));
    process.exit(0);
}).catch(function () {
    console.warn(clc.red.bold('Завершено с ошибками!'));
    process.exit(1);
});
