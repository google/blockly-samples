/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Input',
      categorystyle: 'input',
      contents: [
        {
          kind: 'block',
          type: 'input',
          fields: {
            INPUTTYPE: 'input_value',
          },
        },
        {
          kind: 'block',
          type: 'input',
          fields: {
            INPUTTYPE: 'input_statement',
          },
        },
        {
          kind: 'block',
          type: 'input',
          fields: {
            INPUTTYPE: 'input_dummy',
          },
        },
        {
          kind: 'block',
          type: 'input',
          fields: {
            INPUTTYPE: 'input_end_row',
          },
        },
      ],
    },
    {
      kind: 'category',
      name: 'Fields',
      categorystyle: 'field',
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
        {
          kind: 'block',
          type: 'field_angle',
        },
        {
          kind: 'block',
          type: 'field_colour',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Connection Checks',
      categorystyle: 'connectionCheck',
      contents: [
        {
          kind: 'block',
          type: 'connection_check_group',
        },
        {
          kind: 'block',
          type: 'connection_check',
          fields: {
            CHECKDROPDOWN: 'null',
          },
        },
        {
          kind: 'block',
          type: 'connection_check',
          fields: {
            CHECKDROPDOWN: 'Boolean',
          },
        },
        {
          kind: 'block',
          type: 'connection_check',
          fields: {
            CHECKDROPDOWN: 'Number',
          },
        },
        {
          kind: 'block',
          type: 'connection_check',
          fields: {
            CHECKDROPDOWN: 'String',
          },
        },
        {
          kind: 'block',
          type: 'connection_check',
          fields: {
            CHECKDROPDOWN: 'Array',
          },
        },
        {
          kind: 'block',
          type: 'connection_check',
          fields: {
            CHECKDROPDOWN: 'CUSTOM',
            CUSTOMCHECK: 'custom check',
          },
        },
      ],
    },
    {
      kind: 'category',
      name: 'Colour',
      categorystyle: 'colour',
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
