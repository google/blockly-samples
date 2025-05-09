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
    listBlocks: {
      colourPrimary: '#745ba5',
      colourSecondary: '#c7bddb',
      colourTertiary: '#5d4984',
    },
    logicBlocks: {
      colourPrimary: '#5b80a5',
      colourSecondary: '#bdccdb',
      colourTertiary: '#496684',
    },
    loopBlocks: {
      colourPrimary: '#5ba55b',
      colourSecondary: '#bddbbd',
      colourTertiary: '#498449',
    },
    mathBlocks: {
      colourPrimary: '#5b67a5',
      colourSecondary: '#bdc2db',
      colourTertiary: '#495284',
    },
    procedureBlocks: {
      colourPrimary: '#995ba5',
      colourSecondary: '#d6bddb',
      colourTertiary: '#7a4984',
    },
    textBlocks: {
      colourPrimary: '#5ba58c',
      colourSecondary: '#bddbd1',
      colourTertiary: '#498470',
    },
    variableBlocks: {
      colourPrimary: '#a55b99',
      colourSecondary: '#dbbdd6',
      colourTertiary: '#84497a',
    },
    variableDynamicBlocks: {
      colourPrimary: '#a55b99',
      colourSecondary: '#dbbdd6',
      colourTertiary: '#84497a',
    },
    hatBlocks: {
      colourPrimary: '#a55b99',
      colourSecondary: '#dbbdd6',
      colourTertiary: '#84497a',
      hat: 'cap',
    },
  },
  categoryStyles: {
    colourCategory: {
      colour: '#a5745b',
    },
    listCategory: {
      colour: '#745ba5',
    },
    logicCategory: {
      colour: '#5b80a5',
    },
    loopCategory: {
      colour: '#5ba55b',
    },
    mathCategory: {
      colour: '#5b67a5',
    },
    procedureCategory: {
      colour: '#995ba5',
    },
    textCategory: {
      colour: '#5ba58c',
    },
    variableCategory: {
      colour: '#a55b99',
    },
    variableDynamicCategory: {
      colour: '#a55b99',
    },
  },
  componentStyles: {},
  fontStyle: {},
  startHats: undefined,
});
