const fs = require('fs');
const path = require('path');

let getPaths = (root) => {
    let paths = [];
    fs.readdirSync(root).forEach((file) => {
        let fullPath = path.join(root, file);
        if (fs.statSync(fullPath).isDirectory()) {
            paths = paths.concat(getPaths(fullPath));
        } else if(fullPath.indexOf('.js') !== -1) {
            paths.push(fullPath.replace('src/ts/', '').replace('.js', ''));
        }
    });
    return paths;
};

let testList = JSON.stringify(getPaths('src/ts/Test'));
console.log(testList);

let runnerPath = process.env.BUILD_DIR + '/runner.js';

let options = {encoding: 'utf-8'};
let runnerTemplate = fs.readFileSync(runnerPath, options);
fs.writeFileSync(runnerPath, runnerTemplate.replace('{TEST_LIST}', testList), options);
