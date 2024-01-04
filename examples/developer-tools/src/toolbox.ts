/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Input',
      categorystyle: 'logic_category',
      contents: [
        {
          kind: 'block',
          type: 'input',
          fields: {
            INPUT_TYPE: 'input_value',
          },
        },
        {
          kind: 'block',
          type: 'input',
          fields: {
            INPUT_TYPE: 'input_statement',
          },
        },
        {
          kind: 'block',
          type: 'input',
          fields: {
            INPUT_TYPE: 'input_dummy',
          },
        },
        {
          kind: 'block',
          type: 'input',
          fields: {
            INPUT_TYPE: 'input_end_row',
          },
        },
      ],
    },
    {
      kind: 'category',
      name: 'Fields',
      categorystyle: 'text_category',
      contents: [
        {
          kind: 'block',
          type: 'field_label',
        },
        {
          kind: 'block',
          type: 'field_label_serializable',
        },
        {
          kind: 'block',
          type: 'field_input',
        },
        {
          kind: 'block',
          type: 'field_number',
        },
        {
          kind: 'block',
          type: 'field_dropdown',
        },
        {
          kind: 'block',
          type: 'field_checkbox',
        },
        {
          kind: 'block',
          type: 'field_variable',
        },
        {
          kind: 'block',
          type: 'field_image',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Type',
      categorystyle: 'math_category',
      contents: [
        {
          kind: 'block',
          type: 'type_group',
        },
        {
          kind: 'block',
          type: 'type',
          fields: {
            TYPEDROPDOWN: 'null',
          },
        },
        {
          kind: 'block',
          type: 'type',
          fields: {
            TYPEDROPDOWN: 'Boolean',
          },
        },
        {
          kind: 'block',
          type: 'type',
          fields: {
            TYPEDROPDOWN: 'Number',
          },
        },
        {
          kind: 'block',
          type: 'type',
          fields: {
            TYPEDROPDOWN: 'String',
          },
        },
        {
          kind: 'block',
          type: 'type',
          fields: {
            TYPEDROPDOWN: 'Array',
          },
        },
        {
          kind: 'block',
          type: 'type',
          fields: {
            TYPEDROPDOWN: 'CUSTOM',
          },
        },
      ],
    },
    {
      kind: 'category',
      name: 'Colour',
      categorystyle: 'colour_category',
      contents: [
        {
          kind: 'block',
          type: 'colour_hue',
          fields: {
            HUE: 20,
          },
        },
        {
          kind: 'block',
          type: 'colour_hue',
          fields: {
            HUE: 65,
          },
        },
        {
          kind: 'block',
          type: 'colour_hue',
          fields: {
            HUE: 120,
          },
        },
        {
          kind: 'block',
          type: 'colour_hue',
          fields: {
            HUE: 160,
          },
        },
        {
          kind: 'block',
          type: 'colour_hue',
          fields: {
            HUE: 210,
          },
        },
        {
          kind: 'block',
          type: 'colour_hue',
          fields: {
            HUE: 230,
          },
        },
        {
          kind: 'block',
          type: 'colour_hue',
          fields: {
            HUE: 260,
          },
        },
        {
          kind: 'block',
          type: 'colour_hue',
          fields: {
            HUE: 290,
          },
        },
        {
          kind: 'block',
          type: 'colour_hue',
          fields: {
            HUE: 330,
          },
        },
      ],
    },
  ],
};
