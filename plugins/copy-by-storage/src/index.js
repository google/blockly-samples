Blockly.copyByStorage = {};
Blockly.ContextMenuItems.blockCopyToStorage = function() {
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
      const blockDom = Blockly.Xml.blockToDomWithXY(scope.block);
      Blockly.Xml.deleteNext(blockDom);
      const blockText = Blockly.Xml.domToText(blockDom);
      Blockly.copyByStorage.__Storage.setItem('blocklyStash', blockText);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockCopyToStorage',
    weight: 0,
  };
  Blockly.ContextMenuRegistry.registry.register(copyToStorageOption);
};
Blockly.ContextMenuItems.blockPasteFromStorage = function() {
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
      if (Blockly.copyByStorage.__Storage.getItem('blocklyStash')) {
        return 'enabled';
      }
      return 'disabled';
    },
    callback: function(
        /** @type {!Blockly.ContextMenuRegistry.Scope} */ scope) {
      const blockText = Blockly.copyByStorage.__Storage.getItem('blocklyStash');
      const blockDom = Blockly.Xml.textToDom(blockText);
      Blockly.Xml.domToBlock(blockDom, scope.workspace);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'blockPasteFromStorage',
    weight: 0,
  };
  Blockly.ContextMenuRegistry.registry.register(pasteFromStorageOption);
};


Blockly.ShortcutItems.blockCopyToStorage = function() {
  /** @type {!ShortcutRegistry.KeyboardShortcut} */
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
      const blockDom = Blockly.Xml.blockToDomWithXY(Blockly.selected);
      Blockly.Xml.deleteNext(blockDom);
      const blockText = Blockly.Xml.domToText(blockDom);
      Blockly.copyByStorage.__Storage.setItem('blocklyStash', blockText);
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
Blockly.ShortcutItems.blockCutToStorage = function() {
/** @type {!ShortcutRegistry.KeyboardShortcut} */
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
      const blockDom = Blockly.Xml.blockToDomWithXY(Blockly.selected);
      Blockly.Xml.deleteNext(blockDom);
      const blockText = Blockly.Xml.domToText(blockDom);
      Blockly.copyByStorage.__Storage.setItem('blocklyStash', blockText);
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
Blockly.ShortcutItems.blockPasteFromStorage = function() {
/** @type {!ShortcutRegistry.KeyboardShortcut} */
  const pasteShortcut = {
    name: 'paste',
    preconditionFn: function(workspace) {
      if (!Blockly.copyByStorage.__Storage.getItem('blocklyStash')) {
        return 'disabled';
      }
      return !workspace.options.readOnly && !Blockly.Gesture.inProgress();
    },
    callback: function(workspace, e) {
      // Prevent the default copy behavior, which may beep or otherwise indicate
      // an error due to the lack of a selection.
      e.preventDefault();
      const blockText = Blockly.copyByStorage.__Storage.getItem('blocklyStash');
      const blockDom = Blockly.Xml.textToDom(blockText);
      Blockly.Xml.domToBlock(blockDom, workspace);
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
Blockly.copyByStorage.init = function(
    contextMenu = true, shortcut = true, unregisterDuplicate = true) {
  // Use localStorage
  Blockly.copyByStorage.__Storage = localStorage;

  if (contextMenu) {
    // Register the menus
    Blockly.ContextMenuItems.blockCopyToStorage();
    Blockly.ContextMenuItems.blockPasteFromStorage();
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
    Blockly.ShortcutItems.blockCopyToStorage();
    Blockly.ShortcutItems.blockCutToStorage();
    Blockly.ShortcutItems.blockPasteFromStorage();
  }

  if (unregisterDuplicate) {
    // Unregister the context menu duplication command
    Blockly.ContextMenuRegistry.registry.unregister('blockDuplicate');
  }
};
