/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '@material/web/menu/menu';
import '@material/web/menu/menu-item';

export class ViewModel {
  mainWorkspaceDiv = document.getElementById('main-workspace');
  previewDiv = document.getElementById('block-preview');
  definitionDiv = document.getElementById('block-definition').firstChild;
  outputConfigDiv = document.getElementById('output-config');
  codeHeadersDiv = document.getElementById('code-headers').firstChild;
  generatorStubDiv = document.getElementById('generator-stub').firstChild;

  createButton = document.getElementById('create-btn');
  deleteButton = document.getElementById('delete-btn');
  loadButton = document.getElementById('load-btn');
  loadMenu = document.getElementById('load-menu');

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
}
