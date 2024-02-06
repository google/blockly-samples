/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {factoryBase} from './factory_base';
import * as Blockly from 'blockly/core';
import {input} from './input';
import {
  connectionCheck,
  connectionCheckGroup,
  connectionCheckContainer,
  connectionCheckItem,
} from './connection_check';
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

// import for side effects for now
import '../output-generators/factory_base';
import '../output-generators/input';
import '../output-generators/connection_check';
import '../output-generators/fields/text_input';
import '../output-generators/fields/dropdown';
import '../output-generators/fields/number';
import '../output-generators/fields/label';
import '../output-generators/fields/label_serializable';
import '../output-generators/fields/checkbox';
import '../output-generators/fields/image';
import '../output-generators/fields/variable';
import '../output-generators/colour';

/* eslint-disable @typescript-eslint/naming-convention
 -- Blockly convention is to use snake_case for block names
*/
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
    connection_check_group: connectionCheckGroup,
    connection_check_group_container: connectionCheckContainer,
    connection_check_group_item: connectionCheckItem,
    connection_check: connectionCheck,
    colour_hue: colourHue,
  });
};
/* eslint-enable @typescript-eslint/naming-convention */
