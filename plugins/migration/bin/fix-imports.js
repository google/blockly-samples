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
    // TODO (#1211): In the future we should use the fromVersion and toVersion
    //   so that we can support doing this across multiple versions. But for
    //   now we just need it to work for v9.
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
let MigrationData;

// TODO (#1211): Make this database format more robust.
/**
 * @type {MigrationData[]}
 */
const database = [
  {
    import: 'blockly/dart',
    newIdentifier: 'dartGenerator',
    newImport: `import {dartGenerator} from 'blockly/dart';`,
    newRequire: `const {dartGenerator} = require('blockly/dart');`
  },
  {
    import: 'blockly/javascript',
    oldIdentifier: 'Blockly.JavaScript',
    newIdentifier: 'javascriptGenerator',
    newImport: `import {javascriptGenerator} from 'blockly/javascript';`,
    newRequire: `const {javascriptGenerator} = require('blockly/javascript');`
  },
  {
    import: 'blockly/lua',
    newIdentifier: 'luaGenerator',
    newImport: `import {luaGenerator} from 'blockly/lua';`,
    newRequire: `const {luaGenerator} = require('blockly/lua');`
  },
  {
    import: 'blockly/php',
    newIdentifier: 'phpGenerator',
    newImport: `import {phpGenerator} from 'blockly/php';`,
    newRequire: `const {phpGenerator} = require('blockly/php');`
  },
  {
    import: 'blockly/python',
    newIdentifier: 'pythonGenerator',
    newImport: `import {pythonGenerator} from 'blockly/python';`,
    newRequire: `const {pythonGenerator} = require('blockly/python');`
  },
  {
    import: 'blockly/blocks',
    oldIdentifier: 'Blockly.libraryBlocks',
    newIdentifier: 'libraryBlocks',
    newImport:  `import {libraryBlocks} from 'blockly/blocks';`,
    newRequire: `const {libraryBlocks} = require('blockly/blocks');`
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

function getIdentifier(contents, migrationData) {
  const importMatch = contents.match(
      new RegExp(`\\s(\\S*) from ('|")${migrationData.import}('|")`));
  if (importMatch) return importMatch[1];
  const requireMatch = contents.match(
      new RegExp(`(\\S*) = require\\(('|")${migrationData.import}('|")\\)`));
  if (requireMatch) return requireMatch[1];
  return migrationData.oldIdentifier;
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
  const importRegExp = createImportRegExp(migrationData.import);
  const importMatch = contents.match(importRegExp);
  if (importMatch) {
    return contents.replace(importRegExp, importMatch[1] + migrationData.newImport);
  }

  const requireRegExp = createRequireRegExp(migrationData.import);
  const requireMatch = contents.match(requireRegExp);
  if (requireMatch) {
    return contents.replace(requireRegExp, requireMatch[1] + migrationData.newRequire);
  }

  const blocklyImportMatch = contents.match(createImportRegExp('blockly'));
  console.log(migrationData.import, !!blocklyImportMatch);
  if (blocklyImportMatch) {
    const match = blocklyImportMatch;
    return contents.slice(0, match.index + match[0].length) +
        '\n' + migrationData.newImport +
        contents.slice(match.index + match[0].length);
  }

  const blocklyRequireMatch = contents.match(createRequireRegExp('blockly'));
  console.log(migrationData.import, !!blocklyRequireMatch);
  if (blocklyRequireMatch) {
    const match = blocklyRequireMatch;
    return contents.slice(0, match.index + match[0].length) +
        '\n' + migrationData.newRequire +
        contents.slice(match.index + match[0].length);
  }

  // Should never happen, but return something so we can keep going if it does.
  return contents;
}

function createImportRegExp(importIdent) {
  return new RegExp(`(\\s*)import .+ from ('|")${importIdent}('|");`)
}

function createRequireRegExp(importIdent) {
  return new RegExp(`(\\s*)const .* = require\\(('|")${importIdent}('|")\\);`);
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
