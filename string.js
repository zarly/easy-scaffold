
const camelCase = require('lodash/camelCase');
const snakeCase = require('lodash/snakeCase');
const kebabCase = require('lodash/kebabCase');
const lowerCase = require('lodash/lowerCase');
const upperCase = require('lodash/upperCase');
const upperFirst = require('lodash/upperFirst');

function constCase (str) {
    return upperCase(str).replace(/ /g, '_');
}

function classCase (str) {
    return upperFirst(camelCase(str));
}

const pipes = {
    camelCase,
    snakeCase,
    kebabCase,
    lowerCase,
    upperCase,
    constCase,
    classCase,
};

function defineProp (name) {
    const fn = pipes[name];
    Object.defineProperty(Object.prototype, name, {
        get () {
            return fn(this);
        }
    });
}

Object.keys(pipes).forEach(defineProp);
