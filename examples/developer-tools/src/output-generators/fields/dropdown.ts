/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  JsonDefinitionGenerator,
  jsonDefinitionGenerator,
} from '../json_definition_generator';
import {DropdownOptionData, FieldDropdownBlock} from '../../blocks/fields';

jsonDefinitionGenerator.forBlock['field_dropdown'] = function (
  block: FieldDropdownBlock,
  generator: JsonDefinitionGenerator,
): string {
  const code: Record<string, string | Array<[DropdownOptionData, string]>> = {
    type: 'field_dropdown',
    name: block.getFieldValue('FIELDNAME'),
  };
  const options: Array<[DropdownOptionData, string]> = [];
  for (let i = 0; i < block.optionList.length; i++) {
    options.push([block.getUserData(i), block.getFieldValue('CPU' + i)]);
  }

  if (options.length === 0) {
    // If there are no options in the dropdown, the field isn't valid.
    // Remove it from the list of fields by returning an empty string.
    return '';
  }

  code.options = options;
  return JSON.stringify(code);
};
