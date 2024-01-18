/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {factoryBase} from './factory_base';
import * as Blockly from 'blockly/core';
import {input} from './input';
import {type, typeGroup, typeGroupContainer, typeGroupItem} from './type';
import {
  fieldCheckbox,
  fieldDropdown,
  fieldDropdownContainer,
  fieldDropdownOptionImage,
  fieldDropdownOptionText,
  fieldImage,
  fieldInput,
  fieldLabel,
  fieldLabelSerializable,
  fieldNumber,
  fieldVariable,
} from './fields';
import {colourHue} from './colour';

export const registerAllBlocks = function () {
  Blockly.common.defineBlocks({
    factory_base: factoryBase,
    input: input,
    field_label: fieldLabel,
    field_label_serializable: fieldLabelSerializable,
    field_input: fieldInput,
    field_number: fieldNumber,
    field_dropdown: fieldDropdown,
    field_dropdown_container: fieldDropdownContainer,
    field_dropdown_option_text: fieldDropdownOptionText,
    field_dropdown_option_image: fieldDropdownOptionImage,
    field_checkbox: fieldCheckbox,
    field_variable: fieldVariable,
    field_image: fieldImage,
    type_group: typeGroup,
    type_group_container: typeGroupContainer,
    type_group_item: typeGroupItem,
    type: type,
    colour_hue: colourHue,
  });
};
