const fs = require('fs');
const path = require('path');

const ES_TEMPLATES_PATH = process.env.ES_TEMPLATES_PATH;

function resolveCwd (cwd) {
    return cwd === undefined ? process.cwd() :
        path.isAbsolute(cwd) ? cwd : path.resolve(process.cwd(), cwd);
}

async function isFileExisit (filename) {
    const stat = await fs.promises.stat(filename).catch(() => false);
    return Boolean(stat && stat.isFile());
}

async function resolveAndCheckConfigFileName (filename, cwd, templatePaths = []) {
    const configPath = await resolveConfigFile(filename, cwd, templatePaths);
    if (!configPath) throw new Error(`Config file with name "${filename}" was not found in ${templatePaths}`);
    const ext = path.extname(configPath);
    return ext === '.js' ? configPath : path.join(configPath, 'index.js');
}

async function resolveConfigFile (filename, cwd, templatePaths = []) {
    if (path.isAbsolute(filename)) return path.resolve(filename);

    if (filename.indexOf('.') === -1) {
        if (ES_TEMPLATES_PATH && await isFileExisit(path.resolve(ES_TEMPLATES_PATH, filename, 'index.js'))) {
            return path.resolve(ES_TEMPLATES_PATH, filename, 'index.js');
        }

        const paths = [cwd].concat(templatePaths).filter(it => it);
        for(let i = 0; i < paths.length; i++) {
            const dir = paths[i];
            if (await isFileExisit(path.resolve(dir, 'templates', filename, 'index.js'))) {
                return path.resolve(dir, 'templates', filename, 'index.js');
            }
        }
    }

    if (await isFileExisit(path.resolve(cwd, filename))) {
        return path.resolve(cwd, filename);
    }

    return null;
}

function resolveFile (filename, defaultDir, cwd) {
    return path.isAbsolute(filename) ? path.resolve(filename) : 
        filename[0] === '@' ? filename.replace(/^@/, cwd) :
        path.resolve(defaultDir, filename);
}

function ensureParentDirsExist (filename) {
    const parentDir = path.dirname(filename);
    return fs.promises.mkdir(parentDir, { recursive: true });
}

function ensureDirsExist (dirname) {
    return fs.promises.mkdir(dirname, { recursive: true });
}

async function isDir (path) {
    const stat = await fs.promises.stat(path);
    return stat.isDirectory();
}

module.exports = {
    resolveCwd,
    isFileExisit,
    resolveAndCheckConfigFileName,
    resolveConfigFile,
    resolveFile,
    ensureParentDirsExist,
    ensureDirsExist,
    isDir,
};
