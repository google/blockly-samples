/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A 'lint' script for Blockly extension packages.
 * This script:
 *   Runs eslint on the src and test directories.
 *   If run with --fix, fixes problems that can be resolved automatically.
 *   Returns with an error if there are any lint errors in either src or test.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const ESLint = require('eslint').ESLint;
// eslint-disable-next-line no-unused-vars
const LintResult = require('eslint').LintResult;

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const packageJson = require(resolveApp('package.json'));
console.log(`Running lint for ${packageJson.name}`);

// Create the eslint engine.
const eslintConfig = require('@blockly/eslint-config');

const cacheLocation = path.join('node_modules/.cache/.eslint/');

const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const linter = new ESLint({
  extensions: ['.js', '.ts'],
  baseConfig: eslintConfig,
  useEslintrc: false,
  resolvePluginsRelativeTo: __dirname,
  fix: shouldFix,
  cache: true,
  cacheLocation: cacheLocation,
});

/**
 * Lint this directory.
 * @param {string} dir The directory to lint.
 * @param {ESLint} linter The linter.
 * @returns {Promise<Array<LintResult|Array<LintResult|null>>>} All results,
 *   which may be printed with an approriate formatter, and error results.
 */
async function lintDir(dir, linter) {
  const resolvePath = resolveApp(dir);
  if (fs.existsSync(resolvePath)) {
    const results = await linter.lintFiles([dir]);
    if (shouldFix) {
      await ESLint.outputFixes(results);
    }
    return [results, ESLint.getErrorResults(results)];
  }
  return null;
}

linter.loadFormatter('stylish').then((formatter) => {
  // Run eslint for both the src and test directories.
  let exitCode = 0;
  const src = lintDir('src', linter).then((lintResults) => {
    const [result, errors] = lintResults;
    if (result) {
      console.log(formatter.format(result));
    }
    if (errors.length) {
      exitCode = 1;
    }
  });
  const test = lintDir('test', linter).then((lintResults) => {
    const [result, errors] = lintResults;
    if (result) {
      console.log(formatter.format(result));
    }
    if (errors.length) {
      exitCode = 1;
    }
  });
  // Only exit on error after both directories have output their messages.
  Promise.all([src, test]).then(() => {
    process.exit(exitCode);
  });
});
