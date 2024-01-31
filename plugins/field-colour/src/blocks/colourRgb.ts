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


const blockName = 'colour_rgb';

// Block for composing a colour from RGB components.
const colourRgbDef =
{
    'type': blockName,
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
 * Install the `colour_rgb` block and all of its dependencies.
 */
export function installBlock(generators: Generators = {}) {
    registerColourField();
    Blockly.common.defineBlocksWithJsonArray([colourRgbDef]);
}