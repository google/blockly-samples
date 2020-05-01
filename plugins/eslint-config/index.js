/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview ESLint configuration file.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const isTypescript = fs.existsSync(resolveApp('tsconfig.json'));

module.exports = {
  root: true,

  parser: 'babel-eslint',

  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },

  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },

  extends: [
    'eslint:recommended',
    'eslint-config-google',
  ],

  globals: {
    'Blockly': true,
    'goog': true,
  },

  rules: {
    'camelcase': 'warn',
    'no-warning-comments': 'warn',
  },

  overrides: [
    {
      files: ['**/*.js'],
      extends: ['plugin:jsdoc/recommended'],
      settings: {
        jsdoc: {
          tagNamePreference: {
            'returns': 'return',
          },
        },
      },
      rules: {
        'jsdoc/newline-after-description': 0,
        'jsdoc/require-description-complete-sentence': 1,
        'jsdoc/require-returns': [
          'error',
          {
            'forceRequireReturn': false,
          },
        ],
        'jsdoc/require-description': 1,
        'jsdoc/check-tag-names': 0,
        'jsdoc/check-access': 1,
        'jsdoc/check-types': 0,
        'jsdoc/check-values': 0,
        'jsdoc/require-jsdoc': [
          'error',
          {
            'require': {
              'ClassDeclaration': true,
              'MethodDefinition': true,
            },
          },
        ],
      },
    },
    {
      files: ['**/*.mocha.js'],
      env: {
        mocha: true,
      },
      rules: {
        'no-invalid-this': 'off',
      },
    },
    isTypescript && {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',

        // typescript-eslint specific options
        warnOnUnsupportedTypeScriptVersion: true,
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        '@typescript-eslint/indent': [2, 2],
      },
    },
  ].filter(Boolean),
};
