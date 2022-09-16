/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp tasks.
 */

const execSync = require('child_process').execSync;
const fs = require('fs');
const ghpages = require('gh-pages');
const gulp = require('gulp');
const jsgl = require('js-green-licenses');
const path = require('path');
const rimraf = require('rimraf');
const yaml = require('json-to-pretty-yaml');

gulp.header = require('gulp-header');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

/**
 * Run the license checker for all packages.
 * @return {Promise} A promise.
 */
function checkLicenses() {
  const checker = new jsgl.LicenseChecker({
    // dev: true,
    // verbose: false,
  });
  checker.setDefaultHandlers();
  const pluginsDir = 'plugins';
  const promises = [];
  // Check root package.json.
  promises.push(checker.checkLocalDirectory('.'));
  fs.readdirSync(pluginsDir)
      .filter((file) => {
        return fs.statSync(path.join(pluginsDir, file)).isDirectory();
      })
      .forEach((plugin) => {
        const pluginDir = path.join(pluginsDir, plugin);
        // Check each plugin package.json.
        promises.push(checker.checkLocalDirectory(pluginDir));
      });
  return Promise.all(promises);
}

/**
 * Prepare for publishing. Must be run before any manual publish command.
 *
 * Clones blockly-samples, runs build and tests, logs into npm publish service.
 * @param {Function} done Completed callback.
 */
function prepareForPublish(done) {
  const releaseDir = 'dist';

  // Delete the release directory if it exists.
  if (fs.existsSync(releaseDir)) {
    console.log('Removing previous `dist/` directory.');
    rimraf.sync(releaseDir);
  }

  // Clone a fresh copy of blockly-samples.
  console.log(`Checking out a fresh copy of blockly-samples under ` +
      `${path.resolve(releaseDir)}`);
  execSync(
      `git clone https://github.com/google/blockly-samples ${releaseDir}`,
      {stdio: 'pipe'});

  // Run npm ci.
  console.log('Running npm ci to install.');
  execSync(`npm ci`, {cwd: releaseDir, stdio: 'inherit'});

  // Build all plugins.
  console.log('Building all plugins.');
  execSync('npm run build', {cwd: releaseDir, stdio: 'inherit'});

  // Test all plugins.
  console.log('Testing all plugins.');
  execSync('npm run test', {cwd: releaseDir, stdio: 'inherit'});

  // Login to npm.
  console.log('Logging in to npm.');
  execSync(
      `npm login --registry https://wombat-dressing-room.appspot.com`,
      {stdio: 'inherit'});
  done();
}

/**
 * Exit early if the release directory does not exist.
 * @param {string} releaseDir release directory to check
 * @param {Function} done Gulp callback.
 */
function exitIfNoReleaseDir(releaseDir, done) {
  // Check that release directory exists.
  if (!fs.existsSync(releaseDir)) {
    console.error(
        `No release directory ${releaseDir} exists. ` +
            `Did you run 'npm run publish:prepare'?`);
    done();
    process.exit(1);
  }
}

/**
 * This script does not log into the npm publish service. If you haven't run
 * the prepare script recently, publishing will fail for that reason.
 * @param {boolean=} force True for forcing all plugins to publish, even ones
 *     that have not changed.
 * @return {Function} Gulp task.
 */
function publish(force) {
  return (done) => {
    const releaseDir = 'dist';
    exitIfNoReleaseDir(releaseDir, done);

    // Run lerna publish. Uses conventional commits for versioning
    // creates the release on GitHub.
    console.log(`Publishing ${force ? 'all' : 'changed'} plugins.`);
    execSync(
        `lerna publish --conventional-commits --create-release github` +
            `${force ? ' --force-publish=*' : ''}`,
        {cwd: releaseDir, stdio: 'inherit'});

    done();
  };
}

/**
 * Publish all plugins that have changed since the last release.
 * Run `npm run publish:prepare` before running this script.
 * @param {Function} done Completed callback.
 * @return {Function} Gulp task.
 */
function publishManual(done) {
  return publish(false)(done);
}

/**
 * Forces all plugins to publish.
 * Uses the built in lerna option --force-publish=*.
 * @param {Function} done Completed callback.
 * @return {Function} Gulp task.
 */
function forcePublish(done) {
  return publish(true)(done);
}

/**
 * Publishes plugins that haven't previously been uploaded to npm.
 * Useful if a previous run of publishing failed after versions were
 * uploaded to github but not all packages were placed uploaded to npm.
 * You must run `npm run publish:prepare` first.
 * @param {Function} done Completed callback.
 */
