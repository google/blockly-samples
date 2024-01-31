/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

const blockStyles = {
  input: {
    colourPrimary: '210',
  },
  connectionCheck: {
    colourPrimary: '230',
  },
  field: {
    colourPrimary: '160',
  },
  colour: {
    colourPrimary: '20',
  },
  base: {
    colourPrimary: '120',
  },
};

const categoryStyles = {
  input: {colour: '210'},
  connectionCheck: {colour: '230'},
  field: {colour: '160'},
  colour: {colour: '20'},
};

export const theme = Blockly.Theme.defineTheme('blockFactoryTheme', {
  base: Blockly.Themes.Classic,
  name: 'blockFactoryTheme',
  blockStyles,
  categoryStyles,
});
