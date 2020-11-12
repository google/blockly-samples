/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview
 */
'use strict';

import {speaker} from './speaker';
import {LineCursor} from './line_cursor';
import {EditCursor} from './edit_cursor';
import Blockly from 'blockly/core';

/**
 * A class for a modal that welcomes the users and helps them get oriented.
 */
export class Shortcuts {
  /**
   * Constructor for the welcome modal.
   * @constructor
   */
  constructor() {
  }

  /**
   * Initializes the welcome modal.
   */
  init() {
    this.registerEditShortcut();
    this.registerEscapeEditModeShortcut();
  }

  /**
   * Adds a shortcut for changing to the edit cursor.
   */
  registerEditShortcut() {
    Blockly.ShortcutRegistry.registry.register({
      name: 'edit',
      preconditionFn: (workspace) => {
        const cursor = workspace.getCursor();
        return cursor instanceof LineCursor &&
            workspace.keyboardAccessibilityMode &&
            !workspace.options.readOnly;
      },
      callback: (workspace) => {
        const currentCursor = workspace.getMarkerManager().getCursor();
        const curNode = currentCursor.getCurNode();
        const editCursor = new EditCursor();
        workspace.getMarkerManager().setCursor(editCursor);
        speaker.speak('Edit mode on.', true, function() {
          // TODO: This means that if a user hits a key before we set this node
          // TODO: it does not move the cursor.
          editCursor.setNode(curNode);
          editCursor.setCurNode(curNode);
          editCursor.next();
        });
      },
    });
    Blockly.ShortcutRegistry.registry.addKeyMapping(Blockly.utils.KeyCodes.E, 'edit', true);
  }

  /**
   * Adds a shortcut for escaping edit mode.
   */
  registerEscapeEditModeShortcut() {
    Blockly.ShortcutRegistry.registry.register({
      name: 'escapeEditMode',
      preconditionFn: (workspace) => {
        const cursor = workspace.getCursor();
        return cursor instanceof EditCursor &&
            workspace.keyboardAccessibilityMode &&
            !workspace.options.readOnly;
      },
      callback: (workspace) => {
        const currentCursor = workspace.getMarkerManager().getCursor();
        const curNode = currentCursor.getCurNode();
        const sourceBlock = curNode.getSourceBlock();
        const lineCursor = new LineCursor();
        workspace.getMarkerManager().setCursor(lineCursor);
        lineCursor.setCurNode(Blockly.ASTNode.createBlockNode(sourceBlock));
      },
    });
    Blockly.ShortcutRegistry.registry.addKeyMapping(Blockly.utils.KeyCodes.ESC, 'escapeEditMode', true);
  }
}
