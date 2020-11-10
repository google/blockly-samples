---
title: "Pitch Field"
files:
  - "index.html"
  - "blocks.js"
  - "field_pitch.js"
  - "pitch.css"
  - "media/*"
pageRoot: "examples/pitch-field-demo"

---
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Pitch field demo blocks.
 * @author samelh@gmail.com (Sam El-Husseini)
 */

Blockly.Blocks['test_pitch_field'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('pitch')
        .appendField(new CustomFields.FieldPitch('7'), 'PITCH');
    this.setStyle('loop_blocks');
  }
};
