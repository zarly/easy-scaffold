
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
var clc = require("cli-color");
const { ask } = require('./requestor');

const defaultOptions = {
    escape (data) {
        return JSON.stringify(data);
    }
};

const templateRegExp = /\.ejs$/;

function isTemplateFile (filename) {
    return templateRegExp.test(filename);
}

function withoutTemplateExt (filename) {
    return filename.replace(templateRegExp, '');
}

async function handleTemplateDir (input, output, data, options = defaultOptions) {
    const children = await fs.promises.readdir(input, { withFileTypes: true });
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const newInput = path.join(input, child.name);
        const newOutput = path.join(output, child.name);
        if (child.isDirectory()) {
            await fs.promises.mkdir(newOutput, { recursive: true });
            await handleTemplateDir(newInput, newOutput, data, options);
        } else if (child.isFile()) {
            if (isTemplateFile(newInput)) {
                await handleTemplateFile(newInput, withoutTemplateExt(newOutput), data, options);
            } else {
                await handlePlainFile(newInput, newOutput);
            }
        } else {
            console.warn(clc.yellow(`Неожиданный тип объекта "${path.join(input, child.name)}", ожидается файл или папка`));            
        }
    }
}
exports.handleTemplateDir = handleTemplateDir;

async function handleTemplateFile (input, output, data, options = defaultOptions) {
    const inputText = await fs.promises.readFile(input, { encoding: 'utf-8' });
    let outputText;

    while (true) {
        try {
            outputText = ejs.render(inputText, data, options);
            break;
        } catch (e) {
            if (e instanceof ReferenceError && 'string' === typeof e.message) {
                const match = e.message.match(/(\w+) is not defined/);
                if (match && match[0] && match[1]) {
                    const varName = match[1];
                    console.warn(clc.yellow(`Переменная "${varName}", используемая в шаблоне ${input}, не объявлена`));
                    const value = await ask(`${varName}:`);
                    console.log(clc.blackBright(`${varName} = ${JSON.stringify(value)}`));
                    data[varName] = value;
                } else {
                    throw e;
                }
            } else {
                throw e;
            }
        }
    }

    await fs.promises.writeFile(output, outputText);
}
exports.handleTemplateFile = handleTemplateFile;

async function handlePlainFile (input, output) {
    const code = await fs.promises.readFile(input, { encoding: 'utf-8' });
    await fs.promises.writeFile(output, code);
}
exports.handlePlainFile = handlePlainFile;
