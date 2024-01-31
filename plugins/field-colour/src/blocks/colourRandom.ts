/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import * as JavaScript from 'blockly/javascript';
import * as Dart from 'blockly/dart';
import * as Lua from 'blockly/lua';
import * as PHP from 'blockly/php';
import * as Python from 'blockly/python';
import { registerColourField } from '../field_colour';


const blockName = 'colour_random';

// TODO: Should I turn this into a BlockDefinition and export that, or 
// be fine with exporting the JSON definition?
// Block for random colour.
const colourRandomDef =
{
    'type': blockName,
    'message0': '%{BKY_COLOUR_RANDOM_TITLE}',
    'output': 'Colour',
    'helpUrl': '%{BKY_COLOUR_RANDOM_HELPURL}',
    'style': 'colour_blocks',
    'tooltip': '%{BKY_COLOUR_RANDOM_TOOLTIP}',
};

/**
 * Javascript generator definition.
 * @param block
 * @param generator 
 * @returns 
 */
export function colourRandomGenJs(
    block: Blockly.Block,
    generator: typeof JavaScript.javascriptGenerator,
): [string, JavaScript.Order] {
    // Generate a random colour.
    const functionName = generator.provideFunction_(
        'colourRandom',
        `
function ${generator.FUNCTION_NAME_PLACEHOLDER_}() {
  var num = Math.floor(Math.random() * Math.pow(2, 24));
  return '#' + ('00000' + num.toString(16)).substr(-6);
}
`,
    );
    const code = functionName + '()';
    return [code, JavaScript.Order.FUNCTION_CALL];
}

/**
 * Dart generator definition.
 * @param block 
 * @param generator 
 * @returns 
 */
export function colourRandomGenDart(
    block: Blockly.Block,
    generator: typeof Dart.dartGenerator,
): [string, Dart.Order] {
    // Generate a random colour.
    // TODO(#7600): find better approach than casting to any to override
    // CodeGenerator declaring .definitions protected.
    (generator as AnyDuringMigration).definitions_['import_dart_math'] =
        "import 'dart:math' as Math;";
    const functionName = generator.provideFunction_(
        'colour_random',
        `
String ${generator.FUNCTION_NAME_PLACEHOLDER_}() {
  String hex = '0123456789abcdef';
  var rnd = new Math.Random();
  return '#\${hex[rnd.nextInt(16)]}\${hex[rnd.nextInt(16)]}'
      '\${hex[rnd.nextInt(16)]}\${hex[rnd.nextInt(16)]}'
      '\${hex[rnd.nextInt(16)]}\${hex[rnd.nextInt(16)]}';
}
`,
    );
    const code = functionName + '()';
    return [code, Dart.Order.UNARY_POSTFIX];
}


/**
 * Lua generator definition.
 * @param block 
 * @param generator 
 * @returns 
 */
export function colourRandomGenLua(
    block: Blockly.Block,
    generator: typeof Lua.luaGenerator,
): [string, Lua.Order] {
    // Generate a random colour.
    const code = 'string.format("#%06x", math.random(0, 2^24 - 1))';
    return [code, Lua.Order.HIGH];
}

/**
 * PHP generator definition.
 * @param block 
 * @param generator 
 * @returns 
 */
export function colourRandomGenPhp(
    block: Blockly.Block,
    generator: typeof PHP.phpGenerator,
): [string, PHP.Order] {
    // Generate a random colour.
    const functionName = generator.provideFunction_(
        'colour_random',
        `
function ${generator.FUNCTION_NAME_PLACEHOLDER_}() {
  return '#' . str_pad(dechex(mt_rand(0, 0xFFFFFF)), 6, '0', STR_PAD_LEFT);
}
`,
    );
    const code = functionName + '()';
    return [code, PHP.Order.FUNCTION_CALL];
}

/**
 * Python generator definition.
 * @param block 
 * @param generator 
 * @returns 
 */
export function colourRandomGenPython(
    block: Blockly.Block,
    generator: typeof Python.pythonGenerator,
): [string, Python.Order] {
    // Generate a random colour.
    // TODO(#7600): find better approach than casting to any to override
    // CodeGenerator declaring .definitions protected.
    (generator as AnyDuringMigration).definitions_['import_random'] =
        'import random';
    const code = "'#%06x' % random.randint(0, 2**24 - 1)";
    return [code, Python.Order.FUNCTION_CALL];
}

/**
 * Install the `colour_picker` block and all of its dependencies.
 */
export function installColourRandomBlock(generators: any = {}) {
    registerColourField();
    Blockly.common.defineBlocksWithJsonArray([colourRandomDef]);
    if (generators.javascript) {
        generators.javascript.forBlock[blockName] = colourRandomGenJs;
    }
    if (generators.dart) {
        generators.dart.forBlock[blockName] = colourRandomGenDart;
    }
    if (generators.lua) {
        generators.lua.forBlock[blockName] = colourRandomGenLua;
    }
    if (generators.php) {
        generators.php.forBlock[blockName] = colourRandomGenPhp;
    }
    if (generators.python) {
        generators.python.forBlock[blockName] = colourRandomGenPython;
    }
}
