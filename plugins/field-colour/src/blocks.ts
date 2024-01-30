/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import { registerColourField } from './field_colour';
import { installColourPickerBlock } from './blocks/colourPicker';

// Re-export all parts of the definition.
export * from './blocks/colourPicker';

// TODO: Write correct types for the `generators` parameter for each block's 
// `install` function.
const generators: Record<string, Blockly.Generator> {
    'javascript': typeof JavaScript.javascriptGenerator
}

// Block for random colour.
const randomColourDef =
{
    'type': 'colour_random',
    'message0': '%{BKY_COLOUR_RANDOM_TITLE}',
    'output': 'Colour',
    'helpUrl': '%{BKY_COLOUR_RANDOM_HELPURL}',
    'style': 'colour_blocks',
    'tooltip': '%{BKY_COLOUR_RANDOM_TOOLTIP}',
};

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
export function installColourRgbBlock(generators = {}) {
    registerColourField();
    Blockly.common.defineBlocksWithJsonArray([colourRgbDef]);
}

/**
 * Install the `colour_random` block and all of its dependencies.
 */
export function installColourRandomBlock(generators = {}) {
    registerColourField();
    Blockly.common.defineBlocksWithJsonArray([randomColourDef]);
}

/**
 * Install the `colour_blend` block and all of its dependencies.
 */
export function installColourBlendBlock(generators = {}) {
    registerColourField();
    Blockly.common.defineBlocksWithJsonArray([colourBlendDef]);
}

/**
 * Install all of the blocks defined in this file and all of their
 * dependencies.
 */
export function installAllBlocks(generators = {}) {
    installColourPickerBlock(generators);
    installColourRgbBlock(generators);
    installColourRandomBlock(generators);
    installColourBlendBlock(generators);
}

// Calling this installs blocks, which means it has side effects.
installAllBlocks();