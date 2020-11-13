/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plugin test.
 */

import Blockly from 'blockly/core';
import {speaker} from '../src/speaker';
import {notePlayer} from '../src/note_player';
import {MusicGameController} from '../src/music_game_controller';
import '../src/overrides';

document.addEventListener('DOMContentLoaded', function() {
  const controller = new MusicGameController();
  document.getElementById('logGeneratedCode').addEventListener(
      'click', function(event) {
        controller.getMusic().logGeneratedCode();
      });
  document.getElementById('executeCode').addEventListener(
      'click', function(event) {
        controller.getMusic().execute();
      });
  document.getElementById('speedSlider').addEventListener(
      'input', function(event) {
        controller.getMusic().setBpm(this.value);
      });
  document.getElementById('playOnly').addEventListener(
      'input', function(event) {
        controller.getGame().setPlayOnly(this.checked);
      });

  // Initial state has arrow keys turned on.
  registerArrowKeys(true);
  addTestButtons();
});

/**
 * Add buttons for testing basic functionality (speaker, etc).
 */
function addTestButtons() {
  document.getElementById('playNote').addEventListener(
      'click', function() {
        notePlayer.playNote('C4', '8n');
      });
  document.getElementById('playText').addEventListener(
      'click', function() {
        const textContent = document.getElementById('textInput').value;
        speaker.speak(textContent);
      });
  document.getElementById('playNoteAndText').addEventListener(
      'click', function() {
        speaker.speak('C4', false, function() {
          notePlayer.playNote('C4', '8n');
        });
      });
  document.addEventListener('visibilitychange', (event) => {
    if (document.visibilityState === 'visible') {
      console.log('tab is activate');
    } else {
      speaker.cancel();
    }
  });

  document.getElementById('enableArrowKeys').addEventListener('click',
      (event) => {
        registerArrowKeys(event.currentTarget.checked);
      });
  document.getElementById('modalButton').addEventListener('click',
      function() {
        speaker.modalToText(document.getElementById('modal-1'));
      });

  document.getElementById('modalButton').addEventListener('focus',
      function(e) {
        speaker.speak('Hit enter to open the help menu');
      });
  document.getElementById('replayButton').addEventListener('click',
      function() {
        speaker.modalToText(document.getElementById('modal-1'));
      });
}

/**
 * Register the arrow keys to do keyboard navigation actions.
 * @param {boolean} register True if the arrow keys should be used for nav.
 */
function registerArrowKeys(register) {
  const keyCodeMappings = [
    [Blockly.utils.KeyCodes.UP, Blockly.navigation.actionNames.PREVIOUS],
    [Blockly.utils.KeyCodes.DOWN, Blockly.navigation.actionNames.NEXT],
    [Blockly.utils.KeyCodes.RIGHT, Blockly.navigation.actionNames.IN],
    [Blockly.utils.KeyCodes.LEFT, Blockly.navigation.actionNames.OUT]];
  keyCodeMappings.forEach((mapping) => {
    if (register) {
      Blockly.ShortcutRegistry.registry.addKeyMapping(...mapping);
    } else {
      Blockly.ShortcutRegistry.registry.removeKeyMapping(...mapping);
    }
  });
}
