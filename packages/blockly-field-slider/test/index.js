/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Slider field test playground.
 * @author kozbial@google.com (Monica Kozbial)
 */
console.log(Blockly.fieldRegistry.typeMap_);

Blockly.defineBlocksWithJsonArray([
  {
    "type": "test_field_slider",
    "message0": "slider: %1",
    "args0": [
      {
        "type": "field_slider",
        "name": "FIELDNAME",
        "value": 50,
        "alt":
            {
              "type": "field_label",
              "text": "NO_SLIDER_FIELD"
            }
      }
    ],
    "style": "math_blocks",
  }]);

document.addEventListener("DOMContentLoaded", function () {
  Blockly.inject('blocklyDiv',
      {
        toolbox: document.getElementById('blocklyToolbox')
      });
});