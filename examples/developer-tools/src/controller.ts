/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import * as storage from './storage';
import {createNewBlock, loadBlock} from './serialization';
import {ViewModel} from './view_model';
import {JavascriptDefinitionGenerator} from './output-generators/javascript_definition_generator';
import {JsonDefinitionGenerator} from './output-generators/json_definition_generator';
import {CodeHeaderGenerator} from './output-generators/code_header_generator';
import {Menu} from '@material/web/menu/menu';
import {GeneratorStubGenerator} from './output-generators/generator_stub_generator';
import {convertBaseBlock} from './backwards_compatibility';

const IMPORT_BLOCK_FACTORY_ID = 'Import from block factory...';

/**
 * A map where the keys are the names of a file that was uploaded,
 * and the value is an object with two properties:
 *     successes - an array of block names, which are represented by a
 *        tuple as [newName, oldName] in case of block renames
 *     fails - the number of blocks that failed to parse from that file
 */
type UploadResults = Map<string, {successes: string[][]; fails: number}>;

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

    for (const button of this.viewModel.copyButtons) {
      button.addEventListener('click', (e) => {
        this.handleCopyButton(e);
      });
    }

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

    this.viewModel.uploadResultsCloseButton.addEventListener('click', () => {
      this.viewModel.toggleUploadResultsModal(false);
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

  private handleCopyButton(e: Event) {
    const button = e.target as HTMLElement;
    const ownerId = button.getAttribute('data-owner-id');
    const ownerElement = document.getElementById(ownerId);

    if (!ownerElement) {
      throw new Error(
        `No matching element found for copy button owner id ${ownerId}`,
      );
    }

    const text = ownerElement.textContent;
    navigator.clipboard.writeText(text);
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
      div.textContent = name;
      el.appendChild(div);
      return el;
    });
    menuEl.replaceChildren(...newItems);
  }

  /** Shows the file upload modal when the user selects that option from the load menu. */
  private handleLoadFromFile() {
    this.viewModel.toggleFileUploadWarning(false);
    this.viewModel.toggleFileUploadModal(true);
  }

  /**
   * Handles the drag event that occurs when a user drops a file onto the file upload
   * drag-n-drop zone. Loads all of the blocks that it can into storage, then shows
   * the results of the file upload.
   *
   * @param e drop event
   */
  private handleFileDrop(e: DragEvent) {
    // Prevent default behavior (Prevent file from being opened)
    e.preventDefault();

    this.viewModel.toggleFileUploadWarning(false);

    this.viewModel.fileDropZone.classList.remove('isDragging');

    if (!e.dataTransfer.items) return;

    const allResults: UploadResults = new Map();
    const allPromises: Array<Promise<void>> = [];

    for (const item of e.dataTransfer.items) {
      // Only consider plain text files
      if (item.kind !== 'file' || item.type !== 'text/plain') {
        continue;
      }
      const file = item.getAsFile();
      allPromises.push(
        this.loadFromFile(file).then((results) => {
          allResults.set(file.name, results);
        }),
      );
    }

    // Wait for all the files to be processed, then display results
    Promise.all(allPromises).then(() => {
      this.displayLoadResults(allResults);
    });
  }

  /**
   * Handles the event that occurs when a user picks file(s) from the file input.
   * Attempts to load the file(s) into the block factory editor.
   */
  private handleFileUpload() {
    this.viewModel.toggleFileUploadWarning(false);
    const input = this.viewModel.fileUploadInput as HTMLInputElement;
    const results: UploadResults = new Map();
    for (const file of input.files) {
      if (!file) continue;
      this.loadFromFile(file).then((fileResults) => {
        results.set(file.name, fileResults);
        this.displayLoadResults(results);
      });
    }

    // Reset the file input value
    input.value = null;
  }

  /**
   * Shows the results of a file upload/drop.
   * If there are no succeses, we keep the file upload modal open so user can try again.
   * If there are mixed successes and failures, we do our best to show what exactly happened.
   * If there are no failures, we show a success message.
   * If any block successfully loads, we show the first one in the block editor.
   *
   * @param results Map of filename to upload results.
   */
  private displayLoadResults(results: UploadResults) {
    let firstSuccessfulBlock;
    const messages = document.createElement('ul');

    const formatSuccessMessage = function (successes: string[][]): string {
      let message = '';
      if (successes.length === 1) {
        message = `Successfully loaded one block named `;
      } else {
        message = `Successfully loaded blocks named `;
      }

      message += successes
        .map(([newName, oldName]) => {
          if (newName === oldName) return newName;
          return `${oldName} (renamed to ${newName})`;
        })
        .join(', ');

      return message;
    };

    for (const file of results.keys()) {
      const messageDiv = document.createElement('li');
      const {successes, fails} = results.get(file);
      if (successes.length === 0) {
        // File couldn't be parsed at all.
        messageDiv.textContent = `${file}: could not be parsed.`;
        messageDiv.classList.add('warning-message');
      } else if (fails === 0) {
        // One or more blocks loaded and no failures. Load the first one,
        // and display the names of other blocks successfully loaded
        messageDiv.textContent = `${file}: ${formatSuccessMessage(successes)}`;
        if (!firstSuccessfulBlock) firstSuccessfulBlock = successes[0];
      } else {
        // Some success and some failure. Load the first success,
        // and display the names of blocks that succeeded and failed to load.
        messageDiv.textContent = `${file}: ${formatSuccessMessage(
          successes,
        )}, but failed to parse ${fails} block${fails > 1 ? 's' : ''}.`;
        messageDiv.classList.add('warning-message');
        if (!firstSuccessfulBlock) firstSuccessfulBlock = successes[0];
      }

      messages.appendChild(messageDiv);
    }
    if (firstSuccessfulBlock) {
      loadBlock(this.mainWorkspace, firstSuccessfulBlock[0]);
    } else {
      // No blocks were successfully parsed at all, so keep the file upload modal open
      this.viewModel.toggleFileUploadWarning(true);
      return;
    }

    this.viewModel.toggleFileUploadModal(false);
    this.viewModel.toggleUploadResultsModal(true, messages);
  }

  /**
   * Given a file, tries to run it through our backwards-compatibility converter
   * and save the blocks in block factory.
   *
   * @param file File containing an array of block json to load. This should
   * be the file downloaded directly from the old block factory tool.
   * @returns a promise resolving to an object containing an array of successfully
   * converted block names and the number of blocks that failed to load.
   */
  private loadFromFile(
    file: File,
  ): Promise<{successes: string[][]; fails: number}> {
    let blocksData;
    return file.text().then((contents) => {
      try {
        blocksData = JSON.parse(contents);
        if (!Array.isArray(blocksData) || blocksData.length === 0) {
          throw new Error('File did not contain a JSON array or was empty.');
        }
      } catch (e) {
        console.error(e);
        return {successes: [], fails: 1};
      }

      const successes: string[][] = [];
      let fails = 0;
      try {
        for (const block of blocksData) {
          const fixedBlockData = convertBaseBlock(block);

          // The name from the old factory might be used in this tool.
          // Get a fresh name so we don't overwrite anything.
          const oldName = fixedBlockData.fields.NAME;
          const newName = storage.getNewUnusedName(oldName);
          fixedBlockData.fields.NAME = newName;

          // Convert the individual block to workspace data with one block
          const data = {
            blocks: {
              languageVersion: 0,
              blocks: [fixedBlockData],
            },
          };

          // Save the new block
          storage.updateBlock(newName, JSON.stringify(data));
          successes.push([newName, oldName]);
        }
      } catch (e) {
        fails++;
      }

      return {successes, fails};
    });
  }
}
