/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Modern theme.
 */

import * as Blockly from 'blockly/core';

export default Blockly.Theme.defineTheme('modern', {
  name: 'modern',
  base: Blockly.Themes.Classic,
  blockStyles: {
    colour_blocks: { // eslint-disable-line camelcase
      colourPrimary: '#a5745b',
      colourSecondary: '#dbc7bd',
      colourTertiary: '#845d49',
    },
    list_blocks: { // eslint-disable-line camelcase
      colourPrimary: '#745ba5',
      colourSecondary: '#c7bddb',
      colourTertiary: '#5d4984',
    },
    logic_blocks: { // eslint-disable-line camelcase
      colourPrimary: '#5b80a5',
      colourSecondary: '#bdccdb',
      colourTertiary: '#496684',
    },
    loop_blocks: { // eslint-disable-line camelcase
      colourPrimary: '#5ba55b',
      colourSecondary: '#bddbbd',
      colourTertiary: '#498449',
    },
    math_blocks: { // eslint-disable-line camelcase
      colourPrimary: '#5b67a5',
      colourSecondary: '#bdc2db',
      colourTertiary: '#495284',
    },
    procedure_blocks: { // eslint-disable-line camelcase
      colourPrimary: '#995ba5',
      colourSecondary: '#d6bddb',
      colourTertiary: '#7a4984',
    },
    text_blocks: { // eslint-disable-line camelcase
      colourPrimary: '#5ba58c',
      colourSecondary: '#bddbd1',
      colourTertiary: '#498470',
    },
    variable_blocks: { // eslint-disable-line camelcase
      colourPrimary: '#a55b99',
      colourSecondary: '#dbbdd6',
      colourTertiary: '#84497a',
    },
    variableDynamic_blocks: { // eslint-disable-line camelcase
      colourPrimary: '#a55b99',
      colourSecondary: '#dbbdd6',
      colourTertiary: '#84497a',
    },
    hat_blocks: { // eslint-disable-line camelcase
      colourPrimary: '#a55b99',
      colourSecondary: '#dbbdd6',
      colourTertiary: '#84497a',
      hat: 'cap',
    },
  },
  categoryStyles: {
    colour_category: { // eslint-disable-line camelcase
      colour: '#a5745b',
    },
    list_category: { // eslint-disable-line camelcase
      colour: '#745ba5',
    },
    logic_category: { // eslint-disable-line camelcase
      colour: '#5b80a5',
    },
    loop_category: { // eslint-disable-line camelcase
      colour: '#5ba55b',
    },
    math_category: { // eslint-disable-line camelcase
      colour: '#5b67a5',
    },
    procedure_category: { // eslint-disable-line camelcase
      colour: '#995ba5',
    },
    text_category: { // eslint-disable-line camelcase
      colour: '#5ba58c',
    },
    variable_category: { // eslint-disable-line camelcase
      colour: '#a55b99',
    },
    variable_dynamic_category: { // eslint-disable-line camelcase
      colour: '#a55b99',
    },
  },
  componentStyles: {},
  fontStyle: {},
  startHats: undefined,
});
