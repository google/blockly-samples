/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp tasks.
 */

const execSync = require('child_process').execSync;
const ghpages = require('gh-pages');
const gulp = require('gulp');
const predeployTasks = require('./scripts/gh-predeploy');

gulp.header = require('gulp-header');

/**
 * Deploy all plugins to gh-pages.
 * @param {string=} repo The repo to deploy to.
 * @returns {Function} Gulp task.
 */
function deployToGhPages(repo) {
  return (done) => {
    const d = new Date();
    const m = `Deploying ${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
    ghpages.publish(
      'gh-pages',
      {
        message: m,
        repo,
        // Include .nojekyll file to tell GitHub to publish without building.
        // By default, dotfiles are excluded.
        // TODO: make the github action include .nojekyll.
        src: ['**/*', '.nojekyll'],
      },
      done,
    );
  };
}

/**
 * Prepares examples to be tested locally.
 * @param {boolean} isBeta True if we want to test gh pages with the beta
 *     version of Blockly.
 * @returns {Function} Gulp task.
 */
function prepareExamplesForLocal(isBeta) {
  return (done) => {
    if (isBeta) {
      execSync(`npm install --workspace=examples blockly@beta --force`, {
        stdio: 'inherit',
      });
    }
    // Bundles any examples that define a predeploy script (ex. developer-tools).
    execSync(`npm run deploy:prepare:examples`, {stdio: 'inherit'});
    done();
  };
}

/**
 * Does all the necessary tasks to run github pages locally.
 * @param {boolean} isBeta True if we want to test gh pages with the beta
 *     version of Blockly. This is particularly helpful for testing before we
 *     release core.
 * @returns {Function} Gulp task.
 */
function testGhPagesLocally(isBeta) {
  return gulp.series(
    prepareExamplesForLocal(isBeta),
    predeployTasks.predeployAllLocal,
    function (done) {
      console.log('Starting server using http-server');
      execSync(`npx http-server`, {cwd: 'gh-pages', stdio: 'inherit'});
      done();
    },
  );
}

/**
 * Deploy all plugins to gh-pages on origin.
 * @param {Function} done Completed callback.
 * @returns {Function} Gulp task.
 */
function deployToGhPagesOrigin(done) {
  return deployToGhPages()(done);
}

/**
 * Deploy all plugins to gh-pages on upstream.
 * @param {Function} done Completed callback.
 * @returns {Function} Gulp task.
 */
function deployToGhPagesUpstream(done) {
  return deployToGhPages(
    'https://github.com/RaspberryPiFoundation/blockly-samples.git',
  )(done);
}

module.exports = {
  deploy: deployToGhPagesOrigin,
  deployUpstream: deployToGhPagesUpstream,
  predeploy: predeployTasks.predeployAll,
  testGhPagesBeta: testGhPagesLocally(true),
  testGhPages: testGhPagesLocally(false),
};
