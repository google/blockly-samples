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
import { Generators } from './generatorsType';


const blockName = 'colour_picker';

// Block for colour picker.
const colourPickerDef =
{
    'type': blockName,
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
    generator: typeof JavaScript.javascriptGenerator,
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
    generator: typeof Dart.dartGenerator,
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
    generator: typeof Lua.luaGenerator,
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
    generator: typeof PHP.phpGenerator,
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
    generator: typeof Python.pythonGenerator,
): [string, Python.Order] {
    // Colour picker.
    const code = generator.quote_(block.getFieldValue('COLOUR'));
    return [code, Python.Order.ATOMIC];
}

/**
 * Install the `colour_picker` block and all of its dependencies.
 */
export function installBlock(generators: Generators = {}) {
    registerColourField();
    Blockly.common.defineBlocksWithJsonArray([colourPickerDef]);
    if (generators.javascript) {
        generators.javascript.forBlock[blockName] = jsGenerator;
    }
    if (generators.dart) {
        generators.dart.forBlock[blockName] = dartGenerator;
    }
    if (generators.lua) {
        generators.lua.forBlock[blockName] = luaGenerator;
    }
    if (generators.php) {
        generators.php.forBlock[blockName] = phpGenerator;
    }
    if (generators.python) {
        generators.python.forBlock[blockName] = pythonGenerator;
    }
}
