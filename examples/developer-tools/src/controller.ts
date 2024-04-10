/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import * as storage from './storage';
import {createNewBlock, loadBlock, loadBlockFromData} from './serialization';
import {ViewModel} from './view_model';
import {JavascriptDefinitionGenerator} from './output-generators/javascript_definition_generator';
import {JsonDefinitionGenerator} from './output-generators/json_definition_generator';
import {CodeHeaderGenerator} from './output-generators/code_header_generator';
import {Menu} from '@material/web/menu/menu';
import {GeneratorStubGenerator} from './output-generators/generator_stub_generator';
import {convertBaseBlock} from './backwards_compatibility';

const IMPORT_BLOCK_FACTORY_ID = 'Import from block factory...';

/**
 * This class handles updating the UI output, including refreshing the block preview,
 * updating the generator output, etc.
 */
export class Controller {
  constructor(
    private mainWorkspace: Blockly.WorkspaceSvg,
    private previewWorkspace: Blockly.WorkspaceSvg,
    private viewModel: ViewModel,
    private jsGenerator: JavascriptDefinitionGenerator,
    private jsonGenerator: JsonDefinitionGenerator,
    private importHeaderGenerator: CodeHeaderGenerator,
    private scriptHeaderGenerator: CodeHeaderGenerator,
    private generatorStubGenerator: GeneratorStubGenerator,
  ) {
    // Add event listeners to update when output config elements are changed
    this.viewModel.outputConfigDiv.addEventListener('change', () => {
      this.saveBlockFactorySettings();
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

    this.viewModel.fileModalCloseButton.addEventListener('click', () => {
      this.viewModel.toggleFileUploadModal(false);
    });

    this.viewModel.fileDropZone.addEventListener('drop', (e) => {
      this.handleFileDrop(e);
    });

    this.viewModel.fileUploadInput.addEventListener('change', () => {
      this.handleFileUpload();
    });

    this.viewModel.fileLabel.addEventListener('keydown', function (ev) {
      // Clicks the file input if you hit enter on the label for the input
      if (ev.key === 'Enter') (ev.target as HTMLElement).click();
    });

    this.viewModel.fileDropZone.addEventListener('dragover', (ev) => {
      ev.preventDefault();
      this.viewModel.fileDropZone.classList.add('isDragging');
    });

    this.viewModel.fileDropZone.addEventListener('dragleave', (ev) => {
      ev.preventDefault();
      this.viewModel.fileDropZone.classList.remove('isDragging');
    });

    // Load previously-saved settings once on page load
    this.loadBlockFactorySettings();
  }

  private saveBlockFactorySettings() {
    const settings = {
      blockDefinitionFormat: this.viewModel.getBlockDefinitionFormat(),
      codeGeneratorLanguage: this.viewModel.getCodeGeneratorLanguage(),
      codeHeaderStyle: this.viewModel.getCodeHeaderStyle(),
    };
    storage.saveBlockFactorySettings(settings);
  }

  private loadBlockFactorySettings() {
    const settings = storage.loadBlockFactorySettings();
    if (settings) {
      this.viewModel.setBlockDefinitionFormat(settings.blockDefinitionFormat);
      this.viewModel.setCodeGeneratorLanguage(settings.codeGeneratorLanguage);
      this.viewModel.setCodeHeaderStyle(settings.codeHeaderStyle);
    }
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

  /** Shows code headers for loading Blockly and other deps using imports. */
  showImportHeaders() {
    this.importHeaderGenerator.setLanguage(
      this.viewModel.getCodeGeneratorLanguage(),
    );
    const headers = this.importHeaderGenerator.workspaceToCode(
      this.mainWorkspace,
    );
    this.viewModel.codeHeadersDiv.textContent = headers;
  }

  /** Shows code headers for loading Blockly and other deps using script tags. */
  showScriptHeaders() {
    this.scriptHeaderGenerator.setLanguage(
      this.viewModel.getCodeGeneratorLanguage(),
    );
    const headers = this.scriptHeaderGenerator.workspaceToCode(
      this.mainWorkspace,
    );
    this.viewModel.codeHeadersDiv.textContent = headers;
  }

  /**
   * Shows the code generator stub for the currently selected programming
   * language and import style.
   */
  updateGeneratorStub() {
    const scriptMode = this.viewModel.getCodeHeaderStyle() === 'script';
    this.generatorStubGenerator.setScriptMode(scriptMode);
    this.generatorStubGenerator.setLanguage(
      this.viewModel.getCodeGeneratorLanguage(),
    );

    const generatorStub = this.generatorStubGenerator.workspaceToCode(
      this.mainWorkspace,
    );
    this.viewModel.generatorStubDiv.textContent = generatorStub;
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

    this.updateGeneratorStub();

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
        loadBlock(this.mainWorkspace);
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
      if (blockName === IMPORT_BLOCK_FACTORY_ID) {
        this.handleLoadFromFile();
        return;
      }
      loadBlock(this.mainWorkspace, blockName);
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
    const optionNames = Array.from(storage.getAllSavedBlockNames());
    optionNames.push(IMPORT_BLOCK_FACTORY_ID);
    const newItems = optionNames.map((name) => {
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

  /** Shows the file upload modal when the user selects that option from the load menu. */
  private handleLoadFromFile() {
    this.viewModel.toggleFileUploadModal(true);
  }

  /**
   * Handles the drag event that occurs when a user drops a file onto the file upload
   * drag-n-drop zone. Gets the first file of the type we want and attempts to load it
   * into the block factory editor.
   *
   * @param e drop event
   */
  private handleFileDrop(e: DragEvent) {
    // Prevent default behavior (Prevent file from being opened)
    e.preventDefault();

    this.viewModel.toggleFileUploadWarning(false);

    this.viewModel.fileDropZone.classList.remove('isDragging');

    if (!e.dataTransfer.items) return;

    const firstItem = [...e.dataTransfer.items].find((item) => {
      // Get the first plain text file, in case the user uploaded multiple
      if (item.kind === 'file' && item.type === 'text/plain') {
        return true;
      }
    });

    if (!firstItem) {
      this.viewModel.toggleFileUploadWarning(true);
      return;
    }
    this.loadFromFile(firstItem.getAsFile());
  }

  /**
   * Handles the event that occurs when a user picks a file from the file input.
   * Attempts to load the file into the block factory editor.
   */
  private handleFileUpload() {
    this.viewModel.toggleFileUploadWarning(false);
    const input = this.viewModel.fileUploadInput as HTMLInputElement;
    const file = input.files[0];
    if (!file) return;
    this.loadFromFile(file);
  }

  /**
   * Given a file, tries to run it through our backwards-compatibility converter
   * and load the block into block factory. If there's an error at any point,
   * we show a warning and allow the user to try the upload again.
   *
   * @param file File containing the block json to load. This should be the file
   *    downloaded directly from the old block factory tool.
   */
  private loadFromFile(file: File) {
    file
      .text()
      .then((contents) => {
        const fixedBlockData = convertBaseBlock(JSON.parse(contents));
        loadBlockFromData(this.mainWorkspace, fixedBlockData);
        this.viewModel.toggleFileUploadModal(false);
      })
      .catch((e) => {
        this.viewModel.toggleFileUploadWarning(true);
      });
  }
}
