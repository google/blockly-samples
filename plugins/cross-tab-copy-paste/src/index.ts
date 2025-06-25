/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

type TypeErrorCallback = () => void;

const getCopyData = function (): Blockly.ICopyData | undefined {
  const stored = localStorage.getItem('blocklyStash');
  if (!stored) return undefined;
  return JSON.parse(stored);
};

/**
 * A Blockly plugin that adds context menu items and keyboard shortcuts
 * to allow users to copy and paste a block between tabs.
 */
export class CrossTabCopyPaste {
  /**
   * Initializes the cross tab copy paste plugin. If no options are selected
   * then both context menu items and keyboard shortcuts are added.
   * @param options
   * - `contextMenu` Register copy and paste in the context menu.
   * - `shortcut` Register cut (ctr + x), copy (ctr + c) and paste (ctr + v)
   * in the shortcut.
   * @param typeErrorCallback callback function to handle type errors
   */
  init(
    {contextMenu = true, shortcut = true} = {
      contextMenu: true,
      shortcut: true,
    },
    typeErrorCallback?: TypeErrorCallback,
  ) {
    if (contextMenu) {
      // Register the menus
      this.blockCopyToStorageContextMenu();
      this.blockPasteFromStorageContextMenu(typeErrorCallback);
    }

    if (shortcut) {
      // Unregister the default KeyboardShortcuts
      Blockly.ShortcutRegistry.registry.unregister(
        Blockly.ShortcutItems.names.COPY,
      );
      Blockly.ShortcutRegistry.registry.unregister(
        Blockly.ShortcutItems.names.CUT,
      );
      Blockly.ShortcutRegistry.registry.unregister(
        Blockly.ShortcutItems.names.PASTE,
      );
      // Register the KeyboardShortcuts
      this.blockCopyToStorageShortcut();
      this.blockCutToStorageShortcut();
      this.blockPasteFromStorageShortcut(typeErrorCallback);
    }
  }

  /**
   * Adds a copy command to the block context menu.
   */
  blockCopyToStorageContextMenu() {
    const copyToStorageOption: Blockly.ContextMenuRegistry.RegistryItem = {
      displayText: function () {
        if (Blockly.Msg['CROSS_TAB_COPY']) {
          return Blockly.Msg['CROSS_TAB_COPY'];
        }
        return 'Copy';
      },
      preconditionFn: function (scope: Blockly.ContextMenuRegistry.Scope) {
        if (
          Blockly.getSelected().isDeletable() &&
          Blockly.getSelected().isMovable()
        ) {
          return 'enabled';
        }
        return 'disabled';
      },
      callback: function (scope: Blockly.ContextMenuRegistry.Scope) {
        localStorage.setItem(
          'blocklyStash',
          JSON.stringify(scope.block.toCopyData()),
        );
      },
      scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
      id: 'blockCopyToStorage',
      weight: 0,
    };
    Blockly.ContextMenuRegistry.registry.register(copyToStorageOption);
  }

  /**
   * Adds a paste command to the block context menu.
   * @param typeErrorCallback callback function to handle type errors
   */
  blockPasteFromStorageContextMenu(typeErrorCallback?: TypeErrorCallback) {
    const pasteFromStorageOption: Blockly.ContextMenuRegistry.RegistryItem = {
      displayText: function () {
        if (Blockly.Msg['CROSS_TAB_PASTE']) {
          return Blockly.Msg['CROSS_TAB_PASTE'];
        }
        return 'Paste';
      },
      preconditionFn: function (scope) {
        const copyData = getCopyData();
        if (
          copyData &&
          scope.workspace.isCapacityAvailable(copyData.typeCounts)
        ) {
          return 'enabled';
        }
        return 'disabled';
      },
      callback: function (scope) {
        const copyData = getCopyData();
        if (!copyData) return false;
        try {
          Blockly.clipboard.paste(copyData, scope.workspace);
        } catch (e) {
          if (e instanceof TypeError && typeErrorCallback) {
            typeErrorCallback();
          } else {
            throw e;
          }
        }
      },
      scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
      id: 'blockPasteFromStorage',
      weight: 0,
    };
    Blockly.ContextMenuRegistry.registry.register(pasteFromStorageOption);
  }

