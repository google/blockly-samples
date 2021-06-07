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
 * Publish all plugins that have changed since the last release.
 * @param {boolean=} dryRun True for running through the publish script as a dry
 *     run.
 * @param {boolean=} force True for forcing all plugins to publish, even ones
 *     that have not changed.
 * @return {Function} Gulp task.
 */
function publish(dryRun, force) {
  return (done) => {
    // Login to npm.
    console.log('Logging in to npm.');
    execSync(
        `npm login --registry https://wombat-dressing-room.appspot.com`,
        {stdio: 'inherit'});

    const releaseDir = 'dist';
    // Delete the release directory if it exists.
    if (fs.existsSync(releaseDir)) {
      console.log('Removing previous `dist/` directory.');
      rimraf.sync(releaseDir);
    }

    // Clone a fresh copy of blockly-samples.
    console.log(`Checking out a fresh copy of blockly-samples under\
 ${path.resolve(releaseDir)}`);
    execSync(
        `git clone https://github.com/google/blockly-samples ${releaseDir}`,
        {stdio: 'pipe'});

    // Run npm ci.
    console.log('Running npm ci to install.');
    execSync(`npm ci`, {cwd: releaseDir, stdio: 'inherit'});

    // Run npm publish.
    execSync(
        `npm run publish:${dryRun ? 'check' : '_internal'}` +
            `${force ? ' -- --force-publish=*' : ''}`,
        {cwd: releaseDir, stdio: 'inherit'});

    done();
  };
}

/**
 * Publish all plugins.
 * @param {Function} done Completed callback.
 * @return {Function} Gulp task.
 */
function publishRelease(done) {
  return publish()(done);
}

/**
 * Run through a dry run of the release script.
 * @param {Function} done Completed callback.
 * @return {Function} Gulp task.
 */
function publishDryRun(done) {
  return publish(true)(done);
}

/**
 * Forces all plugins to publish.
 * Uses the built in lerna option --force-publish=*.
 * @param {Function} done Completed callback.
 * @return {Function} Gulp task.
 */
function forcePublish(done) {
  return publish(false, true)(done);
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
        pageRoot: `plugins/${pluginDir}`,
        pages: [
          {
            label: 'Playground',
            link: 'test/index',
          },
          {
            label: 'README',
            link: 'README',
          }
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
      execSync(`lerna exec -- npm install blockly@beta`, {stdio: 'inherit'});
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
          `lerna exec -- npm install blockly@beta`,
          {cwd: examplesDirectory, stdio: 'inherit'});
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
  publish: publishRelease,
  publishDryRun: publishDryRun,
  forcePublish: forcePublish,
  testGhPagesBeta: testGhPagesLocally(true),
  testGhPages: testGhPagesLocally(false),
};
