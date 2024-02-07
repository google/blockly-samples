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
import { Generators } from './generatorUtils';


/** The name this block is registered under. */
// eslint-disable-next-line @typescript-eslint/naming-convention
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
 * Javascript block generator function.
 * 
 * @param block The Block instance to generate code for.
 * @param generator The JavascriptGenerator calling the function.
 * @returns A tuple containing the code string and precedence.
 */
export function jsGenerator(
    block: Block,
    generator: JavascriptGenerator,
): [string, JavascriptOrder] {
    // Colour picker.
    const code = generator.quote_(block.getFieldValue('COLOUR'));
    return [code, JavascriptOrder.ATOMIC];
}

/**
 * Dart block generator function.
 * 
 * @param block The Block instance to generate code for.
 * @param generator The DartGenerator calling the function.
 * @returns A tuple containing the code string and precedence.
 */
export function dartGenerator(
    block: Block,
    generator: DartGenerator,
): [string, DartOrder] {
    // Colour picker.
    const code = generator.quote_(block.getFieldValue('COLOUR'));
    return [code, DartOrder.ATOMIC];
}

/**
 * Lua block generator function.
 * 
 * @param block The Block instance to generate code for.
 * @param generator The LuaGenerator calling the function.
 * @returns A tuple containing the code string and precedence.
 */
export function luaGenerator(
    block: Block,
    generator: LuaGenerator,
): [string, LuaOrder] {
    // Colour picker.
    const code = generator.quote_(block.getFieldValue('COLOUR'));
    return [code, LuaOrder.ATOMIC];
}

/**
 * PHP block generator function.
 * 
 * @param block The Block instance to generate code for.
 * @param generator The PhpGenerator calling the function.
 * @returns A tuple containing the code string and precedence.
 */
export function phpGenerator(
    block: Block,
    generator: PhpGenerator,
): [string, PhpOrder] {
    // Colour picker.
    const code = generator.quote_(block.getFieldValue('COLOUR'));
    return [code, PhpOrder.ATOMIC];
}

/**
 * Python block generator function.
 * 
 * @param block The Block instance to generate code for.
 * @param generator The PythonGenerator calling the function.
 * @returns A tuple containing the code string and precedence.
 */
export function pythonGenerator(
    block: Block,
    generator: PythonGenerator,
): [string, PythonOrder] {
    // Colour picker.
    const code = generator.quote_(block.getFieldValue('COLOUR'));
    return [code, PythonOrder.ATOMIC];
}


const definitionMap = 
BlocklyCommon.createBlockDefinitionsFromJsonArray([jsonDef]);

/** The colour_picker BlockDefinition. */
export const blockDefinition = definitionMap[BLOCK_NAME];

/**
 * Install the `colour_picker` block and all of its dependencies.
 * 
 * @param gens The CodeGenerators to install per-block
 *     generators on.
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
