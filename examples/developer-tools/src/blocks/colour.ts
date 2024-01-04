/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';

/**
 * A hue-picker to set the colour of a block.
 * TODO: Use the new angle field.
 */
export const colourHue = {
  init: function () {
    this.appendDummyInput()
      .appendField('hue:')
      .appendField(new Blockly.FieldAngle('0', this.validator), 'HUE');
    this.setOutput(true, 'Colour');
    this.setTooltip('Paint the block with this colour.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=55');
  },
  validator: function (text: string) {
    // Update the current block's colour to match.
    const hue = parseInt(text, 10);
    if (!isNaN(hue)) {
      this.getSourceBlock().setColour(hue);
    }
  },
};
