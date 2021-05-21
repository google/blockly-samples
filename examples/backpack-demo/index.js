/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Backpack demo initialization.
 */

function init() {
  // Inject primary workspace.
  const primaryWorkspace = Blockly.inject('primaryDiv',
      {
        media: 'https://unpkg.com/blockly/media/',
        toolbox: document.getElementById('toolbox'),
        trashcan: true,
      });
  // Inject secondary workspace.
  var secondaryWorkspace = Blockly.inject('secondaryDiv',
      {
        media: 'https://unpkg.com/blockly/media/',
        toolbox: document.getElementById('toolbox'),
        trashcan: true,
      });

  // Add backpacks
  const primaryBackpack = new NotificationBackpack(primaryWorkspace);
  primaryBackpack.init();
  const secondaryBackpack = new NotificationBackpack(secondaryWorkspace);
  secondaryBackpack.init();

  // Listen to events on both workspace.
  primaryWorkspace.addChangeListener(updateBackpack);
  secondaryWorkspace.addChangeListener(updateBackpack);

  function updateBackpack(event) {
    if (event.type !== 'backpack_change') {
      return;
    }
    Blockly.Events.disable();
    let contents;
    let targetBackpack;
    if (primaryWorkspace.id === event.workspaceId) {
      targetBackpack = secondaryBackpack;
      contents = primaryBackpack.getContents();
      console.log('second workspace backpack updated');
    } else { // secondaryWorkspace.id === event.workspaceId
      targetBackpack = primaryBackpack;
      contents = secondaryBackpack.getContents();
      console.log('first workspace backpack updated');
    }
    targetBackpack.setContentsAndNotify(contents);
    Blockly.Events.enable();
  }
}
