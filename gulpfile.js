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
const header = require('gulp-header');


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
 * @return {Function} Gulp task.
 */
function publish(dryRun) {
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

    // Run npm install.
    console.log('Running npm install.');
    execSync(`npm install`, {cwd: releaseDir, stdio: 'inherit'});

    // Run npm publish.
    execSync(
        `npm run publish:${dryRun ? 'check' : '_internal'}`,
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
 * Build the front matter string for a plugin's demo and readme pages based on the contents
 * of the plugin's package.json.
 * @param {string} pluginDir The subdirectory (inside plugins/) for this plugin.
 * @return {string} The front matter string, including leading and following dashes.
 */
function buildFrontMatter(pluginDir) {
  const appDirectory = fs.realpathSync(process.cwd());
  const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

  const packageJson = require(resolveApp('./plugins/' + pluginDir + '/package.json'));
  console.log(`Preparing plugin for ${packageJson.name}`);

  // Escape the package name: @ is not a valid character in Jekyll's YAML.
  let frontMatter = `---
packageName: "${packageJson.name}"
description: "${packageJson.description}"
---
`;
  return frontMatter;
}

/**
 * Copy over the test page (index.html and bundled js) and the readme for
 * this plugin. Add variables as needed for Jekyll.
 * The resulting code lives in gh-pages/plugins/<pluginName>
 * @param {string} pluginDir The subdirectory (inside plugins/) for this plugin.
 */
function preparePlugin(pluginDir) {
  return gulp
    .src([
      './plugins/' + pluginDir + '/test/index.html',
      './plugins/' + pluginDir + '/README.md'
    ], {base: './plugins/', allowEmpty: true})
    // Add front matter tags to index and readme pages for Jekyll processing.
    .pipe(header(buildFrontMatter(pluginDir)))
    .pipe(gulp.src([
      './plugins/' + pluginDir + '/build/test_bundle.js',
    ], {base: './plugins/', allowEmpty: true}))
    .pipe(gulp.dest('./gh-pages/plugins/'));
}

/**
 * Prepare plugins for deployment to gh-pages.
 *
 * For each plugin, copy relevant files to the gh-pages directory.
 */
function prepareToDeployPlugins(done) {
  const dir = './plugins';
  var folders = fs.readdirSync(dir)
    .filter(function (file) {
      return fs.statSync(path.join(dir, file)).isDirectory();
    });
  return gulp.parallel(folders.map(function(folder) {
    return function () {
      return preparePlugin(folder);
    }
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
    ghpages.publish('gh-pages', {
      message: `Deploying ${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`,
      repo,
    }, done);
  };
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
  predeploy: prepareToDeployPlugins,
  publish: publishRelease,
  publishDryRun: publishDryRun
};
