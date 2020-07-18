
const fs = require('fs');
const ejs = require('ejs');
var clc = require("cli-color");
const { ask } = require('./requestor');

exports.handleTemplate = function handleTemplate (input, output, data, options = {}) {
    return new Promise(function (resolve) {
        fs.readFile(input, { encoding: 'utf-8' }, async function onRead (readError, inputText) {
            if (readError) throw readError;
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
    
            fs.writeFile(output, outputText, function onWrite (writeError) {
                if (writeError) throw writeError;
                resolve();
            });
        });
    });
}