function publishFromPackage(done) {
  const releaseDir = 'dist';
  exitIfNoReleaseDir(releaseDir, done);

  // Run lerna publish. Will not update versions.
  console.log(`Publishing plugins from package.json versions.`);
  execSync(
      `lerna publish --from-package`,
      {cwd: releaseDir, stdio: 'inherit'});
  done();
}

/**
 * Runs lerna version to check which version numbers would be updated.
 * The version numbers will not be pushed and no tags or releases will
 * be created, even if you answer 'yes' to the prompt.
 * @param {Function} done Completed callback.
 */
function checkVersions(done) {
  const releaseDir = 'dist';
  exitIfNoReleaseDir(releaseDir, done);

  // Check version numbers that would be created.
  console.log('Running lerna version.',
      'These version numbers will not be pushed and no tags will be created,',
      'even if you answer yes to the prompt.');
  execSync(
      `lerna version --conventional-commits --no-git-tag-version --no-push`,
      {cwd: releaseDir, stdio: 'inherit'});

  done();
}

/**
 * Convert json to front matter YAML config.
 * @param {!Object} json The json config.
 * @return {string} The front matter YAML config.
 */
function buildFrontMatter(json) {
  return `---
${yaml.stringify(json)}
---
`;
}

/**
 * Copy over the test page (index.html and bundled js) and the readme for
 * this plugin. Add variables as needed for Jekyll.
 * The resulting code lives in gh-pages/plugins/<pluginName>.
 * @param {string} pluginDir The subdirectory (inside plugins/) for this plugin.
 * @return {Function} Gulp task.
 */
function preparePlugin(pluginDir) {
  const packageJson = require(resolveApp(`plugins/${pluginDir}/package.json`));
  const files = [
    `plugins/${pluginDir}/test/index.html`,
    `plugins/${pluginDir}/README.md`,
  ];
  console.log(`Preparing ${pluginDir} plugin for deployment.`);
  return gulp
      .src(files, {base: 'plugins/', allowEmpty: true})
      // Add front matter tags to index and readme pages for Jekyll processing.
      .pipe(gulp.header(buildFrontMatter({
        title: `${packageJson.name} Demo`,
        packageName: packageJson.name,
        description: packageJson.description,
        version: packageJson.version,
        pageRoot: `plugins/${pluginDir}`,
        pages: [
          {
            label: 'Playground',
            link: 'test/index',
          },
          {
            label: 'README',
            link: 'README',
          },
        ],
      })))
      .pipe(gulp.src(
          [
            './plugins/' + pluginDir + '/build/test_bundle.js',
          ],
          {base: './plugins/', allowEmpty: true}))
      .pipe(gulp.dest('./gh-pages/plugins/'));
}

/**
 * Prepare plugins for deployment to gh-pages.
 *
 * For each plugin, copy relevant files to the gh-pages directory.
 * @param {Function} done Completed callback.
 * @return {Function} Gulp task.
 */
function prepareToDeployPlugins(done) {
  const dir = 'plugins';
  const folders = fs.readdirSync(dir).filter(function(file) {
    return fs.statSync(path.join(dir, file)).isDirectory() &&
        fs.existsSync(path.join(dir, file, 'package.json'));
  });
  return gulp.parallel(folders.map(function(folder) {
    return function preDeployPlugin() {
      return preparePlugin(folder);
    };
  }))(done);
}


/**
 * Copy over files listed in the blocklyDemoConfig.files section of the
 * package.json. Add variables needed for Jekyll processing.
 * The resulting code lives in gh-pages/examples/<exampleName>.
 * @param {string} baseDir The base directory to use, eg: ./examples.
 * @param {string} exampleDir The subdirectory (inside examples/) for this
 *     example.
 * @param {Function} done Completed callback.
 * @return {Function} Gulp task.
 */
function prepareExample(baseDir, exampleDir, done) {
  const packageJson =
      require(resolveApp(path.join(baseDir, exampleDir, 'package.json')));
  const {blocklyDemoConfig} = packageJson;
  if (!blocklyDemoConfig) {
    done();
    return;
  }
  console.log(`Preparing ${exampleDir} example for deployment.`);
  blocklyDemoConfig.pageRoot = `${baseDir}/${exampleDir}`;
  const pageRegex = /.*\.(html|htm|md)$/i;
  const pages = blocklyDemoConfig.files.filter((f) => pageRegex.test(f));
  const assets = blocklyDemoConfig.files.filter((f) => !pageRegex.test(f));

  let stream = gulp.src(
      pages.map((f) => path.join(baseDir, exampleDir, f)),
      {base: baseDir, allowEmpty: true})
      .pipe(gulp.header(buildFrontMatter(blocklyDemoConfig)));
  if (assets.length) {
    stream = stream.pipe(gulp.src(
        assets.map((f) => path.join(baseDir, exampleDir, f)),
        {base: baseDir, allowEmpty: true}));
  }
  return stream.pipe(gulp.dest('./gh-pages/examples/'));
}

