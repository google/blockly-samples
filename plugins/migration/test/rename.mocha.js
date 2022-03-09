/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Tests for the rename script.
 */

import {assert} from 'chai';
import {doRenamings, getDatabase} from '../bin/rename.js';


suite('Rename', function() {
  // Integration-ish test meant to test multiple things.
  test('a javascript program with multiple renames works correctly',
      function() {
        const database = {
          '1.0.0': [
            {
              oldName: 'Blockly.moduleA',
              newName: 'Blockly.newModuleA',
              exports: {
                'exportA': {
                  newExport: 'newExportA',
                },
                'exportB': {
                  newExport: 'newExportB',
                },
                'exportC': {
                  newExport: 'someOtherName',
                  newPath: 'Blockly.moduleA.exportC',
                },
              },
            },
            {
              oldName: 'Blockly.moduleB',
              newName: 'Blockly.newModuleB',
              newPath: 'Blockly.moduleB',
            },
            {
              oldName: 'Blockly.moduleC',
              newExport: 'ClassC',
            },
            {
              oldName: 'Blockly.moduleD',
              newExport: 'ClassD',
            },
          ],
        };
        const oldString = `
import Blockly from 'blockly';

class SubClass extends Blockly.moduleC {
  constructor() {
    this.propertyA = Blockly.moduleA.exportA();
    Blockly.moduleA.exportB(null);
    this.propertyC = Blockly.moduleA.exportC;
  }

  methodA() {
    // A comment containing Blockly.moduleA.exportA with some following.
    methodB(Blockly.moduleB.suffix(), this.propertyA);
  }

  /**
   * @param {number}
   * @param {Blockly.moduleA.exportC}
   * @return {Blockly.moduleA.exportA}
   */
  methodB(paramA, paramB) {
    const thingA = /** @type {Blockly.moduleD} */ (new Blockly.moduleE());
    return thingA.someMethod(paramA, paramB);
  }
};`;

        const newStrings = doRenamings(database, '0.0.0', '1.0.0', [oldString]);

        const expectedString = `
import Blockly from 'blockly';

class SubClass extends Blockly.moduleC.ClassC {
  constructor() {
    this.propertyA = Blockly.newModuleA.newExportA();
    Blockly.newModuleA.newExportB = something;
    this.propertyC = Blockly.moduleA.exportC;
  }

  methodA() {
    // A comment containing Blockly.newModuleA.newExportA with some following.
    methodB(Blockly.moduleB.suffix(), this.propertyA);
  }

  /**
   * @param {number}
   * @param {Blockly.moduleA.exportC}
   * @return {Blockly.newModuleA.newExportA}
   */
  methodB(paramA, paramB) {
    const thing = /** @type {Blockly.moduleD.ClassD} */ (new Blockly.moduleE());
    return thing.someMethod(paramA, paramB);
  }
};`;
        assert.deepEqual(newStrings, [expectedString]);
      });

  suite('Database', function() {
    test('getDatabase retrieves renamings.json5', async function() {
      const database = await getDatabase();

      // Sanity check example entry.
      assert.isObject(database);
      assert.isTrue('0.0.0' in database);
      assert.isArray(database['0.0.0']);
    });
  });

  suite('Exports', function() {
    test('exports without new paths are renamed to the new export', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'module',
            exports: {
              'oldExportName': {
                newExport: 'newExportName',
              },
            },
          },
        ],
      };
      const oldString = 'module.oldExportName';

      const newStrings = doRenamings(database, '0.0.0', '1.0.0', [oldString]);

      assert.deepEqual(newStrings, ['module.newExportName']);
    });

    test('exports with new paths are renamed to the new path', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'module',
            exports: {
              'oldExportName': {
                newName: 'someOtherName',
                newPath: 'otherModule.newExportName',
              },
            },
          },
        ],
      };
      const oldString = 'module.oldExportName';

      const newStrings = doRenamings(database, '0.0.0', '1.0.0', [oldString]);

      assert.deepEqual(newStrings, ['otherModule.newExportName']);
    });

    test('suffixes on renamed exports without a new path are kept', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'module',
            exports: {
              'oldExportName': {
                newExport: 'newExportName',
              },
            },
          },
        ],
      };
      const oldString = 'module.oldExportName.suffix';

      const newStrings = doRenamings(database, '0.0.0', '1.0.0', [oldString]);

      assert.deepEqual(newStrings, ['module.newExportName.suffix']);
    });

    test('suffixes on renamed exports with a new path are kept', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'module',
            exports: {
              'oldExportName': {
                newName: 'someOtherName',
                newPath: 'otherModule.newExportName',
              },
            },
          },
        ],
      };
      const oldString = 'module.oldExportName.suffix';

      const newStrings = doRenamings(database, '0.0.0', '1.0.0', [oldString]);

      assert.deepEqual(newStrings, ['otherModule.newExportName.suffix']);
    });

    test('exports that are now properties are renamed properly', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'module',
            exports: {
              'oldExportName': {
                newExport: 'new.export.name',
              },
            },
          },
        ],
      };
      const oldString = 'module.oldExportName';

      const newStrings = doRenamings(database, '0.0.0', '1.0.0', [oldString]);

      assert.deepEqual(newStrings, ['module.new.export.name']);
    });

    test('suffixes on exports that are now properties are kept', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'module',
            exports: {
              'oldExportName': {
                newExport: 'new.export.name',
              },
            },
          },
        ],
      };
      const oldString = 'module.oldExportName.suffix';

      const newStrings = doRenamings(database, '0.0.0', '1.0.0', [oldString]);

      assert.deepEqual(newStrings, ['module.new.export.name.suffix']);
    });

    test('properties that are now exports are renamed properly', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'module',
            exports: {
              'old.property.name': {
                newExport: 'newExportName',
              },
            },
          },
        ],
      };
      const oldString = 'module.old.property.name';

      const newStrings = doRenamings(database, '0.0.0', '1.0.0', [oldString]);

      assert.deepEqual(newStrings, ['module.newExportName']);
    });

    test('suffixes on properties that are now exports are kept', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'module',
            exports: {
              'old.property.name': {
                newExport: 'newExportName',
              },
            },
          },
        ],
      };
      const oldString = 'module.old.property.name.suffix';

      const newStrings = doRenamings(database, '0.0.0', '1.0.0', [oldString]);

      assert.deepEqual(newStrings, ['module.newExportName.suffix']);
    });

    test('exports with get methods are changed to use get methods', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'module',
            exports: {
              'oldExportName': {
                getMethod: 'getExport',
              },
            },
          },
        ],
      };
      const oldString = 'const foo = module.oldExportName;';

      const newStrings = doRenamings(database, '0.0.0', '1.0.0', [oldString]);

      assert.deepEqual(newStrings, ['const foo = module.getExport();']);
    });

    test('exports with set methods trigger console logs', function() {
      // TODO: Implement this and then complete test.
    });

    test('exports with new modules are "moved" to new modules', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'oldModule',
            exports: {
              'exportName': {
                newModule: 'newModule',
              },
            },
          },
        ],
      };
      const oldString = 'oldModule.exportName';

      const newStrings = doRenamings(database, '0.0.0', '1.0.0', [oldString]);

      assert.deepEqual(newStrings, ['newModule.exportName']);
    });

    test('exports moved to the old version of renamed modules are renamed ' +
        'properly', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'moduleA',
            exports: {
              'exportName': {
                newModule: 'moduleB',
              },
            },
          },
          {
            oldName: 'moduleB',
            newName: 'moduleC',
          },
        ],
      };
      const oldString = 'moduleA.exportName';

      const newStrings = doRenamings(database, '0.0.0', '1.0.0', [oldString]);

      assert.deepEqual(newStrings, ['moduleB.exportName']);
    });

    test('exports moved to the new version of renamed modules are renamed ' +
        'properly', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'moduleA',
            exports: {
              'exportName': {
                newModule: 'moduleC',
              },
            },
          },
          {
            oldName: 'moduleB',
            newName: 'moduleC',
          },
        ],
      };
      const oldString = 'moduleA.exportName';

      const newStrings = doRenamings(database, '0.0.0', '1.0.0', [oldString]);

      assert.deepEqual(newStrings, ['moduleC.exportName']);
    });

    test('exports which are renamed in consecutive versions get the most ' +
        'recent rename', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'moduleA',
            exports: {
              'exportA1': {
                newExport: 'exportA2',
              },
            },
          },
        ],
        '2.0.0': [
          {
            oldName: 'moduleA',
            exports: {
              'exportA2': {
                newExport: 'exportA3',
              },
            },
          },
        ],
      };
      const oldString = 'moduleA.exportA1';

      const newStrings = doRenamings(database, '0.0.0', '2.0.0', [oldString]);

      assert.deepEqual(newStrings, ['moduleA.exportA3']);
    });

    test('exports which are renamed and then reexported at their old path ' +
        'in a newer version are not renamed', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'moduleA',
            exports: {
              'exportA1': {
                newExport: 'exportA2',
              },
            },
          },
        ],
        '2.0.0': [
          {
            oldName: 'moduleA',
            exports: {
              'exportA2': {
                newPath: 'moduleA.exportA1',
              },
            },
          },
        ],
      };
      const oldString = 'moduleA.exportA1';

      const newStrings = doRenamings(database, '0.0.0', '2.0.0', [oldString]);

      assert.deepEqual(newStrings, ['moduleA.exportA1']);
    });
  });

  suite('Modules', function() {
    test('modules without new paths are renamed to the new name', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'oldModuleName',
            newName: 'newModuleName',
          },
        ],
      };
      const oldString = 'oldModuleName';

      const newStrings = doRenamings(database, '0.0.0', '1.0.0', [oldString]);

      assert.deepEqual(newStrings, ['newModuleName']);
    });

    test('modules with new paths are renamed to the new path', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'oldModuleName',
            newName: 'someOtherName',
            newPath: 'newModuleName',
          },
        ],
      };
      const oldString = 'oldModuleName';

      const newStrings = doRenamings(database, '0.0.0', '1.0.0', [oldString]);

      assert.deepEqual(newStrings, ['newModuleName']);
    });

    test('suffixes on renamed modules without new exports are kept',
        function() {
          const database = {
            '1.0.0': [
              {
                oldName: 'oldModuleName',
                newName: 'newModuleName',
              },
            ],
          };
          const oldString = 'oldModuleName.suffix';

          const newStrings = doRenamings(
              database, '0.0.0', '1.0.0', [oldString]);

          assert.deepEqual(newStrings, ['newModuleName.suffix']);
        });

    test('suffixes on renamed modules without new exports but with new paths ' +
        'are kept', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'oldModuleName',
            newName: 'someOtherName',
            newPath: 'newModuleName',
          },
        ],
      };
      const oldString = 'oldModuleName.suffix';

      const newStrings = doRenamings(database, '0.0.0', '1.0.0', [oldString]);

      assert.deepEqual(newStrings, ['newModuleName.suffix']);
    });

    test('modules with new exports and without new paths gain the new export',
        function() {
          const database = {
            '1.0.0': [
              {
                oldName: 'moduleName',
                newExport: 'newExport',
              },
            ],
          };
          const oldString = 'moduleName';

          const newStrings = doRenamings(
              database, '0.0.0', '1.0.0', [oldString]);

          assert.deepEqual(newStrings, ['moduleName.newExport']);
        });

    test('modules with new exports with new paths are renamed to the new path',
        function() {
          const database = {
            '1.0.0': [
              {
                oldName: 'moduleName',
                newExport: 'someOtherName',
                newPath: 'newModuleName.newExport',
              },
            ],
          };
          const oldString = 'moduleName';

          const newStrings = doRenamings(
              database, '0.0.0', '1.0.0', [oldString]);

          assert.deepEqual(newStrings, ['newModuleName.newExport']);
        });

    test('suffixes on modules with new exports are kept', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'moduleName',
            newExport: 'newExport',
          },
        ],
      };
      const oldString = 'moduleName.suffix';

      const newStrings = doRenamings(database, '0.0.0', '1.0.0', [oldString]);

      assert.deepEqual(newStrings, ['moduleName.newExport.suffix']);
    });

    test('modules with new exports and new names are renamed properly',
        function() {
          const database = {
            '1.0.0': [
              {
                oldName: 'oldModuleName',
                newName: 'newModuleName',
                newExport: 'newExport',
              },
            ],
          };
          const oldString = 'oldModuleName';

          const newStrings = doRenamings(
              database, '0.0.0', '1.0.0', [oldString]);

          assert.deepEqual(newStrings, ['newModuleName.newExport']);
        });

    test('modules which are renamed in consecutive versions get the most ' +
        'recent rename', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'moduleA1',
            newName: 'moduleA2',
          },
        ],
        '2.0.0': [
          {
            oldName: 'moduleA2',
            newName: 'moduleA3',
          },
        ],
      };
      const oldString = 'moduleA1';

      const newStrings = doRenamings(database, '0.0.0', '2.0.0', [oldString]);

      assert.deepEqual(newStrings, ['moduleA3']);
    });

    test('modules which are renamed and then reexported at their old path ' +
        'in a newer version are not renamed', function() {
      const database = {
        '1.0.0': [
          {
            oldName: 'moduleA1',
            newName: 'moduleA2',
          },
        ],
        '2.0.0': [
          {
            oldName: 'moduleA2',
            newPath: 'moduleA1',
          },
        ],
      };
      const oldString = 'moduleA1';

      const newStrings = doRenamings(database, '0.0.0', '2.0.0', [oldString]);

      assert.deepEqual(newStrings, ['moduleA1']);
    });
  });

  suite('Versions', function() {
    test('renames below the lower bound of the version range are not applied',
        function() {
          const database = {
            '2.0.0': [
              {
                oldName: 'module',
                exports: {
                  'oldExportName': {
                    newExport: 'newExportName',
                  },
                },
              },
            ],
          };
          const oldString = 'module.oldExportName';

          const newStrings = doRenamings(
              database, '3.0.0', '4.0.0', [oldString]);

          assert.deepEqual(newStrings, ['module.oldExportName']);
        });

    test('renames in the lower bound of the version range are not applied',
        function() {
          const database = {
            '2.0.0': [
              {
                oldName: 'module',
                exports: {
                  'oldExportName': {
                    newExport: 'newExportName',
                  },
                },
              },
            ],
          };
          const oldString = 'module.oldExportName';

          const newStrings = doRenamings(
              database, '2.0.0', '3.0.0', [oldString]);

          assert.deepEqual(newStrings, ['module.oldExportName']);
        });

    test('renames in the upper bound of the version range are applied',
        function() {
          const database = {
            '2.0.0': [
              {
                oldName: 'module',
                exports: {
                  'oldExportName': {
                    newExport: 'newExportName',
                  },
                },
              },
            ],
          };
          const oldString = 'module.oldExportName';

          const newStrings = doRenamings(
              database, '1.0.0', '2.0.0', [oldString]);

          assert.deepEqual(newStrings, ['module.newExportName']);
        });

    test('renames in the middle of the version range are applied', function() {
      const database = {
        '2.0.0': [
          {
            oldName: 'module',
            exports: {
              'oldExportName': {
                newExport: 'newExportName',
              },
            },
          },
        ],
      };
      const oldString = 'module.oldExportName';

      const newStrings = doRenamings(
          database, '1.0.0', '3.0.0', [oldString]);

      assert.deepEqual(newStrings, ['module.newExportName']);
    });

    test('renames above the upper bound of the version range are not applied',
        function() {
          const database = {
            '2.0.0': [
              {
                oldName: 'module',
                exports: {
                  'oldExportName': {
                    newExport: 'newExportName',
                  },
                },
              },
            ],
          };
          const oldString = 'module.oldExportName';

          const newStrings = doRenamings(
              database, '0.0.0', '1.0.0', [oldString]);

          assert.deepEqual(newStrings, ['module.oldExportName']);
        });
  });
});
