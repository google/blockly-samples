/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import { registerColourField } from './field_colour';


// Block for colour picker.
const colourPickerDef =
{
    'type': 'colour_picker',
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

// Helper function to define a single block from a JSON definition.
function defineBlockFromJson(blockJsonDef : any) {
    Blockly.common.defineBlocks(
        Blockly.common.createBlockDefinitionsFromJsonArray([blockJsonDef]));
}

/**
 * Install the `colour_picker` block and all of its dependencies.
 */
export function installColourPickerBlock() {
    defineBlockFromJson(colourPickerDef);
    registerColourField();
}

/**
 * Install the `colour_rgb` block and all of its dependencies.
 */
export function installColourRgbBlock() {
    defineBlockFromJson(colourRgbDef);
    registerColourField();
}

/**
 * Install the `colour_random` block and all of its dependencies.
 */
export function installColourRandomBlock() {
    defineBlockFromJson(randomColourDef);
    registerColourField();
}

/**
 * Install the `colour_blend` block and all of its dependencies.
 */
export function installColourBlendBlock() {
    defineBlockFromJson(colourBlendDef);
    registerColourField();
}

/**
 * Install all of the blocks defined in this file and all of their
 * dependencies.
 */
export function installAllBlocks() {
    installColourPickerBlock();
    installColourRgbBlock();
    installColourRandomBlock();
    installColourBlendBlock();
}

// Calling this installs blocks, which means it has side effects.
installAllBlocks();