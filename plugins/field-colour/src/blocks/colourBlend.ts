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
import { Generators, installGenerators } from './generatorUtils';


const blockName = 'colour_blend';

// Block for blending two colours together.
const jsonDef =
{
    'type': blockName,
    'message0':
        '%{BKY_COLOUR_BLEND_TITLE} %{BKY_COLOUR_BLEND_COLOUR1} ' +
        '%1 %{BKY_COLOUR_BLEND_COLOUR2} %2 %{BKY_COLOUR_BLEND_RATIO} %3',
    'args0': [
        {
            'type': 'input_value',
            'name': 'COLOUR1',
            'check': 'Colour',
            'align': 'RIGHT',
        },
        {
            'type': 'input_value',
            'name': 'COLOUR2',
            'check': 'Colour',
            'align': 'RIGHT',
        },
        {
            'type': 'input_value',
            'name': 'RATIO',
            'check': 'Number',
            'align': 'RIGHT',
        },
    ],
    'output': 'Colour',
    'helpUrl': '%{BKY_COLOUR_BLEND_HELPURL}',
    'style': 'colour_blocks',
    'tooltip': '%{BKY_COLOUR_BLEND_TOOLTIP}',
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
    // Blend two colours together.
  const c1 = generator.valueToCode(block, 'COLOUR1', Dart.Order.NONE) || "'#000000'";
  const c2 = generator.valueToCode(block, 'COLOUR2', Dart.Order.NONE) || "'#000000'";
  const ratio = generator.valueToCode(block, 'RATIO', Dart.Order.NONE) || 0.5;

  // TODO(#7600): find better approach than casting to any to override
  // CodeGenerator declaring .definitions protected.
  (generator as any).definitions_['import_dart_math'] =
    "import 'dart:math' as Math;";
  const functionName = generator.provideFunction_(
    'colour_blend',
    `
String ${generator.FUNCTION_NAME_PLACEHOLDER_}(String c1, String c2, num ratio) {
  ratio = Math.max(Math.min(ratio, 1), 0);
  int r1 = int.parse('0x\${c1.substring(1, 3)}');
  int g1 = int.parse('0x\${c1.substring(3, 5)}');
  int b1 = int.parse('0x\${c1.substring(5, 7)}');
  int r2 = int.parse('0x\${c2.substring(1, 3)}');
  int g2 = int.parse('0x\${c2.substring(3, 5)}');
  int b2 = int.parse('0x\${c2.substring(5, 7)}');
  num rn = (r1 * (1 - ratio) + r2 * ratio).round();
  String rs = rn.toInt().toRadixString(16);
  num gn = (g1 * (1 - ratio) + g2 * ratio).round();
  String gs = gn.toInt().toRadixString(16);
  num bn = (b1 * (1 - ratio) + b2 * ratio).round();
  String bs = bn.toInt().toRadixString(16);
  rs = '0$rs';
  rs = rs.substring(rs.length - 2);
  gs = '0$gs';
  gs = gs.substring(gs.length - 2);
  bs = '0$bs';
  bs = bs.substring(bs.length - 2);
  return '#$rs$gs$bs';
}
`,
  );
  const code = functionName + '(' + c1 + ', ' + c2 + ', ' + ratio + ')';
  return [code, Dart.Order.UNARY_POSTFIX];
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

/**
 * Install the `colour_blend` block and all of its dependencies.
 */
export function installBlock(generators: Generators = {}) {
    registerColourField();
    Blockly.common.defineBlocksWithJsonArray([jsonDef]);
    installGenerators(generators, blockName, 
        jsGenerator, dartGenerator, luaGenerator, phpGenerator, pythonGenerator);
}