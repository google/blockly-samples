/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a line cursor.
 * A line cursor traverses the blocks as if they were
 * lines of code in a text editor.
 * Previous and next go up and down lines. In and out go
 * through the elements in a line.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

import Blockly from 'blockly/core';
import {speaker} from './speaker';


Blockly.navigation.handleEnterForWS_ = function(workspace) {
  var cursor = workspace.getCursor();
  var curNode = cursor.getCurNode();
  var nodeType = curNode.getType();
  if (nodeType == Blockly.ASTNode.types.FIELD) {
    // TODO: Had to override so I could add this speaker in.
    speaker.speak('Use next and previous to read off your options.');
    (/** @type {!Blockly.Field} */(curNode.getLocation())).showEditor();
  } else if (curNode.isConnection() ||
      nodeType == Blockly.ASTNode.types.WORKSPACE) {
    Blockly.navigation.markAtCursor_();
  } else if (nodeType == Blockly.ASTNode.types.BLOCK) {
    Blockly.navigation.warn_('Cannot mark a block.');
  } else if (nodeType == Blockly.ASTNode.types.STACK) {
    Blockly.navigation.warn_('Cannot mark a stack.');
  }
};


Blockly.FieldDropdown.prototype.onBlocklyAction = function(action) {
  const fieldNextOptions = 'To select this option hit enter';
  if (this.menu_) {
    switch (action.name) {
      case Blockly.navigation.actionNames.PREVIOUS:
        this.menu_.highlightPrevious();
        speaker.speak(this.menu_.highlightedItem_.content_.alt, true);
        speaker.speak(fieldNextOptions);
        return true;
      case Blockly.navigation.actionNames.NEXT:
        this.menu_.highlightNext();
        // TODO: Needed to override so that I could speak out the location when it changes.
        speaker.speak(this.menu_.highlightedItem_.content_.alt, true);
        speaker.speak(fieldNextOptions);
        return true;
      default:
        return false;
    }
  }
  return Blockly.FieldDropdown.superClass_.onBlocklyAction.call(this, action);
};


