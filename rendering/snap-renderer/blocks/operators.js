
/**
 * @license
 * 
 * Copyright 2020 Google LLC
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

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
    // Block for text value
    {
      "type": "operators_plus",
      "message0": "%1 + %2",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "B",
          "check": "Number"
        }
      ],
      "output": null,
      "inputsInline": true,
      "style": "operator_blocks",
    }
  ]);
  