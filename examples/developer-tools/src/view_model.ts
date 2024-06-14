/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '@material/web/menu/menu';
import '@material/web/menu/menu-item';
import '@material/web/dialog/dialog';
import '@material/web/button/text-button';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';

export class ViewModel {
  // Main container divs for block factory
  mainWorkspaceDiv = document.getElementById('main-workspace');
  previewDiv = document.getElementById('block-preview');
  definitionDiv = document.getElementById('block-definition').firstChild;
  outputConfigDiv = document.getElementById('output-config');
  codeHeadersDiv = document.getElementById('code-headers').firstChild;
  generatorStubDiv = document.getElementById('generator-stub').firstChild;

  // Toolbar menu/buttons
  copyButtons = document.getElementsByClassName('copy-button');

  createButton = document.getElementById('create-btn');
  deleteButton = document.getElementById('delete-btn');
  loadButton = document.getElementById('load-btn');
  loadMenu = document.getElementById('load-menu');

  // File upload dialog components
  fileModal = document.getElementById('file-upload-modal');
  fileModalCloseButton = document.getElementById('file-upload-close');
  fileDropZone = document.getElementById('file-upload-drop-zone');
  fileUploadInput = document.getElementById('file-upload');
  fileLabel = document.getElementById('file-label');
  fileUploadWarning = document.getElementById('file-upload-warning');

  // File upload results dialog components
  uploadResultsModal = document.getElementById('upload-results-modal');
  uploadResultsText = document.getElementById('upload-results');
  uploadResultsCloseButton = document.getElementById('upload-results-close');

  /**
   * Gets a string representing the format of the block
   * definition the user selected.
   *
   * @returns Either 'json' or 'js' depending on which radio button is selected.
   */
  getBlockDefinitionFormat(): string {
    const radioButton = document.getElementById(
      'definition-json',
    ) as HTMLInputElement;
    return radioButton.checked ? 'json' : 'js';
  }

  /**
   * Sets the format of the block definition.
   *
   * @param format Either 'json' or 'js'
   */
  setBlockDefinitionFormat(format: string) {
    const jsonButton = document.getElementById(
      'definition-json',
    ) as HTMLInputElement;
    const jsButton = document.getElementById(
      'definition-js',
    ) as HTMLInputElement;
    format === 'json' ? (jsonButton.checked = true) : (jsButton.checked = true);
  }

  /**
   * Gets the name of the code generator language the user selected.
   *
   * @returns The generator language name, in the same format as
   *    used by Blockly, e.g. `javascript` or `php`.
   */
  getCodeGeneratorLanguage(): string {
    const languageSelector = document.getElementById(
      'code-generator-language',
    ) as HTMLInputElement;
    return languageSelector.value;
  }

  /**
   * Sets the name of the code generator language dropdown.
   *
   * @param language The generator language name, in the same format as
   *    used by Blockly, e.g. `javascript` or `php`.
   */
  setCodeGeneratorLanguage(language: string) {
    const languageSelector = document.getElementById(
      'code-generator-language',
    ) as HTMLInputElement;
    languageSelector.value = language;
  }

  getCodeHeaderStyle(): string {
    const radioButton = document.getElementById(
      'import-esm',
    ) as HTMLInputElement;
    return radioButton.checked ? 'import' : 'script';
  }

  setCodeHeaderStyle(style: string) {
    const importButton = document.getElementById(
      'import-esm',
    ) as HTMLInputElement;
    const scriptButton = document.getElementById(
      'import-script',
    ) as HTMLInputElement;
    style === 'import'
      ? (importButton.checked = true)
      : (scriptButton.checked = true);
  }

  /**
   * Shows or hides the file upload modal.
   *
   * @param show true to show, false to hide.
   */
  toggleFileUploadModal(show: boolean) {
    if (show) {
      this.fileModal.setAttribute('open', '');

      // Set z-index of scrim so that it covers the Blockly toolbox
      // https://github.com/material-components/material-web/issues/4948
      if (this.fileModal.shadowRoot) {
        const scrim =
          this.fileModal.shadowRoot.querySelector<HTMLElement>('.scrim');
        if (scrim) {
          scrim.style.zIndex = '99';
        }
      }
    } else {
      this.fileModal.removeAttribute('open');
    }
  }

  /**
   * Shows or hides the file upload error message.
   * This is used when the entire file fails to parse.
   *
   * @param show true to show, false to hide.
   */
  toggleFileUploadWarning(show: boolean) {
    if (show) {
      this.fileUploadWarning.classList.remove('hidden');
    } else {
      this.fileUploadWarning.classList.add('hidden');
    }
  }

  /**
   * Shows or hides the file upload results modal. This modal
   * shows the results of uploading one or more block data files.
   *
   * @param show true to show, false to hide.
   * @param message the html content to show in this modal, if show is true
   */
  toggleUploadResultsModal(show: true, message: HTMLElement): void;
  toggleUploadResultsModal(show: false): void;
  toggleUploadResultsModal(show: boolean, message?: HTMLElement): void {
    if (show) {
      this.uploadResultsModal.setAttribute('open', '');
      // Set z-index of scrim so that it covers the Blockly toolbox
      // https://github.com/material-components/material-web/issues/4948
      if (this.uploadResultsModal.shadowRoot) {
        const scrim =
          this.uploadResultsModal.shadowRoot.querySelector<HTMLElement>(
            '.scrim',
          );
        if (scrim) {
          scrim.style.zIndex = '99';
        }
      }
      this.uploadResultsText.replaceChildren(message);
    } else {
      this.uploadResultsModal.removeAttribute('open');
    }
  }
}
