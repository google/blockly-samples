/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

import Blockly from 'blockly/core';
import './blocks';

/**
 * The Serialization category.
 */
export const category = {
  'kind': 'CATEGORY',
  'name': 'Serialization',
  'contents': [
    {
      'kind': 'BUTTON',
      'text': 'randomize text',
      'callbackkey': 'randomizeText',
    },
    {
      'kind': 'BLOCK',
      'type': 'test_field_serialization_no_overrides',
    },
    {
      'kind': 'BLOCK',
      'type': 'test_field_serialization_xml',
    },
    {
      'kind': 'BLOCK',
      'type': 'test_field_serialization_jso',
    },
    {
      'kind': 'BLOCK',
      'type': 'test_field_serialization_both',
    },
    {
      'kind': 'sep',
    },
    {
      'kind': 'BLOCK',
      'blockxml': '<block type="test_extra_state_xml">' +
          '<mutation items="2"></mutation>' +
          '</block>',
    },
    {
      'kind': 'BLOCK',
      'type': 'test_extra_state_jso',
      'extraState': {
        'itemCount': 2,
      },
    },
    {
      'kind': 'BLOCK',
      'type': 'test_extra_state_both',
      'extraState': {
        'itemCount': 2,
      },
    },
  ],
};

/**
 * Initialize this toolbox category.
 * @param {!Blockly.WorkspaceSvg} workspace The Blockly workspace.
 */
export function onInit(workspace) {
  const randomizeText = function(button) {
    const blocks = [
      ...button.workspace_.getBlocksByType(
          'test_field_serialization_no_overrides'),
      ...button.workspace_.getBlocksByType(
          'test_field_serialization_xml'),
      ...button.workspace_.getBlocksByType(
          'test_field_serialization_jso'),
      ...button.workspace_.getBlocksByType(
          'test_field_serialization_both')];
    const possible = 'ABCDEF';
    for (let i = 0, block; block = blocks[i]; i++) {
      let text = '';
      for (let j = 0; j < 4; j++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      block.setFieldValue(text, 'LABEL');
    }
  };
  workspace.registerButtonCallback('randomizeText', randomizeText);
}