/**
 * Prepare examples/demos for deployment to gh-pages.
 *
 * For each examples, read the demo config, and copy relevant files to the
 * gh-pages directory.
 * @param {Function} done Completed callback.
 * @return {Function} Gulp task.
 */
function prepareToDeployExamples(done) {
  const dir = 'examples';
  const folders = fs.readdirSync(dir).filter((file) => {
    return fs.statSync(path.join(dir, file)).isDirectory() &&
        fs.existsSync(path.join(dir, file, 'package.json'));
  });
  return gulp.parallel(folders.map(function(folder) {
    return function preDeployExample(done) {
      return prepareExample(dir, folder, done);
    };
  }))(done);
}

/**
 * Deploy all plugins to gh-pages.
 * @param {string=} repo The repo to deploy to.
 * @return {Function} Gulp task.
 */
function deployToGhPages(repo) {
  return (done) => {
    const d = new Date();
    const m = `Deploying ${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
    ghpages.publish(
        'gh-pages', {
          message: m,
          repo,
        },
        done);
  };
}

/**
 * Prepares plugins to be tested locally.
 * @param {boolean} isBeta True if we want to test gh pages with the beta
 *     version of Blockly.
 * @return {Function} Gulp task.
 */
function preparePluginsForLocal(isBeta) {
  return (done) => {
    if (isBeta) {
      execSync(`lerna add blockly@beta --dev`, {stdio: 'inherit'});
    }
    execSync(`npm run boot`, {stdio: 'inherit'});
    // Bundles all the plugins.
    execSync(`npm run deploy:prepare:plugins`, {stdio: 'inherit'});
    done();
  };
}

/**
 * Prepares examples to be tested locally.
 * @param {boolean} isBeta True if we want to test gh pages with the beta
 *     version of Blockly.
 * @return {Function} Gulp task.
 */
function prepareExamplesForLocal(isBeta) {
  return (done) => {
    const examplesDirectory = 'examples';
    if (isBeta) {
      execSync(
          `lerna add blockly@beta`, {cwd: examplesDirectory, stdio: 'inherit'});
    }
    execSync(`npm run boot`, {cwd: examplesDirectory, stdio: 'inherit'});
    // Bundles any examples that define a predeploy script (ex. blockly-react).
    execSync(`npm run deploy:prepare:examples`, {stdio: 'inherit'});
    done();
  };
}

/**
 * Does all the necessary tasks to run github pages locally.
 * @param {boolean} isBeta True if we want to test gh pages with the beta
 *     version of Blockly. This is particularly helpful for testing before we
 *     release core.
 * @return {Function} Gulp task.
 */
function testGhPagesLocally(isBeta) {
  return gulp.series(
      gulp.parallel(
          preparePluginsForLocal(isBeta), prepareExamplesForLocal(isBeta)),
      gulp.parallel(prepareToDeployPlugins, prepareToDeployExamples),
      function(done) {
        console.log('Starting server using "bundle exec jekyll serve"');
        execSync(
            `bundle exec jekyll serve`, {cwd: 'gh-pages', stdio: 'inherit'});
        done();
      });
}

/**
 * Deploy all plugins to gh-pages on origin.
 * @param {Function} done Completed callback.
 * @return {Function} Gulp task.
 */
function deployToGhPagesOrigin(done) {
  return deployToGhPages()(done);
}

/**
 * Deploy all plugins to gh-pages on upstream.
 * @param {Function} done Completed callback.
 * @return {Function} Gulp task.
 */
function deployToGhPagesUpstream(done) {
  return deployToGhPages('https://github.com/google/blockly-samples.git')(done);
}

module.exports = {
  checkLicenses: checkLicenses,
  deploy: deployToGhPagesOrigin,
  deployUpstream: deployToGhPagesUpstream,
  predeploy: gulp.parallel(prepareToDeployPlugins, prepareToDeployExamples),
  prepareForPublish: prepareForPublish,
  publishManual: publishManual,
  forcePublish: forcePublish,
  publishFromPackage: publishFromPackage,
  checkVersions: checkVersions,
  testGhPagesBeta: testGhPagesLocally(true),
  testGhPages: testGhPagesLocally(false),
};
