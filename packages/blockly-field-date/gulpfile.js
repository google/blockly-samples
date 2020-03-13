/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp build file for the date field.
 * @author samelh@google.com (Sam El-Husseini)
 */

var gulp = require('gulp');
gulp.replace = require('gulp-replace');
gulp.umd = require('gulp-umd');

var closureCompiler = require('google-closure-compiler').gulp();

function build() {
  const provides = `
goog.provide('Blockly');
goog.provide('Blockly.Css');
goog.provide('Blockly.Events');
goog.provide('Blockly.Field');
goog.provide('Blockly.fieldRegistry');
goog.provide('Blockly.utils.dom');
goog.provide('Blockly.utils.object');
goog.provide('Blockly.utils.string');`;
  return gulp.src([
    'src/**',
    './node_modules/google-closure-library/closure/goog/**/**/*.js'
  ], { base: './' })
    // Add Blockly provides to be compatible with the compiler.
    .pipe(gulp.replace(`goog.provide('Blockly.FieldDate');`,
      `${provides}goog.provide('Blockly.FieldDate');`))
    .pipe(closureCompiler({
      dependency_mode: 'PRUNE',
      entry_point: './src/field_date.js',
      js_output_file: 'date_compressed.js',
      language_in: 'ECMASCRIPT_2015'
    }))
    // Remove the Blockly provides to be compatible with Blockly.
    .pipe(gulp.replace(/var Blockly=\{[^;]*\};\n?/, ''))
    .pipe(gulp.replace(/Blockly\.utils[^=\(]+=\{[^;]*\};/g, ''))
    .pipe(gulp.umd({
      dependencies: function () {
        return [{
          name: 'Blockly',
          amd: 'blockly/core',
          cjs: 'blockly/core',
          global: 'Blockly'
        }];
      },
      namespace: function () { return 'Blockly.FieldDate'; },
      exports: function () { return 'Blockly.FieldDate'; },
    }))
    .pipe(gulp.dest('./dist/'));
};

module.exports = {
  default: build,
  build
};
