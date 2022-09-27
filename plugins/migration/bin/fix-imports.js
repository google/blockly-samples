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
 *   oldIdentifier: string,
 *   newIdentifier: string,
 *   import: string,
 * }}
 */
const MigrationData = {};

// TODO: Make this database format more robust.
/**
 * @type {MigrationData[]}
 */
const database = [
  {
    oldIdentifier: 'Blockly.Dart',
    newIdentifier: 'dartGenerator',
    import: `import {dartGenerator} from 'blockly/dart';\n`,
  },
  {
    oldIdentifier: 'Blockly.JavaScript',
    newIdentifier: 'javascriptGenerator',
    import: `import {javascriptGenerator} from 'blockly/javascript';\n`,
  },
  {
    oldIdentifier: 'Blockly.Lua',
    newIdentifier: 'luaGenerator',
    import: `import {luaGenerator} from 'blockly/lua';\n`,
  },
  {
    oldIdentifier: 'Blockly.PHP',
    newIdentifier: 'phpGenerator',
    import: `import {phpGenerator} from 'blockly/php';\n`,
  },
  {
    oldIdentifier: 'Blockly.Python',
    newIdentifier: 'pythonGenerator',
    import: `import {pythonGenerator} from 'blockly/python';\n`,
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
  const newContents = replaceReferences(contents, migrationData);
  if (newContents !== contents) return addImport(newContents, migrationData);
  return contents;
}

/**
 * Replaces references to where an import used to exist on the namespace tree
 * with references to the actual import (if any references are found).
 * 
 * @param {string} contents The string contents of the file to migrate.
 * @param {MigrationData} migrationData Data defining what to migrate and how.
 * @return {string} The migrated contents of the file.
 */
function replaceReferences(contents, migrationData) {
  return contents.replace(dottedIdentifier, (match) => {
    if (match.startsWith(migrationData.oldIdentifier)) {
      return migrationData.newIdentifier +
          match.slice(migrationData.oldIdentifier.length);
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
  const index = getImportsEnd(contents);
  return contents.slice(0, index) +
      migrationData.import +
      contents.slice(index)
}

/**
 * Returns the index of the end of the imports, or 0 if no imports are found.
 * 
 * @param {string} contents The contents of the file being migrated.
 * @return {number} The index of the end of the imports.
 */
function getImportsEnd(contents) {
  const matches = contents.match(/import.*\n/g)
  if (!matches || !matches.length) return 0;
  const match = matches[matches.length - 1];
  return contents.indexOf(match) + match.length;
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
