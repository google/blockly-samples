/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plugin test.
 */

import * as Blockly from 'blockly';
import {createPlayground} from '@blockly/dev-tools';
import {speaker} from '../src/speaker';
import {notePlayer} from '../src/note_player';
import {toolboxPitch} from '../src/music_blocks';
import MicroModal from 'micromodal';
import {LineCursor} from '../src/line_cursor';

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  const workspace = Blockly.inject(blocklyDiv, options);
  Blockly.ASTNode.NAVIGATE_ALL_FIELDS = true;
  workspace.getMarkerManager().setCursor(new LineCursor());
  workspace.addChangeListener((event) => speaker.nodeToSpeech(event));
  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions = {
    toolbox: toolboxPitch,
  };
  MicroModal.init();

  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);

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
});
