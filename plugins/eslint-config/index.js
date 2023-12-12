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

module.exports = {
  root: true,

  parser: 'babel-eslint',

  env: {
    browser: true,
    commonjs: true,
    es2020: true,
    node: true,
  },

  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },

  extends: [
    'eslint:recommended',
    'eslint-config-google',
    'plugin:jsdoc/recommended',
  ],

  globals: {
    Blockly: true,
    goog: true,
  },

  settings: {
    jsdoc: {
      tagNamePreference: {
        returns: 'returns',
      },
      mode: 'closure',
    },
  },

  rules: {
    // http://eslint.org/docs/rules/
    'camelcase': 'warn',
    'new-cap': ['error', {capIsNewExceptionPattern: '^.*Error'}],
    // Allow TODO comments.
    'no-warning-comments': 'off',
    // Allow long import lines.
    'max-len': [
      'error',
      {
        ignorePattern: '^(import|export)',
        ignoreUrls: true,
      },
    ],
    'no-invalid-this': 'off',
    // valid-jsdoc does not work properly for interface methods.
    // https://github.com/eslint/eslint/issues/9978
    'valid-jsdoc': 'off',

    // https://github.com/gajus/eslint-plugin-jsdoc#eslint-plugin-jsdoc-rules
    'require-jsdoc': 'off',
    'jsdoc/newline-after-description': 'off',
    // This should warn instead, but it's broken for long record type params.
    'jsdoc/require-description-complete-sentence': 'off',
    'jsdoc/require-returns': [
      'error',
      {
        forceRequireReturn: false,
      },
    ],
    'jsdoc/require-description': [
      'warn',
      {
        // Don't require descriptions if these tags are present.
        exemptedBy: ['inheritdoc', 'param', 'return', 'returns', 'type'],
      },
    ],
    'jsdoc/check-tag-names': 'off',
    'jsdoc/check-access': 'warn',
    'jsdoc/check-types': 'off',
    'jsdoc/check-values': 'off',
    'jsdoc/require-jsdoc': [
      'warn',
      {
        require: {
          FunctionDeclaration: true,
          ClassDeclaration: true,
          MethodDefinition: true,
        },
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.mocha.js'],
      env: {
        mocha: true,
      },
    },
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',

        // typescript-eslint specific options
        warnOnUnsupportedTypeScriptVersion: true,
      },
      plugins: ['@typescript-eslint'],
      settings: {
        jsdoc: {
          mode: 'typescript',
        },
      },

      // If adding a typescript-eslint version of an existing ESLint rule,
      // make sure to disable the ESLint rule here.
      rules: {
        // The types are specified in TS rather than JsDoc.
        'jsdoc/no-types': 'warn',
        'jsdoc/require-param-type': 'off',
        'jsdoc/require-property-type': 'off',
        'jsdoc/require-returns-type': 'off',

        // Already handled by tsc.
        'no-dupe-class-members': 'off',
        'no-undef': 'off',

        // Add TypeScript specific rules (and turn off ESLint equivalents)
        '@typescript-eslint/array-type': [
          'error',
          {
            default: 'array-simple',
          },
        ],
        '@typescript-eslint/ban-ts-comment': 'error',
        '@typescript-eslint/ban-types': [
          'error',
          {
            types: {
              Object: {
                message: "Use {} or 'object' instead.",
              },
              String: {
                message: "Use 'string' instead.",
              },
              Number: {
                message: "Use 'number' instead.",
              },
              Boolean: {
                message: "Use 'boolean' instead.",
              },
            },
          },
        ],
        'camelcase': 'off',
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'default',
            format: ['camelCase', 'PascalCase'],
          },
          {
            selector: 'class',
            format: ['PascalCase'],
          },
          {
            // Disallow starting interaces with 'I'
            selector: 'interface',
            format: ['PascalCase'],
            custom: {
              regex: '^I[A-Z]',
              match: false,
            },
          },
        ],
        '@typescript-eslint/consistent-type-assertions': 'error',
        '@typescript-eslint/member-delimiter-style': [
          'error',
          {
            multiline: {
              delimiter: 'semi',
              requireLast: true,
            },
            singleline: {
              delimiter: 'semi',
              requireLast: false,
            },
          },
        ],

        'no-array-constructor': 'off',
        '@typescript-eslint/no-array-constructor': 'error',

        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-inferrable-types': 'error',
        '@typescript-eslint/no-misused-new': 'error',
        '@typescript-eslint/no-namespace': 'error',
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@typescript-eslint/no-this-alias': 'error',

        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', {args: 'none'}],

        '@typescript-eslint/no-var-requires': 'error',
        '@typescript-eslint/prefer-namespace-keyword': 'error',
        '@typescript-eslint/triple-slash-reference': 'error',
        '@typescript-eslint/type-annotation-spacing': 'error',

        '@typescript-eslint/consistent-type-definitions': 'error',
        '@typescript-eslint/explicit-member-accessibility': [
          'error',
          {accessibility: 'no-public'},
        ],
        '@typescript-eslint/no-require-imports': 'error',
        '@typescript-eslint/semi': ['error', 'always'],
      },
    },
  ],
};
