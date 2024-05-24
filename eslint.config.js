/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const jsdoc = require('eslint-plugin-jsdoc');
const js = require('@eslint/js');
const {FlatCompat} = require('@eslint/eslintrc');
const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const typescript = require('@typescript-eslint/eslint-plugin');
const eslintConfigPrettier = require('eslint-config-prettier');

// Used to convert the Google eslint config into flat config format.
const compat = new FlatCompat();

module.exports = [
  {
    ignores: [
      'codelabs/',
      'gh-pages/',
      'examples/backpack-demo',
      'examples/blockly-angular',
      'examples/blockly-react',
      'examples/blockly-rtc',
      'examples/blockly-vue3',
      'examples/context-menu-codelab',
      'examples/custom-dialogs-demo',
      'examples/custom-toolbox-codelab',
      'examples/devsite-demo',
      'examples/devsite-landing-demo',
      'examples/getting-started-codelab',
      'examples/interpreter-demo',
      'examples/pitch-field-demo',
      'examples/sample-app-ts',
      'examples/theme-extension-codelab',
      'examples/turtle-field-demo',
      'examples/validation-and-warnings-codelab',
      '**/dist/',
      '**/build/',
      'examples/blockly-svelte/public/bundle.js',
      // specific examples that are sometimes copied into plugins
      'plugins/dev-create/templates/sample-app',
      'plugins/dev-create/templates/sample-app-ts',
      // Golden test files
      'plugins/**/golden/*',
    ],
  },
  js.configs.recommended, // eslint-recommended
  ...compat.extends('eslint-config-google'),
  jsdoc.configs['flat/recommended'], // jsdoc-recommended
  eslintConfigPrettier, // Must be last in the list of imported configs so it can override.
  // Following is default configuration that applies to all files.
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.node,
        ...globals.es5,
        Blockly: true,
        goog: true,
      },
    },

    linterOptions: {
      reportUnusedDisableDirectives: true,
    },

    plugins: {
      jsdoc,
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
          enableFixer: false,
          require: {
            FunctionDeclaration: true,
            ClassDeclaration: true,
            MethodDefinition: true,
          },
        },
      ],
    },
  },
  {
    files: ['**/*.mocha.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
        warnOnUnsupportedTypeScriptVersion: true,
      },
    },
    settings: {
      jsdoc: {
        mode: 'typescript',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // The types are specified in TS rather than JsDoc.
      'jsdoc/no-types': 'warn',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-property-type': 'off',
      'jsdoc/require-returns-type': 'off',
      // Don't auto-add missing jsdoc. Only required on exported items.
      'jsdoc/require-jsdoc': [
        'warn',
        {
          enableFixer: false,
          publicOnly: true,
        },
      ],
      // params and returns docs are optional.
      'jsdoc/require-param-description': ['off'],
      'jsdoc/require-returns': ['off'],
      // Ensure there is a blank line between the body and any @tags,
      // as required by the tsdoc spec.
      'jsdoc/tag-lines': ['error', 'any', {startLines: 1}],

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
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
      ],
      '@typescript-eslint/consistent-type-assertions': 'error',

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
      '@typescript-eslint/consistent-type-definitions': 'error',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {accessibility: 'no-public'},
      ],
      '@typescript-eslint/no-require-imports': 'error',
    },
  },
];
