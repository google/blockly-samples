/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp build file for the date field.
 * @author samelh@google.com (Sam El-Husseini)
 */

const gulp = require('gulp');
gulp.replace = require('gulp-replace');
gulp.umd = require('gulp-umd');

const closureCompiler = require('google-closure-compiler').gulp();

/**
 * Build script.
 * @return {Function} The gulp task.
 */
function build() {
  return gulp.src([
    'src/**',
    './node_modules/google-closure-library/closure/goog/**/**/*.js',
  ], {base: './'})
      .pipe(closureCompiler({
        dependency_mode: 'PRUNE',
        entry_point: './src/field_date.js',
        js_output_file: 'date_compressed.js',
        language_in: 'ECMASCRIPT_2015',
        externs: ['./externs.js'],
      }))
  // Remove the Blockly provides to be compatible with Blockly.
      .pipe(gulp.umd({
        dependencies: function() {
          return [{
            name: 'Blockly',
            amd: 'blockly/core',
            cjs: 'blockly/core',
            global: 'Blockly',
          }];
        },
        namespace: function() {
          return 'Blockly.FieldDate';
        },
        exports: function() {
          return 'Blockly.FieldDate';
        },
      }))
      .pipe(gulp.dest('./dist/'));
}

module.exports = {
  default: build,
  build,
};
