
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

exports.ask = async function ask (question) {
    return new Promise(function (resolve) {
        readline.question(question, answer => {
            readline.close();
            resolve(answer);
          });
    });
};
