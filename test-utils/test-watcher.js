const chokidar = require('chokidar');
const fs = require('fs');
const exec = require('child_process').exec;
const spawn = require('child_process').spawnSync;
 
const watcher = chokidar.watch('build/dev/js/**/*.js');

let runTestInterval = null;
let testIsRunning = false;
let testPaths = [];

function runTest() {
  // getting list of distinct elements
  const paths = testPaths.filter((x, i, a) => a.indexOf(x) == i);
  testPaths = [];

  // Allow to test only one file
  if (paths.length === 1) {
    const filter = paths[0];
  
    let env = process.env;
    env.TEST_FILTER = filter;
    env.OUTPUT_FOLDER = 'build/dev/js'

    console.log(" # running tests");

    testIsRunning = true;

    try {
      const test = spawn('node', ['test-utils/node_runner.js'], {
          cwd: process.cwd(),
          env: env,
          stdio: 'inherit'
      });
    } catch(err) {
      console.log(err);
    }
    finally {
      testIsRunning = false;
    }

    console.log(" # waiting for changes");
  }
}

function requestTestToRun() {
  if (runTestInterval !== null) {
    clearTimeout(runTestInterval);
  }

  runTestInterval = setTimeout(runTest, 500);
}

watcher.on('change', (path) => {
  if (testIsRunning) {
    return;
  }

  if (path.indexOf('build/dev/js/Test') === -1) {
    let testPath = path.replace('build/dev/js', 'build/dev/js/Test/Unit');
    testPath = testPath.replace('.js', 'Test.js');

    if (!fs.existsSync(testPath)) {
      return;
    }

    path = testPath;
  }

  testPaths.push(path);
  requestTestToRun();
});

console.log(" # waiting for changes");