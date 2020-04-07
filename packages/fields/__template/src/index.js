/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview TODO: Add field overview.
 */

import Blockly from 'blockly/core';

/**
 * TODO: Rename plugin and add plugin description.
 */
export default class FieldTemplate extends Blockly.Field {
  /**
   * Constructs a FieldTemplate from a JSON arg object.
   * @param {!Object} options A JSON object with options.
   * @return {!FieldTemplate} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options) {
    return new FieldTemplate(options['value']);
  }
}

Blockly.fieldRegistry.register('field_template', FieldTemplate);
