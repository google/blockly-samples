/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Backpack demo initialization.
 */
var toolbox = {
  "kind": "categoryToolbox",
  "contents": [
    {
      "kind": "category",
      "name": "Logic",
      "categorystyle": "logic_category",
      "contents": [
        {
          "kind": "block",
          "type": "controls_if"
        },
        {
          "kind": "block",
          "type": "logic_compare"
        },
        {
          "kind": "block",
          "type": "logic_operation"
        },
        {
          "kind": "block",
          "type": "logic_negate"
        },
        {
          "kind": "block",
          "type": "logic_boolean"
        }
      ]
    },
    {
      "kind": "category",
      "name": "Loops",
      "categorystyle": "loop_category",
      "contents": [
        {
          "kind": "block",
          "type": "controls_repeat_ext",
          "values": {
            "TIMES": {
              "block": {
                "type": "math_number",
                "fields": {
                  "NUM": 10
                }
              },
            }
          },
        },
        {
          "kind": "block",
          "type": "controls_flow_statements"
        }
      ]
    },
    {
      "kind": "category",
      "name": "Math",
      "categorystyle": "math_category",
      "contents": [
        {
          "kind": "block",
          "type": "math_number",
          "fields": {
            "NUM": 123
          }
        },
        {
          "kind": "block",
          "type": "math_arithmetic"
        },
        {
          "kind": "block",
          "type": "math_single"
        },
        {
          "kind": "block",
          "type": "math_number_property"
        }
      ]
    },
    {
      "kind": "category",
      "name": "Text",
      "categorystyle": "text_category",
      "contents": [
        {
          "kind": "block",
          "type": "text"
        },
        {
          "kind": "block",
          "type": "text_multiline"
        },
        {
          "kind": "block",
          "type": "text_print"
        },
        {
          "kind": "block",
          "type": "text_prompt_ext"
        }
      ]
    },
    {
      "kind": "category",
      "name": "Variables",
      "categorystyle": "variable_category",
      "custom": "VARIABLE"
    },
    {
      "kind": "category",
      "name": "Functions",
      "categorystyle": "procedure_category",
      "custom": "PROCEDURE"
    }
  ]
};


function init() {
  // Inject primary workspace.
  const primaryWorkspace = Blockly.inject('primaryDiv',
    {
      media: './node_modules/blockly/media/',
      toolbox: toolbox,
      trashcan: true,
    });
  // Inject secondary workspace.
  var secondaryWorkspace = Blockly.inject('secondaryDiv',
    {
      media: './node_modules/blockly/media/',
      toolbox: toolbox,
      trashcan: true,
    });

  // Add backpacks
  const primaryBackpack = new NotificationBackpack(primaryWorkspace);
  primaryBackpack.init();
  const secondaryBackpack = new NotificationBackpack(secondaryWorkspace);
  secondaryBackpack.init();

  // Listen to events on both workspace.
  primaryWorkspace.addChangeListener(updateBackpack);
  secondaryWorkspace.addChangeListener(updateBackpack);

  function updateBackpack(event) {
    if (event.type !== 'backpack_change') {
      return;
    }
    Blockly.Events.disable();
    let contents;
    let targetBackpack;
    if (primaryWorkspace.id === event.workspaceId) {
      targetBackpack = secondaryBackpack;
      contents = primaryBackpack.getContents();
      console.log('second workspace backpack updated');
    } else { // secondaryWorkspace.id === event.workspaceId
      targetBackpack = primaryBackpack;
      contents = secondaryBackpack.getContents();
      console.log('first workspace backpack updated');
    }
    targetBackpack.setContentsAndNotify(contents);
    Blockly.Events.enable();
  }
}
