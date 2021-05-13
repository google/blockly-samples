/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Helper and utility methods for the Backpack plugin.
 * @author kozbial@google.com (Monica Kozbial)
 */

import * as Blockly from 'blockly/core';

/**
 * Creates a backpack flyout.
 * @param {!Blockly.WorkspaceSvg} targetWorkspace The target workspace for the
 *    backpack.
 * @return {!Blockly.IFlyout} The backpack flyout.
 */
export function createBackpackFlyout(targetWorkspace) {
  // Create flyout options.
  const flyoutWorkspaceOptions = new Blockly.Options(
      /** @type {!Blockly.BlocklyOptions} */
      ({
        'scrollbars': true,
        'parentWorkspace': targetWorkspace,
        'rtl': targetWorkspace.RTL,
        'oneBasedIndex': targetWorkspace.options.oneBasedIndex,
        'renderer': targetWorkspace.options.renderer,
        'rendererOverrides': targetWorkspace.options.rendererOverrides,
        'move': {
          'scrollbars': true,
        },
      }));
  // Create vertical or horizontal flyout.
  if (targetWorkspace.horizontalLayout) {
    flyoutWorkspaceOptions.toolboxPosition =
        (targetWorkspace.toolboxPosition ===
            Blockly.utils.toolbox.Position.TOP) ?
            Blockly.utils.toolbox.Position.BOTTOM :
            Blockly.utils.toolbox.Position.TOP;
    const HorizontalFlyout = Blockly.registry.getClassFromOptions(
        Blockly.registry.Type.FLYOUTS_HORIZONTAL_TOOLBOX,
        targetWorkspace.options, true);
    return new HorizontalFlyout(flyoutWorkspaceOptions);
  }
  flyoutWorkspaceOptions.toolboxPosition =
      (targetWorkspace.toolboxPosition ===
          Blockly.utils.toolbox.Position.RIGHT) ?
          Blockly.utils.toolbox.Position.LEFT :
          Blockly.utils.toolbox.Position.RIGHT;
  const VerticalFlyout = Blockly.registry.getClassFromOptions(
      Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX,
      targetWorkspace.options, true);
  return new VerticalFlyout(flyoutWorkspaceOptions);
}

/**
 * Converts XML representing a block into text that can be stored in the
 *    content array.
 * @param {!Element} xml An XML tree defining the block and any
 *    connected child blocks.
 * @return {string} Text representing the XML tree, cleaned of all unnecessary
 * attributes.
 * @private
 */
export function cleanBlockXML(xml) {
  const xmlBlock = xml.cloneNode(true);
  let node = xmlBlock;
  while (node) {
    // Things like text inside tags are still treated as nodes, but they
    // don't have attributes (or the removeAttribute function) so we can
    // skip removing attributes from them.
    if (node.removeAttribute) {
      node.removeAttribute('x');
      node.removeAttribute('y');
      node.removeAttribute('id');
      node.removeAttribute('disabled');
      if (node.nodeName == 'comment') { // Future proof just in case.
        node.removeAttribute('h');
        node.removeAttribute('w');
        node.removeAttribute('pinned');
      }
    }

    // Try to go down the tree
    let nextNode = node.firstChild || node.nextSibling;
    // If we can't go down, try to go back up the tree.
    if (!nextNode) {
      nextNode = node.parentNode;
      while (nextNode) {
        // We are valid again!
        if (nextNode.nextSibling) {
          nextNode = nextNode.nextSibling;
          break;
        }
        // Try going up again. If parentNode is null that means we have
        // reached the top, and we will break out of both loops.
        nextNode = nextNode.parentNode;
      }
    }
    node = nextNode;
  }
  return Blockly.Xml.domToText(xmlBlock);
}
