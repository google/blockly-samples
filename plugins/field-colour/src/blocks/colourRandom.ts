/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Block, common as BlocklyCommon} from 'blockly';
import { JavascriptGenerator, Order as JavascriptOrder } from 'blockly/javascript';
import { DartGenerator, Order as DartOrder } from 'blockly/dart';
import { LuaGenerator, Order as LuaOrder } from 'blockly/lua';
import { PhpGenerator, Order as PhpOrder } from 'blockly/php';
import { PythonGenerator, Order as PythonOrder } from 'blockly/python';
import { registerFieldColour } from '../field_colour';
import { Generators} from './generatorUtils';


export const BLOCK_NAME = 'colour_random';

// Block for random colour.
const jsonDef =
{
    'type': BLOCK_NAME,
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
export function jsGenerator(
    block: Block,
    generator: JavascriptGenerator,
): [string, JavascriptOrder] {
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
    return [code, JavascriptOrder.FUNCTION_CALL];
}

/**
 * Dart generator definition.
 * @param block 
 * @param generator 
 * @returns 
 */
export function dartGenerator(
    block: Block,
    generator: DartGenerator,
): [string, DartOrder] {
    // Generate a random colour.
    // TODO(#7600): find better approach than casting to any to override
    // CodeGenerator declaring .definitions protected.
    (generator as any).definitions_['import_dart_math'] =
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
    return [code, DartOrder.UNARY_POSTFIX];
}


/**
 * Lua generator definition.
 * @param block 
 * @param generator 
 * @returns 
 */
export function luaGenerator(
    block: Block,
    generator: LuaGenerator,
): [string, LuaOrder] {
    // Generate a random colour.
    const code = 'string.format("#%06x", math.random(0, 2^24 - 1))';
    return [code, LuaOrder.HIGH];
}

/**
 * PHP generator definition.
 * @param block 
 * @param generator 
 * @returns 
 */
export function phpGenerator(
    block: Block,
    generator: PhpGenerator,
): [string, PhpOrder] {
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
    return [code, PhpOrder.FUNCTION_CALL];
}

/**
 * Python generator definition.
 * @param block 
 * @param generator 
 * @returns 
 */
export function pythonGenerator(
    block: Block,
    generator: PythonGenerator,
): [string, PythonOrder] {
    // Generate a random colour.
    // TODO(#7600): find better approach than casting to any to override
    // CodeGenerator declaring .definitions protected.
    (generator as any).definitions_['import_random'] =
        'import random';
    const code = "'#%06x' % random.randint(0, 2**24 - 1)";
    return [code, PythonOrder.FUNCTION_CALL];
}

const definitionMap = 
    BlocklyCommon.createBlockDefinitionsFromJsonArray([jsonDef]);

export const blockDef = definitionMap[BLOCK_NAME];

/**
 * Install the `colour_picker` block and all of its dependencies.
 */
export function installBlock(gens: Generators = {}) {
    registerFieldColour();
    BlocklyCommon.defineBlocks(definitionMap);
    if (gens.javascript) gens.javascript.forBlock[BLOCK_NAME] = jsGenerator;
    if (gens.dart) gens.dart.forBlock[BLOCK_NAME] = dartGenerator;
    if (gens.lua) gens.lua.forBlock[BLOCK_NAME] = luaGenerator;
    if (gens.php) gens.php.forBlock[BLOCK_NAME] = phpGenerator;
    if (gens.python) gens.python.forBlock[BLOCK_NAME] = pythonGenerator;
}
