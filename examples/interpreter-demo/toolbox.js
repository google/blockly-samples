/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Shared toolbox for JS-Interpreter demos.
 */

var toolboxJson =
{
  "contents": [
    {
      "kind": "CATEGORY",
      "contents": [
        {
          "kind": "BLOCK",
          "type": "controls_if"
        },
        {
          "kind": "BLOCK",
          "type": "logic_compare"
        },
        {
          "kind": "BLOCK",
          "type": "logic_operation"
        },
        {
          "kind": "BLOCK",
          "type": "logic_negate"
        },
        {
          "kind": "BLOCK",
          "type": "logic_boolean"
        }
      ],
      "name": "Logic",
      "colour": "%{BKY_LOGIC_HUE}"
    },
    {
      "kind": "CATEGORY",
      "contents": [
        {
          "kind": "BLOCK",
          "type": "controls_repeat_ext"
        },
        {
          "kind": "BLOCK",
          "type": "controls_whileUntil"
        }
      ],
      "name": "Loops",
      "colour": "%{BKY_LOOPS_HUE}"
    },
    {
      "kind": "CATEGORY",
      "contents": [
        {
          "kind": "BLOCK",
          "type": "math_number"
        },
        {
          "kind": "BLOCK",
          "type": "math_arithmetic"
        },
        {
          "kind": "BLOCK",
          "type": "math_single"
        }
      ],
      "name": "Math",
      "colour": "%{BKY_MATH_HUE}"
    },
    {
      "kind": "CATEGORY",
      "contents": [
        {
          "kind": "BLOCK",
          "type": "text"
        },
        {
          "kind": "BLOCK",
          "type": "text_length"
        },
        {
          "kind": "BLOCK",
          "type": "text_print"
        },
        {
          "kind": "BLOCK",
          "type": "text_prompt_ext"
        }
      ],
      "name": "Text",
      "colour": "%{BKY_TEXTS_HUE}"
    },
    {
      "kind": "SEP"
    },
    {
      "kind": "CATEGORY",
      "contents": [],
      "name": "Variables",
      "custom": "VARIABLE",
      "colour": "%{BKY_VARIABLES_HUE}"
    },
    {
      "kind": "CATEGORY",
      "contents": [],
      "name": "Functions",
      "custom": "PROCEDURE",
      "colour": "%{BKY_PROCEDURES_HUE}"
    }
  ]
};