  /**
   * Adds a keyboard shortcut that will store copy information for a block
   * in localStorage.
   */
  blockCopyToStorageShortcut() {
    const copyShortcut: Blockly.ShortcutRegistry.KeyboardShortcut = {
      name: 'copy',
      preconditionFn: function (workspace) {
        return (
          !workspace.options.readOnly &&
          !Blockly.Gesture.inProgress() &&
          Blockly.getSelected() &&
          Blockly.getSelected().isDeletable() &&
          Blockly.getSelected().isMovable() &&
          !Blockly.getSelected().isInMutator
        );
      },
      callback: function (workspace, e) {
        // Prevent the default copy behavior,
        // which may beep or otherwise indicate
        // an error due to the lack of a selection.
        e.preventDefault();
        const block = Blockly.getSelected();
        if (!block || !Blockly.isCopyable(block)) return false;
        workspace.hideChaff();
        localStorage.setItem(
          'blocklyStash',
          JSON.stringify(block.toCopyData()),
        );
        return true;
      },
    };
    Blockly.ShortcutRegistry.registry.register(copyShortcut);

    const ctrlC = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C,
      [Blockly.utils.KeyCodes.CTRL],
    );
    Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlC, copyShortcut.name);

    const altC = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C,
      [Blockly.utils.KeyCodes.ALT],
    );
    Blockly.ShortcutRegistry.registry.addKeyMapping(altC, copyShortcut.name);

    const metaC = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C,
      [Blockly.utils.KeyCodes.META],
    );
    Blockly.ShortcutRegistry.registry.addKeyMapping(metaC, copyShortcut.name);
  }

  /**
   * Adds a keyboard shortcut that will store copy information for a block
   * in local storage and delete the block.
   */
  blockCutToStorageShortcut() {
    const cutShortcut: Blockly.ShortcutRegistry.KeyboardShortcut = {
      name: 'cut',
      preconditionFn: function (workspace) {
        return (
          !workspace.options.readOnly &&
          !Blockly.Gesture.inProgress() &&
          Blockly.getSelected() &&
          Blockly.getSelected().isDeletable() &&
          Blockly.getSelected().isMovable() &&
          !Blockly.getSelected().workspace.isFlyout
        );
      },
      callback: function (workspace, e) {
        // Prevent the default copy behavior,
        // which may beep or otherwise indicate
        // an error due to the lack of a selection.
        e.preventDefault();
        const block = /** @type {Blockly.BlockSvg} */ Blockly.getSelected();
        if (!block || !Blockly.isCopyable(block)) return false;
        localStorage.setItem(
          'blocklyStash',
          JSON.stringify(block.toCopyData()),
        );
        Blockly.Events.setGroup(true);
        block.dispose(true);
        Blockly.Events.setGroup(false);
        return true;
      },
    };
    Blockly.ShortcutRegistry.registry.register(cutShortcut);

    const ctrlX = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X,
      [Blockly.utils.KeyCodes.CTRL],
    );
    Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlX, cutShortcut.name);

    const altX = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X,
      [Blockly.utils.KeyCodes.ALT],
    );
    Blockly.ShortcutRegistry.registry.addKeyMapping(altX, cutShortcut.name);

    const metaX = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X,
      [Blockly.utils.KeyCodes.META],
    );
    Blockly.ShortcutRegistry.registry.addKeyMapping(metaX, cutShortcut.name);
  }

  /**
   * Adds a keyboard shortcut that will paste the block stored in localStorage.
   * @param typeErrorCallback
   * callback function to handle type errors
   */
  blockPasteFromStorageShortcut(typeErrorCallback?: TypeErrorCallback) {
    const pasteShortcut: Blockly.ShortcutRegistry.KeyboardShortcut = {
      name: 'paste',
      preconditionFn: function (workspace) {
        if (workspace.options.readOnly || Blockly.Gesture.inProgress()) {
          return false;
        }
        const copyData = getCopyData();
        if (!copyData || !workspace.isCapacityAvailable(copyData.typeCounts)) {
          return false;
        }
        return true;
      },
      callback: function (workspace, e) {
        // Prevent the default copy behavior,
        // which may beep or otherwise indicate
        // an error due to the lack of a selection.
        e.preventDefault();
        const copyData = getCopyData();
        if (!copyData) return false;
        try {
          Blockly.clipboard.paste(copyData, workspace);
        } catch (e) {
          if (e instanceof TypeError && typeErrorCallback) {
            typeErrorCallback();
          } else {
            throw e;
          }
        }
        return true;
      },
    };
    Blockly.ShortcutRegistry.registry.register(pasteShortcut);

    const ctrlV = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V,
      [Blockly.utils.KeyCodes.CTRL],
    );
    Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlV, pasteShortcut.name);

    const altV = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V,
      [Blockly.utils.KeyCodes.ALT],
    );
    Blockly.ShortcutRegistry.registry.addKeyMapping(altV, pasteShortcut.name);

    const metaV = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V,
      [Blockly.utils.KeyCodes.META],
    );
    Blockly.ShortcutRegistry.registry.addKeyMapping(metaV, pasteShortcut.name);
  }
}
