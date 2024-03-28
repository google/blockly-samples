/**
 *   @license
 *   Copyright 2024 Google LLC
 *   SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A custom toolbox for the plugin test.
 */

export const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Logic',
      categorystyle: 'logic_category',
      contents: [
        {
          type: 'controls_if',
          kind: 'block',
        },
        {
          type: 'logic_compare',
          kind: 'block',
          fields: {
            OP: 'EQ',
          },
        },
        {
          type: 'logic_operation',
          kind: 'block',
          fields: {
            OP: 'AND',
          },
        },
      ],
    },
    {
      kind: 'category',
      name: 'Loops',
      categorystyle: 'loop_category',
      contents: [
        {
          type: 'controls_repeat_ext',
          kind: 'block',
          inputs: {
            TIMES: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 10,
                },
              },
            },
          },
        },
        {
          type: 'controls_repeat',
          kind: 'block',
          enabled: false,
          fields: {
            TIMES: 10,
          },
        },
        {
          type: 'controls_whileUntil',
          kind: 'block',
          fields: {
            MODE: 'WHILE',
          },
        },
        {
          type: 'controls_for',
          kind: 'block',
          fields: {
            VAR: {
              name: 'i',
            },
          },
          inputs: {
            FROM: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
            TO: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 10,
                },
              },
            },
            BY: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 1,
                },
              },
            },
          },
        },
        {
          type: 'controls_forEach',
          kind: 'block',
          fields: {
            VAR: {
              name: 'j',
            },
          },
        },
        {
          type: 'controls_flow_statements',
          kind: 'block',
          enabled: false,
          fields: {
            FLOW: 'BREAK',
          },
        },
      ],
    },
    {
      kind: 'sep',
    },
    {
      kind: 'category',
      name: 'Variables',
      custom: 'VARIABLE',
      categorystyle: 'variable_category',
    },
    {
      kind: 'category',
      name: 'Buttons and Blocks',
      categorystyle: 'loop_category',
      contents: [
        {
          type: 'controls_repeat',
          kind: 'block',
          fields: {
            TIMES: 10,
          },
        },
        {
          kind: 'BUTTON',
          text: 'Randomize Button Style',
          callbackkey: 'setRandomStyle',
        },
        {
          kind: 'BUTTON',
          text: 'Randomize Button Style',
          callbackkey: 'setRandomStyle',
        },
        {
          type: 'controls_repeat',
          kind: 'block',
          fields: {
            TIMES: 10,
          },
        },
        {
          kind: 'BUTTON',
          text: 'Randomize Button Style',
          callbackkey: 'setRandomStyle',
        },
      ],
    },
    {
      kind: 'sep',
    },
    {
      kind: 'category',
      name: 'Nested Categories',
      contents: [
        {
          kind: 'category',
          name: 'sub-category 1',
          contents: [
            {
              kind: 'BUTTON',
              text: 'Randomize Button Style',
              callbackkey: 'setRandomStyle',
            },
            {
              type: 'logic_boolean',
              kind: 'block',
              fields: {
                BOOL: 'TRUE',
              },
            },
          ],
        },
        {
          kind: 'category',
          name: 'sub-category 2',
          contents: [
            {
              type: 'logic_boolean',
              kind: 'block',
              fields: {
                BOOL: 'FALSE',
              },
            },
            {
              kind: 'BUTTON',
              text: 'Randomize Button Style',
              callbackkey: 'setRandomStyle',
            },
          ],
        },
      ],
    },
  ],
};
