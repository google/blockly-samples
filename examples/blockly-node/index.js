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
 * @fileoverview Example of including Blockly in Node (Common JS)
 * @author samelh@google.com (Sam El-Husseini)
 */

let Blockly = require('blockly');

let toolbox = {
  "kind": "blockly-node",
  "contents": [
    {
      "kind": "block",
      "type": "text_print",
      "contents": [
        {
          "kind": "value",
          "name": "TEXT",
          "contents": [
            {
              "kind": "shadow",
              "type": "text",
              "contents": [
                {
                  "kind": "field",
                  "name": "TEXT",
                  "value": "Hello from Blockly!"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

try {
  var workspace = new Blockly.Workspace();
  // Blockly.inject('blocklyDiv', { toolbox: toolbox });
  console.log(JSON.stringify(toolbox));
}
catch (e) {
  console.log(e);
}