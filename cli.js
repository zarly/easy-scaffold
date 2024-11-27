#!/usr/bin/env node

var clc = require('chalk');
const yargs = require('yargs').argv;
const scaffold = require('./index');


const {_: cmds, $0, ...args} = yargs;
const configName = cmds[0];
const options = { cwd: process.cwd() };
scaffold(configName, args, options).then(function () {
    console.log(clc.green.bold('Завершено успешно!'));
    process.exit(0);
}).catch(function (error) {
    console.warn(error);
    console.warn(clc.red.bold('Завершено с ошибками!'));
    process.exit(1);
});
