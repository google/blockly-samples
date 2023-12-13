/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {getSummary} from './llm';

const originalToString = Blockly.BlockSvg.prototype.toString;
/**
 * If the LLM-generated summary of a block already exists, return
 * that. If not, return the normal collapsed block string, but
 * also fetch an LLM-summary and update the block when it returns.
 * @returns The LLM-generated summary of the block if it exists,
 *     or else the normal collapsed block string.
 */
Blockly.BlockSvg.prototype.toString = function() {
  if (!this.llmSummary && !this.tryingToGetLlmSummary) {
    this.tryingToGetLlmSummary = true;
    getSummary(this).then(summary => {
      this.tryingToGetLlmSummary = false;
      // this.llmSummary = summary;
      this.llmSummary = summary;
      this.renderEfficiently();
    }).catch(reason => {
      this.tryingToGetLlmSummary = false;
      console.log(reason);
    });
  }

  return this.llmSummary ?? originalToString.call(this);
};

const originalCollapse = Blockly.BlockSvg.prototype.setCollapsed;
Blockly.BlockSvg.prototype.setCollapsed = function(collapsed) {
  // If we're expanding the block, clear its llmSummary because
  // it might change while it is uncollapsed.
  if (!collapsed) this.llmSummary = null;
  originalCollapse.call(this, collapsed);
};

Blockly.BlockSvg.prototype.updateCollapsed_ = function() {
  const collapsed = this.isCollapsed();
  const collapsedInputName = Blockly.constants.COLLAPSED_INPUT_NAME;
  const collapsedFieldName = Blockly.constants.COLLAPSED_FIELD_NAME;

  for (let i = 0, input; (input = this.inputList[i]); i++) {
    if (input.name !== collapsedInputName) {
      input.setVisible(!collapsed);
    }
  }

  for (const icon of this.getIcons()) {
    icon.updateCollapsed();
  }

  if (!collapsed) {
    this.updateDisabled();
    let i = 0;
    while(this.getInput(collapsedInputName + i)) {
      this.removeInput(collapsedInputName + i);
    }
    return;
  }

  const text = this.toString();
  const strings = Blockly.utils.string.wrap(text, 50).split('\n');
  for (let i = 0; i < strings.length; i++) {
    this.appendDummyInput(collapsedInputName + i)
        .appendField(strings[i], collapsedFieldName + i);
  }
  // const field = this.getField(collapsedFieldName);
  // if (field) {
  //   field.setValue(text);
  //   return;
  // }
  // const input =
  //   this.getInput(collapsedInputName) ||
  //   this.appendDummyInput(collapsedInputName);
  // input.appendField(new FieldLabel(text), collapsedFieldName);
}
