const blockCopyToStorageContextMenu = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  const copyToStorageOption = {
    displayText: function() {
      if (Blockly.Msg['COPYBYSTORAGE_COPY']) {
        return Blockly.Msg['COPYBYSTORAGE_COPY'];
      }
      return 'copy';
    },
    preconditionFn: function(
        /** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      return 'enabled';
    },
    callback: function(
        /** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      const json = Blockly.serialization.blocks.save(
          scope.block, {addCoordinates: true, addNextBlocks: false});
      const blockText = JSON.stringify(json);
      localStorage.setItem('blocklyStash', blockText);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockCopyToStorage',
    weight: 0,
  };
  Blockly.ContextMenuRegistry.registry.register(copyToStorageOption);
};
const blockPasteFromStorageContextMenu = function() {
  /** @type {!Blockly.ContextMenuRegistry.RegistryItem} */
  const pasteFromStorageOption = {
    displayText: function() {
      if (Blockly.Msg['COPYBYSTORAGE_PASTE']) {
        return Blockly.Msg['COPYBYSTORAGE_PASTE'];
      }
      return 'paste';
    },
    preconditionFn: function(
        /** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      if (localStorage.getItem('blocklyStash')) {
        return 'enabled';
      }
      return 'disabled';
    },
    callback: function(
        /** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      const blockText = localStorage.getItem('blocklyStash');
      const json = JSON.parse(blockText);
      Blockly.serialization.blocks.append(json, scope.workspace);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'blockPasteFromStorage',
    weight: 0,
  };
  Blockly.ContextMenuRegistry.registry.register(pasteFromStorageOption);
};


const blockCopyToStorageShortcut = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  const copyShortcut = {
    name: 'copy',
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly &&
        !Blockly.Gesture.inProgress() &&
        Blockly.selected &&
        Blockly.selected.isDeletable() &&
        Blockly.selected.isMovable();
    },
    callback: function(workspace, e) {
      // Prevent the default copy behavior, which may beep or otherwise indicate
      // an error due to the lack of a selection.
      e.preventDefault();
      const json = Blockly.serialization.blocks.save(
          Blockly.selected, {addCoordinates: true, addNextBlocks: false});
      const blockText = JSON.stringify(json);
      localStorage.setItem('blocklyStash', blockText);
      return true;
    },
  };
  Blockly.ShortcutRegistry.registry.register(copyShortcut);

  const ctrlC = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlC, copyShortcut.name);

  const altC =
    Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(altC, copyShortcut.name);

  const metaC = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(metaC, copyShortcut.name);
};
const blockCutToStorageShortcut = function() {
/** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  const cutShortcut = {
    name: 'cut',
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly &&
        !Blockly.Gesture.inProgress() &&
        Blockly.selected &&
        Blockly.selected.isDeletable() &&
        Blockly.selected.isMovable() &&
        !Blockly.selected.workspace.isFlyout;
    },
    callback: function(workspace, e) {
      // Prevent the default copy behavior, which may beep or otherwise indicate
      // an error due to the lack of a selection.
      e.preventDefault();
      const json = Blockly.serialization.blocks.save(
          Blockly.selected, {addCoordinates: true, addNextBlocks: false});
      const blockText = JSON.stringify(json);
      localStorage.setItem('blocklyStash', blockText);
      Blockly.deleteBlock(Blockly.selected);
      return true;
    },
  };
  Blockly.ShortcutRegistry.registry.register(cutShortcut);

  const ctrlX = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlX, cutShortcut.name);

  const altX = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(altX, cutShortcut.name);

  const metaX = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(metaX, cutShortcut.name);
};
const blockPasteFromStorageShortcut = function() {
/** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  const pasteShortcut = {
    name: 'paste',
    preconditionFn: function(workspace) {
      if (!localStorage.getItem('blocklyStash')) {
        return 'disabled';
      }
      return !workspace.options.readOnly && !Blockly.Gesture.inProgress();
    },
    callback: function(workspace, e) {
      // Prevent the default copy behavior, which may beep or otherwise indicate
      // an error due to the lack of a selection.
      e.preventDefault();
      const blockText = localStorage.getItem('blocklyStash');
      const json = JSON.parse(blockText);
      Blockly.serialization.blocks.append(json, workspace);
      return true;
    },
  };
  Blockly.ShortcutRegistry.registry.register(pasteShortcut);

  const ctrlV = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlV, pasteShortcut.name);

  const altV =
      Blockly.ShortcutRegistry.registry.createSerializedKey(
          Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(altV, pasteShortcut.name);

  const metaV = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(metaV, pasteShortcut.name);
};

/**
 * Set the copyByStorage function.
 * @param {boolean} contextMenu Register copy and paste in the context menu
 * @param {boolean} shortcut Register cut (ctr + x), copy (ctr + c),
 *  paste (ctr + v) in the shortcut.
 * @param {boolean} unregisterDuplicate
 * Unregister the context menu duplication command
 */
export function init(
    contextMenu = true, shortcut = true, unregisterDuplicate = true) {
  if (contextMenu) {
    // Register the menus
    blockCopyToStorageContextMenu();
    blockPasteFromStorageContextMenu();
  }

  if (shortcut) {
    // Unregister the default KeyboardShortcuts
    Blockly.ShortcutRegistry.registry.unregister(
        Blockly.ShortcutItems.names.COPY);
    Blockly.ShortcutRegistry.registry.unregister(
        Blockly.ShortcutItems.names.CUT);
    Blockly.ShortcutRegistry.registry.unregister(
        Blockly.ShortcutItems.names.PASTE);
    // Register the KeyboardShortcuts
    blockCopyToStorageShortcut();
    blockCutToStorageShortcut();
    blockPasteFromStorageShortcut();
  }

  if (unregisterDuplicate) {
    // Unregister the context menu duplication command
    Blockly.ContextMenuRegistry.registry.unregister('blockDuplicate');
  }
}
