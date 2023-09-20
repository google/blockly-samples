/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {factoryBase} from './factory_base';
import * as Blockly from 'blockly';
import {input} from './input';
import {type, typeGroup, typeGroupContainer, typeGroupItem} from './type';
import {fieldDropdown, fieldDropdownContainer, fieldDropdownOptionImage, fieldDropdownOptionText, fieldInput, fieldLabel, fieldNumber} from './fields';

// import for side effects for now
import '../output-generators/factory_base';
import '../output-generators/input';
import '../output-generators/type';
import '../output-generators/fields/text_input';
import '../output-generators/fields/dropdown';
import '../output-generators/fields/number';
import '../output-generators/fields/label';


export const registerAllBlocks = function() {
  Blockly.common.defineBlocks({
    'factory_base': factoryBase,
    'input': input,
    'field_label': fieldLabel,
    'field_input': fieldInput,
    'field_number': fieldNumber,
    'field_dropdown': fieldDropdown,
    'field_dropdown_container': fieldDropdownContainer,
    'field_dropdown_option_text': fieldDropdownOptionText,
    'field_dropdown_option_image': fieldDropdownOptionImage,
    'type_group': typeGroup,
    'type_group_container': typeGroupContainer,
    'type_group_item': typeGroupItem,
    'type': type,
  });
};


