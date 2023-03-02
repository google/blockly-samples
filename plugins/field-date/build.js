const {execSync} = require('child_process');

/**
 * This script exists as a wrapper around the `gulp build` command in order to
 * allow it to be compatible with `blockly-scripts build` in terms of its
 * handling of the `-- --skip-lint` flag.
 */
if (process.argv.includes('--skip-lint')) {
  process.argv.splice(process.argv.indexOf('--'), 1);
  process.argv.splice(process.argv.indexOf('--skip-lint'), 1);
}

execSync('gulp build', {stdio: [0, 1, 2]});
