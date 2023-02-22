/**
 * @license
 *
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Define custom blocks.
 * @author samelh@google.com (Sam El-Husseini)
 */

// More on defining blocks:
// https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks


import * as Blockly from 'blockly/core';

// Since we're using json to initialize the field, we'll need to import it.
import '../fields/BlocklyReactField';
import '../fields/DateField';

import '@blockly/field-date';

let reactDateField = {
        "type": "test_react_date_field",
        "message0": "date field: %1",
        "args0": [
            {
                "type": "field_date",
                "name": "DATE",
                "date": "2020-02-20"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
    };

Blockly.Blocks['test_react_date_field'] = {
  init: function() {
    this.jsonInit(reactDateField);
    this.setStyle('loop_blocks');
  }
}

var testReactField = {
  "type": "test_react_field",
  "message0": "custom field %1",
  "args0": [
    {
      "type": "field_react_component",
      "name": "FIELD",
      "text": "Click me"
    },
  ],
  "previousStatement": null,
  "nextStatement": null,
};

Blockly.Blocks['test_react_field'] = {
  init: function() {
    this.jsonInit(testReactField);
    this.setStyle('loop_blocks');
  }
};
