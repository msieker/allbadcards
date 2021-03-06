'use strict';
const path = require('path');
const fs = require('fs-extra');

const appDirectory = fs.realpathSync(process.cwd());
const resolve = relativePath => path.resolve(appDirectory, relativePath);
const output = resolve("output");
const clientBuild = resolve("client/build");
const clientOutput = resolve("output/client");

function copyOutput() {
    fs.copySync(clientBuild, clientOutput, {
        dereference: true
    });
}

const finalize = () => {
    copyOutput();
    fs.mkdir(path.resolve(output, "server/config"));
    fs.mkdir(path.resolve(output, "server/data"));
    fs.copyFileSync(resolve("server/config/keys.json"), path.resolve(output, "server/config/keys.json"));
    fs.copySync(resolve("server/data"), path.resolve(output, "server/data"));
};

module.exports = {
    finalize
};