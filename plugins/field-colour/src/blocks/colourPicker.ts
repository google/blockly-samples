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
import { Generators } from './generatorUtils';


export const BLOCK_NAME = 'colour_picker';

// Block for colour picker.
const jsonDef =
{
    'type': BLOCK_NAME,
    'message0': '%1',
    'args0': [
        {
            'type': 'field_colour',
            'name': 'COLOUR',
            'colour': '#ff0000',
        },
    ],
    'output': 'Colour',
    'helpUrl': '%{BKY_COLOUR_PICKER_HELPURL}',
    'style': 'colour_blocks',
    'tooltip': '%{BKY_COLOUR_PICKER_TOOLTIP}',
    'extensions': ['parent_tooltip_when_inline'],
};

/**
 * Javascript generator definition.
 * @param block
 * @param generator 
 * @returns 
 */
export function jsGenerator(
    block: Blockly.Block,
    generator: JavaScript.JavascriptGenerator,
): [string, JavaScript.Order] {
    // Colour picker.
    const code = generator.quote_(block.getFieldValue('COLOUR'));
    return [code, JavaScript.Order.ATOMIC];
}

/**
 * Dart generator definition.
 * @param block 
 * @param generator 
 * @returns 
 */
export function dartGenerator(
    block: Blockly.Block,
    generator: Dart.DartGenerator,
): [string, Dart.Order] {
    // Colour picker.
    const code = generator.quote_(block.getFieldValue('COLOUR'));
    return [code, Dart.Order.ATOMIC];
}

/**
 * Lua generator definition.
 * @param block 
 * @param generator 
 * @returns 
 */
export function luaGenerator(
    block: Blockly.Block,
    generator: Lua.LuaGenerator,
): [string, Lua.Order] {
    // Colour picker.
    const code = generator.quote_(block.getFieldValue('COLOUR'));
    return [code, Lua.Order.ATOMIC];
}

/**
 * PHP generator definition.
 * @param block 
 * @param generator 
 * @returns 
 */
export function phpGenerator(
    block: Blockly.Block,
    generator: PHP.PhpGenerator,
): [string, PHP.Order] {
    // Colour picker.
    const code = generator.quote_(block.getFieldValue('COLOUR'));
    return [code, PHP.Order.ATOMIC];
}

/**
 * Python generator definition.
 * @param block 
 * @param generator 
 * @returns 
 */
export function pythonGenerator(
    block: Blockly.Block,
    generator: Python.PythonGenerator,
): [string, Python.Order] {
    // Colour picker.
    const code = generator.quote_(block.getFieldValue('COLOUR'));
    return [code, Python.Order.ATOMIC];
}


const definitionMap = 
    Blockly.common.createBlockDefinitionsFromJsonArray([jsonDef]);

export const blockDef = definitionMap[BLOCK_NAME];

/**
 * Install the `colour_picker` block and all of its dependencies.
 */
export function installBlock(gens: Generators = {}) {
    registerColourField();
    Blockly.common.defineBlocks(definitionMap);
    if (gens.javascript) gens.javascript.forBlock[BLOCK_NAME] = jsGenerator;
    if (gens.dart) gens.dart.forBlock[BLOCK_NAME] = dartGenerator;
    if (gens.lua) gens.lua.forBlock[BLOCK_NAME] = luaGenerator;
    if (gens.php) gens.php.forBlock[BLOCK_NAME] = phpGenerator;
    if (gens.python) gens.python.forBlock[BLOCK_NAME] = pythonGenerator;
}
