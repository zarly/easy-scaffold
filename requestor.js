const readline = require('readline');

exports.ask = async function ask (question) {
    return new Promise(function (resolve) {
        const reader = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        reader.question(question, answer => {
            reader.close();
            resolve(answer);
        });
    });
};
