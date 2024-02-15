/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import {ViewModel} from './view_model';
import {JavascriptDefinitionGenerator} from './output-generators/javascript_definition_generator';
import {JsonDefinitionGenerator} from './output-generators/json_definition_generator';

export class Controller {
  constructor(
    private mainWorkspace: Blockly.WorkspaceSvg,
    private previewWorkspace: Blockly.WorkspaceSvg,
    private viewModel: ViewModel,
    private jsGenerator: JavascriptDefinitionGenerator,
    private jsonGenerator: JsonDefinitionGenerator,
  ) {
    // Add event listeners to update when output config elements are changed
    this.viewModel.outputConfigDiv.addEventListener('change', () => {
      this.updateOutput();
    });
  }

  /** Shows the JavaScript definition of the block factory block. */
  showJavaScriptDefinition() {
    const blockDefinitionString = this.jsGenerator.workspaceToCode(
      this.mainWorkspace,
    );
    this.viewModel.definitionDiv.textContent = blockDefinitionString;
  }

  /** Shows the JSON definition of the block factory block. */
  showJsonDefinition() {
    const blockDefinitionString = this.jsonGenerator.workspaceToCode(
      this.mainWorkspace,
    );
    this.viewModel.definitionDiv.textContent = blockDefinitionString;
  }

  /**
   * Updates all of the output for the block factory,
   * including the preview, definition, generators, etc.
   */
  updateOutput() {
    if (this.viewModel.getBlockDefinitionFormat() === 'json') {
      this.showJsonDefinition();
    } else {
      this.showJavaScriptDefinition();
    }

    this.updateBlockPreview();
  }

  /** Updates the block preview pane. */
  updateBlockPreview() {
    this.previewWorkspace.clear();
    const blockDefinitionString = this.jsonGenerator.workspaceToCode(
      this.mainWorkspace,
    );
    const blockDefinition = JSON.parse(blockDefinitionString);
    // use a fake name so that we never get conflicts with built-in blocks
    const blockName = 'blockly_block_factory_preview_block';
    blockDefinition.type = blockName;

    // delete the old block definition so we don't get warnings about overwriting
    delete Blockly.Blocks[blockName];
    Blockly.common.defineBlocks(
      Blockly.common.createBlockDefinitionsFromJsonArray([blockDefinition]),
    );

    // TODO: After Blockly v11, won't need to call `initSvg` and `render` directly.
    const block = this.previewWorkspace.newBlock(blockName);
    block.initSvg();
    block.render();
  }
}
