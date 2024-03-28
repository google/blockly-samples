/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import * as storage from './storage';
import {createNewBlock, load} from './serialization';
import {ViewModel} from './view_model';
import {JavascriptDefinitionGenerator} from './output-generators/javascript_definition_generator';
import {JsonDefinitionGenerator} from './output-generators/json_definition_generator';
import {CodeHeaderGenerator} from './output-generators/code_header_generator';
import {Menu} from '@material/web/menu/menu';

export class Controller {
  constructor(
    private mainWorkspace: Blockly.WorkspaceSvg,
    private previewWorkspace: Blockly.WorkspaceSvg,
    private viewModel: ViewModel,
    private jsGenerator: JavascriptDefinitionGenerator,
    private jsonGenerator: JsonDefinitionGenerator,
    private importHeaderGenerator: CodeHeaderGenerator,
    private scriptHeaderGenerator: CodeHeaderGenerator,
  ) {
    // Add event listeners to update when output config elements are changed
    this.viewModel.outputConfigDiv.addEventListener('change', () => {
      this.updateOutput();
    });

    this.viewModel.createButton.addEventListener('click', () => {
      this.handleCreateButton();
    });

    this.viewModel.deleteButton.addEventListener('click', () => {
      this.handleDeleteButton();
    });

    this.viewModel.loadMenu.addEventListener('close-menu', (e) => {
      this.handleLoadSelect(e);
    });

    this.viewModel.loadButton.addEventListener('click', () => {
      this.handleLoadButton();
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

  showImportHeaders() {
    const headers = this.importHeaderGenerator.workspaceToCode(
      this.mainWorkspace,
    );
    this.viewModel.codeHeadersDiv.textContent = headers;
  }

  showScriptHeaders() {
    const headers = this.scriptHeaderGenerator.workspaceToCode(
      this.mainWorkspace,
    );
    this.viewModel.codeHeadersDiv.textContent = headers;
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

    if (this.viewModel.getCodeHeaderStyle() === 'import') {
      this.showImportHeaders();
    } else {
      this.showScriptHeaders();
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

  /** Handles a click on the "Create new block" button. */
  private handleCreateButton() {
    createNewBlock(this.mainWorkspace);
  }

  /** Handles a click on the "Delete" button. */
  private handleDeleteButton() {
    const blockName = this.mainWorkspace
      .getBlocksByType('factory_base')[0]
      .getFieldValue('NAME');
    Blockly.dialog.confirm(
      `Are you sure you want to delete block "${blockName}"?`,
      (ok) => {
        if (!ok) return;
        storage.removeBlock(blockName);

        // Loads a previously saved block or creates a new one, so the workspace is never empty
        load(this.mainWorkspace);
      },
    );
  }

  /** Handles a click on the "Load existing block" button. */
  private handleLoadButton() {
    this.populateLoadMenu();
    const menuEl = this.viewModel.loadMenu as Menu;
    menuEl.open = !menuEl.open;
  }

  /**
   * Handles selecting a block from the load menu, whether selected via keyboard or mouse.
   *
   * @param e Custom event fired when the menu is closed.
   */
  private handleLoadSelect(e: Event) {
    if (e.target && e.target instanceof HTMLElement) {
      const blockName = e.target.getAttribute('data-id');
      load(this.mainWorkspace, blockName);
    }
  }

  /**
   * Populates the load menu with the list of blocks.
   * This is called every time the load menu is opened,
   * so it's always up-to-date with the name of the blocks,
   * selected block, and list of currently-existing blocks.
   */
  private populateLoadMenu() {
    const menuEl = this.viewModel.loadMenu;
    const newItems = Array.from(storage.getAllSavedBlockNames()).map((name) => {
      const el = document.createElement('md-menu-item');
      el.setAttribute('data-id', name);
      const div = document.createElement('div');
      div.setAttribute('slot', 'headline');
      if (name === storage.getLastEditedBlockName()) {
        el.setAttribute('selected', 'true');
      }
      div.innerText = name;
      el.appendChild(div);
      return el;
    });
    menuEl.replaceChildren(...newItems);
  }
}
