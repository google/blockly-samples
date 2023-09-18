/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export const toolbox = {
  'kind': 'categoryToolbox',
  'contents': [
    {
      'kind': 'category',
      'name': 'Input',
      'categorystyle': 'logic_category',
      'contents': [
        {
          'kind': 'block',
          'type': 'input',
          'fields': {
            'INPUT_TYPE': 'input_value',
          },
        },
        {
          'kind': 'block',
          'type': 'input',
          'fields': {
            'INPUT_TYPE': 'input_statement',
          },
        },
        {
          'kind': 'block',
          'type': 'input',
          'fields': {
            'INPUT_TYPE': 'input_dummy',
          },
        },
        {
          'kind': 'block',
          'type': 'input',
          'fields': {
            'INPUT_TYPE': 'input_end_row',
          },
        },
      ],
    },
  ],
};
