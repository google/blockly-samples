/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
(function () {

  let currentButton;

  /** Handles clicks on the main buttons when the page is in play mode. */
  function handlePlay(event) {
    // TODO: Add code for playing sound.
  }

  /** Handles click event for the "save" button on the blockly workspace screen */
  function handleSave() {
    document.body.setAttribute('mode', 'edit');
    // TODO: Add code for saving the behavior of a button.
  }

  /** Converts Blockly XML to Javascript code. */
  function convertToCode(blocklyXml) {
    // TODO: Implement this function
  }

  /**
   * Loads the main Blockly workspace from provided XML.
   * If there is no XML provided, it clears the workspace.
   */
   function loadMainWorkspace(blocklyXml) {
    // TODO: Implement this function
  }

  /** Enables edit mode on the main screen, such that clicking a button enters Blockly mode. */
  function enableEditMode() {
    document.body.setAttribute('mode', 'edit');
    document.querySelectorAll('.button').forEach(btn => {
      btn.removeEventListener('click', handlePlay);
      btn.addEventListener('click', enableBlocklyMode);
    });
  }

  /** Enables maker mode on the main screen, such that clicking a button runs that button's code. */
  function enableMakerMode() {
    document.body.setAttribute('mode', 'maker');
    document.querySelectorAll('.button').forEach(btn => {
      btn.addEventListener('click', handlePlay);
      btn.removeEventListener('click', enableBlocklyMode);
    });
  }

  /** Navigates to the Blockly editor to edit a button's code. */
  function enableBlocklyMode(e) {
    document.body.setAttribute('mode', 'blockly');
    currentButton = e.target;
  }

  document.querySelector('#edit').addEventListener('click', enableEditMode);
  document.querySelector('#done').addEventListener('click', enableMakerMode);
  document.querySelector('#save').addEventListener('click', handleSave);

  enableMakerMode();

})();
