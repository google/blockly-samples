/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';

import { registerColourField } from './field_colour';
import * as colourPicker from './blocks/colourPicker';
import * as colourRandom from './blocks/colourRandom';
import { Generators } from './blocks/generatorsType';

// Re-export all parts of the definition.
export * as colourPicker from './blocks/colourPicker';
export * as colourRandom from './blocks/colourRandom';

// Block for composing a colour from RGB components.
const colourRgbDef =
{
    'type': 'colour_rgb',
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

// Block for blending two colours together.
const colourBlendDef =
{
    'type': 'colour_blend',
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
 * Install the `colour_rgb` block and all of its dependencies.
 */
export function installColourRgbBlock(generators: Generators = {}) {
    registerColourField();
    Blockly.common.defineBlocksWithJsonArray([colourRgbDef]);
}

/**
 * Install the `colour_blend` block and all of its dependencies.
 */
export function installColourBlendBlock(generators: Generators = {}) {
    registerColourField();
    Blockly.common.defineBlocksWithJsonArray([colourBlendDef]);
}

/**
 * Install all of the blocks defined in this file and all of their
 * dependencies.
 */
export function installAllBlocks(generators: Generators = {}) {
    colourPicker.installBlock(generators);
    installColourRgbBlock(generators);
    colourRandom.installBlock(generators);
    installColourBlendBlock(generators);
}

// Calling this installs blocks, which means it has side effects.
installAllBlocks();