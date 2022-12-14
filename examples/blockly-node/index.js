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

var Blockly = require('blockly');
var {pythonGenerator} = require('blockly/python');

var json = {
  "blocks": {
    "languageVersion": 0,
    "blocks": [
      {
        "type": "text_print",
        "id": "0b61B|)zMnTbwbPAG1iG",
        "x": 113,
        "y": 238,
        "inputs": {
          "TEXT": {
            "shadow": {
              "type": "text",
              "id": "_!OgDm+,dRCHii(i|kdL",
              "fields": {
                "TEXT": "Hello from Blockly!"
              }
            }
          }
        }
      }
    ]
  }
}

try {
  // Create workspace and load JSON
  var workspace = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(json, workspace);
  // Convert code and log output
  var code = pythonGenerator.workspaceToCode(workspace);
  console.log(code);
}
catch (e) {
  console.log(e);
}
