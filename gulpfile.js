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
 * Prepare gh-pages for deployment.  Copy over the relevant files from each of
 * the plugins and move them under gh-pages.
 */
function prepareToDeployToGhPages() {
  return gulp
      .src([
        './plugins/*/test/index.html',
        './plugins/*/build/test_bundle.js'],
      {base: './plugins/'})
      .pipe(gulp.dest('./gh-pages/plugins/'));
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
  predeploy: prepareToDeployToGhPages,
  publish: publishRelease,
  publishDryRun: publishDryRun,
};
