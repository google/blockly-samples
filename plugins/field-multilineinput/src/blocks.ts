/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import { registerMultilineInputField } from './field_multilineinput';

const multilineTextDef = {
    'type': 'text_multiline',
    'message0': '%1 %2',
    'args0': [
        {
            'type': 'field_image',
            'src':
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAARCAYAAADpP' +
                'U2iAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAdhgAAHYYBXaITgQAAABh0RVh0' +
                'U29mdHdhcmUAcGFpbnQubmV0IDQuMS42/U4J6AAAAP1JREFUOE+Vks0KQUEYhjm' +
                'RIja4ABtZ2dm5A3t3Ia6AUm7CylYuQRaUhZSlLZJiQbFAyRnPN33y01HOW08z88' +
                '73zpwzM4F3GWOCruvGIE4/rLaV+Nq1hVGMBqzhqlxgCys4wJA65xnogMHsQ5luj' +
                'nYHTejBBCK2mE4abjCgMGhNxHgDFWjDSG07kdfVa2pZMf4ZyMAdWmpZMfYOsLiD' +
                'MYMjlMB+K613QISRhTnITnsYg5yUd0DETmEoMlkFOeIT/A58iyK5E18BuTBfgYX' +
                'fwNJv4P9/oEBerLylOnRhygmGdPpTTBZAPkde61lbQe4moWUvYUZYLfUNftIY4z' +
                'wA5X2Z9AYnQrEAAAAASUVORK5CYII=',
            'width': 12,
            'height': 17,
            'alt': '\u00B6',
        },
        {
            'type': 'field_multilinetext',
            'name': 'TEXT',
            'text': '',
        },
    ],
    'output': 'String',
    'style': 'text_blocks',
    'helpUrl': '%{BKY_TEXT_TEXT_HELPURL}',
    'tooltip': '%{BKY_TEXT_TEXT_TOOLTIP}',
    'extensions': ['parent_tooltip_when_inline'],
};

// Helper function to define a single block from a JSON definition.
function defineBlockFromJson(blockJsonDef: any) {
    Blockly.common.defineBlocks(
        Blockly.common.createBlockDefinitionsFromJsonArray([blockJsonDef]));
}

/**
 * Install all of the blocks defined in this file and all of their
 * dependencies.
 */
export function installAllBlocks() {
    defineBlockFromJson(multilineTextDef);
    registerMultilineInputField();
}

// Calling this installs blocks, which means it has side effects.
installAllBlocks();