/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A script that automatically adds imports of things that have
 *     been moved out of the Blockly namespace to developers' local files.
 */
'use strict';

import {createSubCommand, extractRequiredInfo} from './command.js';
import {readFileSync, statSync, writeFileSync} from 'fs';

export const fixImports = createSubCommand(
  'fix-imports',
  '>=9',
  'Add imports for modules that have been moved out of the Blockly namespace')
  .option(
      '-i, --in-place [suffix]',
      'fix imports in-place, optionally create backup files with the ' +
      'given suffix. Otherwise output to stdout')
  .action(function() {
    // TODO: In the future we should use the fromVersion and toVersion so that
    //   we can support doing this across multiple versions. But for now we
    //   just need it to work for v9.
    const {fileNames} = extractRequiredInfo(this);

    fileNames.forEach((name) => {
      if (statSync(name).isDirectory()) return;
      const contents = readFileSync(name, 'utf8');
      const newContents = createNewContents(contents);
      const inPlace = this.opts().inPlace;

      if (inPlace) {
        if (typeof inPlace == 'string') {
          writeFileSync(name + inPlace, contents);
        }
        writeFileSync(name, newContents);
        process.stderr.write(`Migrated renamings in ${name}\n`);
      } else {
        process.stdout.write(newContents + '\n');
      }
    });
  });

/**
 * @typedef {{
 *   import: string,
 *   oldIdentifier?: string,
 *   newIdentifier: string,
 *   newImport: string,
 *   newRequire: string,
 * }}
 */
const MigrationData = {};

// TODO: Make this database format more robust.
/**
 */
const database = [
  {
    import: 'blockly/dart',
    newIdentifier: 'dartGenerator',
    newImport: `import {dartGenerator} from 'blockly/dart';`,
    newRequire: `const {dartGenerator} = require('blockly/dart');`,
  },
  {
    import: 'blockly/javascript',
    oldIdentifier: 'Blockly.JavaScript',
    newIdentifier: 'javascriptGenerator',
    newImport: `import {javascriptGenerator} from 'blockly/javascript';`,
    newRequire: `const {javascriptGenerator} = require('blockly/javascript');`,
  },
  {
    import: 'blockly/lua',
    newIdentifier: 'luaGenerator',
    newImport: `import {luaGenerator} from 'blockly/lua';`,
    newRequire: `const {luaGenerator} = require('blockly/lua');`,
  },
  {
    import: 'blockly/php',
    newIdentifier: 'phpGenerator',
    newImport: `import {phpGenerator} from 'blockly/php';`,
    newRequire: `const {phpGenerator} = require('blockly/php');`,
  },
  {
    import: 'blockly/python',
    newIdentifier: 'pythonGenerator',
    newImport: `import {pythonGenerator} from 'blockly/python';`,
    newRequire: `const {pythonGenerator} = require('blockly/python');`,
  }
]

/**
 * Migrates the contents of a particular file, renaming references and adding
 * imports.
 * 
 * @param {string} contents The string contents of the file to migrate.
 * @return {string} The migrated contents of the file.
 */
function createNewContents(contents) {
  let newContents = contents;
  for (const migrationData of database) {
    newContents = fixImport(newContents, migrationData);
  }
  return newContents;
}

/**
 * Migrates a particular import in a particular file. Renames references to
 * where the import used to exist on the namespace tree, and adds a new import.
 * 
 * @param {string} contents The string contents of the file to migrate.
 * @param {MigrationData} migrationData Data defining what to migrate and how.
 * @return {string} The migrated contents of the file.
 */
function fixImport(contents, migrationData) {
  const identifier = getIdentifier(contents, migrationData);
  if (!identifier) return contents;
  const newContents = replaceReferences(contents, migrationData, identifier);
  if (newContents !== contents) return addImport(newContents, migrationData);
  return contents;
}

function usesImportStatements(contents) {
  return !!contents.match(/import.+'.+';/);
}

function usesRequireStatements(contents) {
  return !!contents.match(/require\('.+'\);/)
}

function getIdentifier(contents, migrationData) {
  if (usesImportStatements(contents)) {
    const identifierMatch = contents.match(
        new RegExp(`\\s(\\S*) from '${migrationData.import}'`));
    if (!identifierMatch) return migrationData.oldIdentifier ?? null;
    return identifierMatch[1];
  }
  if (usesRequireStatements(contents)) {
    const identifierMatch = contents.match(
        new RegExp(`(\\S*) = require\\('${migrationData.import}'\\)`));
    if (!identifierMatch) return migrationData.oldIdentifier ?? null;
    return identifierMatch[1];
  }
  return null;
}

/**
 * Replaces references to where an import used to exist on the namespace tree
 * with references to the actual import (if any references are found).
 * 
 * @param {string} contents The string contents of the file to migrate.
 * @param {MigrationData} migrationData Data defining what to migrate and how.
 * @return {string} The migrated contents of the file.
 */
function replaceReferences(contents, migrationData, identifier) {
  return contents.replace(dottedIdentifier, (match) => {
    if (match.startsWith(identifier)) {
      return migrationData.newIdentifier +
          match.slice(identifier.length);
    }
    return match;
  });
}

/**
 * Adds the import defined by the Migration data after the last import found in
 * the file, or at the top of the file if it has no imports (which /should/
 * never happen, because they should always import Blockly).
 * 
 * @param {string} contents The string contents of the file to migrate.
 * @param {MigrationData} migrationData Data defining what to migrate and how.
 * @return {string} The migrated contents of the file.
 */
function addImport(contents, migrationData) {
  const importLine = new RegExp(`.*'${migrationData.import}'.*`)
  if (usesImportStatements(contents)) {
    if (contents.match(importLine)) {
      return contents.replace(importLine, migrationData.newImport);
    }
    const index = getImportsEnd(contents);
    return contents.slice(0, index) +
      migrationData.newImport + '\n' +
      contents.slice(index)
  }
  if (usesRequireStatements(contents)) {
    if (contents.match(importLine)) {
      return contents.replace(importLine, migrationData.newRequire);
    }
    const index = getImportsEnd(contents);
    return contents.slice(0, index) +
      migrationData.newRequire + '\n' +
      contents.slice(index)
  }
}

/**
 * Returns the index of the end of the imports, or 0 if no imports are found.
 * 
 * @param {string} contents The contents of the file being migrated.
 * @return {number} The index of the end of the imports.
 */
function getImportsEnd(contents) {
  if (usesImportStatements(contents)) {
    const matches = contents.match(/import.*\n/g)
    if (!matches || !matches.length) return 0;
    const match = matches[matches.length - 1];
    return contents.indexOf(match) + match.length;
  }
  if (usesRequireStatements(contents)) {
    const matches = contents.match(/require\(.*\n/g)
    if (!matches || !matches.length) return 0;
    const match = matches[matches.length - 1];
    return contents.indexOf(match) + match.length;
  }
}

/**
 * RegExp matching a dotted identifier path like "foo.bar.baz".  Note
 * that this only matches such paths containing at least one dot, as
 * we expect to be looking for string like "Blockly.<something>" and
 * don't want to try to rename every single variable and every word
 * that appears in each comment!
 */
const dottedIdentifier =
      /[A-Za-z$_][A-Za-z0-9$_]*(\.[A-Za-z$_][A-Za-z0-9$_]*)+/g;
