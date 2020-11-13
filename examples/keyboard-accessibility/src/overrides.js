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
  const cursor = workspace.getCursor();
  const curNode = cursor.getCurNode();
  const nodeType = curNode.getType();
  if (nodeType == Blockly.ASTNode.types.FIELD &&
      curNode.getLocation().isClickable()) {
    // TODO: Had to override so I could add this speaker in.

    speaker.speak('Use next and previous to read off your options.', true);
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
        // TODO: Needed to override so that I could speak out the location when
        // it changes.
        speaker.speak(this.menu_.highlightedItem_.content_.alt, true);
        speaker.speak(fieldNextOptions);
        return true;
      default:
        return false;
    }
  }
  return Blockly.FieldDropdown.superClass_.onBlocklyAction.call(this, action);
};


Blockly.Block.prototype.toString = function(opt_maxLength, opt_emptyToken) {
  let text = [];
  const emptyFieldPlaceholder = opt_emptyToken || '?';

  // Temporarily set flag to navigate to all fields.
  const prevNavigateFields = Blockly.ASTNode.NAVIGATE_ALL_FIELDS;
  Blockly.ASTNode.NAVIGATE_ALL_FIELDS = true;

  let node = Blockly.ASTNode.createBlockNode(this);
  const rootNode = node;

  /**
   * Whether or not to add parentheses around an input.
   * @param {!Blockly.Connection} connection The connection.
   * @return {boolean} True if we should add parentheses around the input.
   */
  function shouldAddParentheses(connection) {
    let checks = connection.getCheck();
    if (!checks && connection.targetConnection) {
      checks = connection.targetConnection.getCheck();
    }
    return !!checks && (checks.indexOf('Boolean') != -1 ||
        checks.indexOf('Number') != -1);
  }

  /**
   * Check that we haven't circled back to the original root node.
   */
  function checkRoot() {
    if (node && node.getType() == rootNode.getType() &&
        node.getLocation() == rootNode.getLocation()) {
      node = null;
    }
  }
  let connection = null;
  let field = null;

  // Traverse the AST building up our text string.
  while (node) {
    switch (node.getType()) {
      case Blockly.ASTNode.types.INPUT:
        connection = /** @type {!Blockly.Connection} */ (node.getLocation());
        if (!node.in()) {
          text.push(emptyFieldPlaceholder);
        } else if (shouldAddParentheses(connection)) {
          text.push('(');
        }
        break;
      case Blockly.ASTNode.types.FIELD:
        field = /** @type {Blockly.Field} */ (node.getLocation());
        if (field.name != Blockly.Block.COLLAPSED_FIELD_NAME) {
          text.push(field.getText());
        }
        break;
    }

    const current = node;
    node = current.in() || current.next();
    // TODO: This only works in our specific use case of having a block with a
    // single statement connection.
    if (node && node.getType() == Blockly.ASTNode.types.INPUT &&
        node.getLocation().type === Blockly.NEXT_STATEMENT) {
      node = null;
    }
    if (!node) {
      // Can't go in or next, keep going out until we can go next.
      node = current.out();
      checkRoot();
      while (node && !node.next()) {
        node = node.out();
        checkRoot();
        // If we hit an input on the way up, possibly close out parentheses.
        if (node && node.getType() == Blockly.ASTNode.types.INPUT &&
            shouldAddParentheses(
                /** @type {!Blockly.Connection} */ (node.getLocation()))) {
          text.push(')');
        }
      }
      if (node) {
        node = node.next();
      }
    }
  }

  // Restore state of NAVIGATE_ALL_FIELDS.
  Blockly.ASTNode.NAVIGATE_ALL_FIELDS = prevNavigateFields;

  // Run through our text array and simplify expression to remove parentheses
  // around single field blocks.
  for (let i = 2, l = text.length; i < l; i++) {
    if (text[i - 2] == '(' && text[i] == ')') {
      text[i - 2] = text[i - 1];
      text.splice(i - 1, 2);
      l -= 2;
    }
  }

  // Join the text array, removing spaces around added paranthesis.
  text = text.join(' ').replace(/(\() | (\))/gmi, '$1$2').trim() || '???';
  if (opt_maxLength) {
    // TODO: Improve truncation so that text from this block is given priority.
    // E.g. "1+2+3+4+5+6+7+8+9=0" should be "...6+7+8+9=0", not "1+2+3+4+5...".
  // E.g. "1+2+3+4+5=6+7+8+9+0" should be "...4+5=6+7...".
    if (text.length > opt_maxLength) {
      text = text.substring(0, opt_maxLength - 3) + '...';
    }
  }
  return text;
};
