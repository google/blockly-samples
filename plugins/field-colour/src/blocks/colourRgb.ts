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


export const BLOCK_NAME = 'colour_rgb';

// Block for composing a colour from RGB components.
const jsonDef =
{
    'type': BLOCK_NAME,
    'message0':
        '%{BKY_COLOUR_RGB_TITLE} %{BKY_COLOUR_RGB_RED} %1 %{BKY_COLOUR_RGB_GREEN} %2 %{BKY_COLOUR_RGB_BLUE} %3',
    'args0': [
        {
            'type': 'input_value',
            'name': 'RED',
            'check': 'Number',
            'align': 'RIGHT',
        },
        {
            'type': 'input_value',
            'name': 'GREEN',
            'check': 'Number',
            'align': 'RIGHT',
        },
        {
            'type': 'input_value',
            'name': 'BLUE',
            'check': 'Number',
            'align': 'RIGHT',
        },
    ],
    'output': 'Colour',
    'helpUrl': '%{BKY_COLOUR_RGB_HELPURL}',
    'style': 'colour_blocks',
    'tooltip': '%{BKY_COLOUR_RGB_TOOLTIP}',
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
    // Compose a colour from RGB components expressed as percentages.
    const red = generator.valueToCode(block, 'RED', JavascriptOrder.NONE) || 0;
    const green = generator.valueToCode(block, 'GREEN', JavascriptOrder.NONE) || 0;
    const blue = generator.valueToCode(block, 'BLUE', JavascriptOrder.NONE) || 0;
    const functionName = generator.provideFunction_(
        'colourRgb',
        `
  function ${generator.FUNCTION_NAME_PLACEHOLDER_}(r, g, b) {
    r = Math.max(Math.min(Number(r), 100), 0) * 2.55;
    g = Math.max(Math.min(Number(g), 100), 0) * 2.55;
    b = Math.max(Math.min(Number(b), 100), 0) * 2.55;
    r = ('0' + (Math.round(r) || 0).toString(16)).slice(-2);
    g = ('0' + (Math.round(g) || 0).toString(16)).slice(-2);
    b = ('0' + (Math.round(b) || 0).toString(16)).slice(-2);
    return '#' + r + g + b;
  }
  `,
    );
    const code = functionName + '(' + red + ', ' + green + ', ' + blue + ')';
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
    // Compose a colour from RGB components expressed as percentages.
    const red = generator.valueToCode(block, 'RED', DartOrder.NONE) || 0;
    const green = generator.valueToCode(block, 'GREEN', DartOrder.NONE) || 0;
    const blue = generator.valueToCode(block, 'BLUE', DartOrder.NONE) || 0;

    // TODO(#7600): find better approach than casting to any to override
    // CodeGenerator declaring .definitions protected.
    (generator as any).definitions_['import_dart_math'] =
        "import 'dart:math' as Math;";
    const functionName = generator.provideFunction_(
        'colour_rgb',
        `
  String ${generator.FUNCTION_NAME_PLACEHOLDER_}(num r, num g, num b) {
    num rn = (Math.max(Math.min(r, 100), 0) * 2.55).round();
    String rs = rn.toInt().toRadixString(16);
    rs = '0$rs';
    rs = rs.substring(rs.length - 2);
    num gn = (Math.max(Math.min(g, 100), 0) * 2.55).round();
    String gs = gn.toInt().toRadixString(16);
    gs = '0$gs';
    gs = gs.substring(gs.length - 2);
    num bn = (Math.max(Math.min(b, 100), 0) * 2.55).round();
    String bs = bn.toInt().toRadixString(16);
    bs = '0$bs';
    bs = bs.substring(bs.length - 2);
    return '#$rs$gs$bs';
  }
  `,
    );
    const code = functionName + '(' + red + ', ' + green + ', ' + blue + ')';
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
    // Compose a colour from RGB components expressed as percentages.
    const functionName = generator.provideFunction_(
        'colour_rgb',
        `
  function ${generator.FUNCTION_NAME_PLACEHOLDER_}(r, g, b)
    r = math.floor(math.min(100, math.max(0, r)) * 2.55 + .5)
    g = math.floor(math.min(100, math.max(0, g)) * 2.55 + .5)
    b = math.floor(math.min(100, math.max(0, b)) * 2.55 + .5)
    return string.format("#%02x%02x%02x", r, g, b)
  end
  `,
    );
    const r = generator.valueToCode(block, 'RED', LuaOrder.NONE) || 0;
    const g = generator.valueToCode(block, 'GREEN', LuaOrder.NONE) || 0;
    const b = generator.valueToCode(block, 'BLUE', LuaOrder.NONE) || 0;
    const code = functionName + '(' + r + ', ' + g + ', ' + b + ')';
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
    // Compose a colour from RGB components expressed as percentages.
    const red = generator.valueToCode(block, 'RED', PhpOrder.NONE) || 0;
    const green = generator.valueToCode(block, 'GREEN', PhpOrder.NONE) || 0;
    const blue = generator.valueToCode(block, 'BLUE', PhpOrder.NONE) || 0;
    const functionName = generator.provideFunction_(
        'colour_rgb',
        `
  function ${generator.FUNCTION_NAME_PLACEHOLDER_}($r, $g, $b) {
    $r = round(max(min($r, 100), 0) * 2.55);
    $g = round(max(min($g, 100), 0) * 2.55);
    $b = round(max(min($b, 100), 0) * 2.55);
    $hex = '#';
    $hex .= str_pad(dechex($r), 2, '0', STR_PAD_LEFT);
    $hex .= str_pad(dechex($g), 2, '0', STR_PAD_LEFT);
    $hex .= str_pad(dechex($b), 2, '0', STR_PAD_LEFT);
    return $hex;
  }
  `,
    );
    const code = functionName + '(' + red + ', ' + green + ', ' + blue + ')';
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
    // Compose a colour from RGB components expressed as percentages.
    const functionName = generator.provideFunction_(
        'colour_rgb',
        `
  def ${generator.FUNCTION_NAME_PLACEHOLDER_}(r, g, b):
    r = round(min(100, max(0, r)) * 2.55)
    g = round(min(100, max(0, g)) * 2.55)
    b = round(min(100, max(0, b)) * 2.55)
    return '#%02x%02x%02x' % (r, g, b)
  `,
    );
    const r = generator.valueToCode(block, 'RED', PythonOrder.NONE) || 0;
    const g = generator.valueToCode(block, 'GREEN', PythonOrder.NONE) || 0;
    const b = generator.valueToCode(block, 'BLUE', PythonOrder.NONE) || 0;
    const code = functionName + '(' + r + ', ' + g + ', ' + b + ')';
    return [code, PythonOrder.FUNCTION_CALL];
}

const definitionMap = 
    BlocklyCommon.createBlockDefinitionsFromJsonArray([jsonDef]);

export const blockDef = definitionMap[BLOCK_NAME];

/**
 * Install the `colour_rgb` block and all of its dependencies.
 */
export function installBlock(gens: Generators = {}) {
    registerFieldColour();
    BlocklyCommon.defineBlocks(definitionMap);
    if (gens.javascript) gens.javascript.forBlock[BLOCK_NAME] = jsGenerator;
    if (gens.dart){
        gens.dart.forBlock[BLOCK_NAME] = dartGenerator;
        gens.dart.addReservedWords('Math');
    }
    if (gens.lua) gens.lua.forBlock[BLOCK_NAME] = luaGenerator;
    if (gens.php) gens.php.forBlock[BLOCK_NAME] = phpGenerator;
    if (gens.python) gens.python.forBlock[BLOCK_NAME] = pythonGenerator;
}