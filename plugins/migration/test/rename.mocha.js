/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Tests for the rename script.
 */


suite('Rename', function() {
  suite('Exports', function() {
    test('exports without new paths are renamed to the new export', function() {

    });

    test('exports with new paths are renamed to the new path', function() {

    });

    test('suffixes on renamed exports are kept', function() {

    });

    test('exports that are now properties are renamed properly', function() {

    });

    test('properties that are now exports are renamed properly', function() {

    });

    test('exports with get methods are changed to use get methods', function() {

    });

    test('exports with set methods trigger console logs', function() {

    });

    test('exports with new modules are "moved" to new modules', function() {

    });

    test(`exports moved to new modules which were also renames are renamed
properly`, function() {

    });
  });

  suite('Modules', function() {
    test('modules without new paths are renamed to the new name', function() {

    });

    test('modules with new paths are renamed to the new path', function() {

    });

    test('suffixes on renamed modules without new exports are kept',
        function() {

        });

    test('modules with new exports and without new paths gain the new export',
        function() {

        });

    test('modules with new exports with new paths are renamed to the new path',
        function() {

        });

    test('suffixes on modules with new exports are kept', function() {

    });

    test('modules with new exports and new names are renamed properly',
        function() {

        });
  });

  suite('Versions', function() {
    test('renames in non-overlapping versions are not applied', function() {

    });

    test('renames below the lower bound of the version range are not applied',
        function() {

        });

    test('renames in the lower bound of the version range are not applied',
        function() {

        });

    test('renames in the upper bound of the version range are applied',
        function() {

        });

    test('renames above the upper bound of the version range are not applied',
        function() {

        });

    test('no overlapping versions is noop', function() {

    });
  });
});
