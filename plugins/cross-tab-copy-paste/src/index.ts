/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

type TypeErrorCallback = () => void;

/**
 * Parses copy data from JSON in local storage, if it exists.
 *
 * @returns copy data parsed from local storage, or undefined
 */
function getCopyData(): Blockly.ICopyData | undefined {
  const stored = localStorage.getItem('blocklyStash');
  if (!stored) return undefined;
  return JSON.parse(stored);
}

/**
 * Checks if the copy data represents that for a block.
 *
 * @param obj any ICopyData.
 * @returns if the ICopyData is a BlockCopyData.
 */
function isBlockCopyData(
  obj: Blockly.ICopyData,
): obj is Blockly.clipboard.BlockCopyData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(obj as any).typeCounts;
}

/**
 * Determine if a focusable node can be copied.
 *
 * This will use the isCopyable method if the node implements it, otherwise
 * it will fall back to checking if the node is deletable and draggable not
 * considering the workspace's edit state.
 *
 * n.b. copied (with minor changes) from blockly/core/shortcut_items.
 *
 * @param focused The focused object.
 */
function isCopyable(focused: Blockly.IFocusableNode): boolean {
  if (
    !Blockly.isCopyable(focused) ||
    !Blockly.isDeletable(focused) ||
    !Blockly.isDraggable(focused)
  )
    return false;
  // The cast is necessary while the minimum version of Blockly required is < 12.2.0
  // because that version is when `isCopyable` was introduced on the `ICopyable` interface.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  if ((focused as any).isCopyable) {
    return (focused as any).isCopyable();
    /* eslint-enable @typescript-eslint/no-explicit-any */
  } else if (
    focused instanceof Blockly.BlockSvg ||
    focused instanceof Blockly.comments.RenderedWorkspaceComment
  ) {
    return focused.isOwnDeletable() && focused.isOwnMovable();
  }
  // This isn't a class Blockly knows about, so fall back to the stricter
  // checks for deletable and movable.
  return focused.isDeletable() && focused.isMovable();
}

/**
 * Determine if a focusable node can be cut.
 *
 * This will check if the node can be both copied and deleted in its current
 * workspace.
 *
 * n.b. copied from blockly/core/shortcut_items.
 *
 * @param focused The focused object.
 */
function isCuttable(focused: Blockly.IFocusableNode): boolean {
  return (
    isCopyable(focused) && Blockly.isDeletable(focused) && focused.isDeletable()
  );
}

/**
 * Return value for a context menu item's precondition.
 */
enum ContextMenuState {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  HIDDEN = 'hidden',
}

/**
 * Copy precondition called by both keyboard shortcut and context menu item.
 * Allows copying out of the flyout, as long as they could be pasted
 * into the main workspace.
 *
 * @param scope
 * @param workspace explicit workspace for keyboard shortcuts,
 * undefined to get the workspace from the focused node.
 * @returns whether the option should be shown/hidden/disabled.
 */
function copyPrecondition(
  scope: Blockly.ContextMenuRegistry.Scope,
  workspace?: Blockly.Workspace,
): ContextMenuState {
  const focused = scope.focusedNode;
  if (!focused) return ContextMenuState.HIDDEN;
  if (!Blockly.isCopyable(focused)) return ContextMenuState.HIDDEN;

  if (!workspace) workspace = focused.workspace;
  if (!(workspace instanceof Blockly.WorkspaceSvg))
    return ContextMenuState.HIDDEN;
  const targetWorkspace = workspace.isFlyout
    ? workspace.targetWorkspace
    : workspace;
  if (
    !!focused &&
    !!targetWorkspace &&
    !targetWorkspace.isDragging() &&
    !Blockly.getFocusManager().ephemeralFocusTaken() &&
    isCopyable(focused)
  )
    return ContextMenuState.ENABLED;
  return ContextMenuState.DISABLED;
}

/**
 * Copy callback called by both keyboard shortcut and context menu item.
 * Copies the copy data to local storage.
 *
 * @param scope
 * @param workspace
 * @returns true if copy happened, false otherwise.
 */
function copyCallback(
  scope: Blockly.ContextMenuRegistry.Scope,
  workspace: Blockly.Workspace,
): boolean {
  const focused = scope.focusedNode;
  if (!focused || !Blockly.isCopyable(focused) || !isCopyable(focused))
    return false;

  if (!(workspace instanceof Blockly.WorkspaceSvg)) return false;

  const targetWorkspace = workspace.isFlyout
    ? workspace.targetWorkspace
    : workspace;
  if (!targetWorkspace) return false;

  if (!focused.workspace.isFlyout) {
    targetWorkspace.hideChaff();
  }
  const copyData = focused.toCopyData();
  if (!copyData) return false;
  localStorage.setItem('blocklyStash', JSON.stringify(copyData));
  return true;
}

/**
 * Paste precondition called by both keyboard shortcut and context menu item.
 *
 * @param workspace workspace to paste in. should not be a flyout workspace.
 * @returns true if paste happened, false otherwise.
 */
function pastePrecondition(workspace: Blockly.WorkspaceSvg): ContextMenuState {
  const copyData = getCopyData();
  if (!copyData) return ContextMenuState.DISABLED;
  // If this is a block, make sure there's room for that type of block
  if (
    isBlockCopyData(copyData) &&
    !workspace?.isCapacityAvailable(copyData.typeCounts)
  )
    return ContextMenuState.DISABLED;

  if (
    !!workspace &&
    !workspace.isReadOnly() &&
    !workspace.isDragging() &&
    !Blockly.getFocusManager().ephemeralFocusTaken()
  )
    return ContextMenuState.ENABLED;
  return ContextMenuState.DISABLED;
}

/**
 * A Blockly plugin that adds context menu items and keyboard shortcuts
 * to allow users to copy and paste copyable objects between tabs.
 */
export class CrossTabCopyPaste {
  /**
   * Initializes the cross tab copy paste plugin. If no options are selected
   * then both context menu items and keyboard shortcuts are added.
   *
   * @param options
   * - `contextMenu` Register copy and paste in the context menu.
   * - `shortcut` Register cut (ctr + x), copy (ctr + c) and paste (ctr + v)
   * in the shortcut.
   * @param options.shortcut
   * @param options.contextMenu
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
   * Adds a copy command to the context menu for copyable items.
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
        return copyPrecondition(scope);
      },
      callback: function (scope: Blockly.ContextMenuRegistry.Scope) {
        const focused = scope.focusedNode;
        // Check Blockly.isCopyable to make sure focused.workspace exists
        if (!focused || !Blockly.isCopyable(focused)) return false;

        const workspace = focused.workspace;
        return copyCallback(scope, workspace);
      },
      id: 'blockCopyToStorage',
      weight: 0,
    };
    Blockly.ContextMenuRegistry.registry.register(copyToStorageOption);
  }

  /**
   * Adds a paste command to the context menu for copyable items.
   *
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
        // Only show paste option if menu was opened on a non-flyout workspace
        if (
          !(scope.focusedNode instanceof Blockly.WorkspaceSvg) ||
          scope.focusedNode.isFlyout
        )
          return ContextMenuState.HIDDEN;
        const workspace = scope.focusedNode;
        return pastePrecondition(workspace);
      },
      callback: function (scope, menuOpenEvent, menuSelectEvent, location) {
        const copyData = getCopyData();
        if (!copyData) return false;
        const workspace = scope.focusedNode;
        // Paste option only available if menu was opened on a workspace
        if (!(workspace instanceof Blockly.WorkspaceSvg)) return false;

        const pasteLocation = Blockly.utils.svgMath.screenToWsCoordinates(
          workspace,
          location,
        );
        try {
          return !!Blockly.clipboard.paste(copyData, workspace, pasteLocation);
        } catch (e) {
          if (e instanceof TypeError && typeErrorCallback) {
            typeErrorCallback();
          } else {
            throw e;
          }
        }
      },
      id: 'blockPasteFromStorage',
      weight: 0,
    };
    Blockly.ContextMenuRegistry.registry.register(pasteFromStorageOption);
  }

  /**
   * Adds a keyboard shortcut that will store copy information for a copyable
   * in localStorage.
   */
  blockCopyToStorageShortcut() {
    const copyShortcut: Blockly.ShortcutRegistry.KeyboardShortcut = {
      name: 'copy',
      preconditionFn: function (workspace, scope) {
        const status = copyPrecondition(scope, workspace);
        return status === ContextMenuState.ENABLED;
      },
      callback: function (workspace, e, shortcut, scope) {
        // Prevent the default copy behavior,
        // which may beep or otherwise indicate
        // an error due to the lack of a selection.
        e.preventDefault();
        return copyCallback(scope, workspace);
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
   * Adds a keyboard shortcut that will store copy information for copyable
   * items in local storage and delete the item.
   */
  blockCutToStorageShortcut() {
    const cutShortcut: Blockly.ShortcutRegistry.KeyboardShortcut = {
      name: 'cut',
      preconditionFn(workspace, scope) {
        const focused = scope.focusedNode;
        return (
          !!focused &&
          !workspace.isReadOnly() &&
          !workspace.isDragging() &&
          !Blockly.getFocusManager().ephemeralFocusTaken() &&
          isCuttable(focused)
        );
      },
      callback: function (workspace, e, shortcut, scope) {
        // Prevent the default cut behavior,
        // which may beep or otherwise indicate
        // an error due to the lack of a selection.
        e.preventDefault();

        const focused = scope.focusedNode;
        if (!focused || !isCuttable(focused) || !Blockly.isCopyable(focused)) {
          return false;
        }
        const copyData = focused.toCopyData();
        if (!copyData) return false;

        if (focused instanceof Blockly.BlockSvg) {
          focused.checkAndDelete();
        } else if (Blockly.isDeletable(focused)) {
          // Manually handle event grouping since only blocks handle that
          // automatically.
          const oldGroup = Blockly.Events.getGroup();
          Blockly.Events.setGroup(true);
          focused.dispose();
          Blockly.Events.setGroup(oldGroup);
        }

        localStorage.setItem('blocklyStash', JSON.stringify(copyData));
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
   * Adds a keyboard shortcut that will paste the copyable stored in localStorage.
   *
   * @param typeErrorCallback
   * callback function to handle type errors
   */
  blockPasteFromStorageShortcut(typeErrorCallback?: TypeErrorCallback) {
    const pasteShortcut: Blockly.ShortcutRegistry.KeyboardShortcut = {
      name: 'paste',
      preconditionFn: function (workspace) {
        const targetWorkspace = workspace.isFlyout
          ? workspace.targetWorkspace
          : workspace;

        if (!targetWorkspace) return false;
        const status = pastePrecondition(targetWorkspace);
        return status === ContextMenuState.ENABLED;
      },
      callback: function (workspace, e) {
        // Prevent the default copy behavior,
        // which may beep or otherwise indicate
        // an error due to the lack of a selection.
        e.preventDefault();
        const copyData = getCopyData();
        if (!copyData) return false;

        // If paste shortcut is called while flyout is open, paste in the
        // main workspace instead.
        const targetWorkspace = workspace.isFlyout
          ? workspace.targetWorkspace
          : workspace;
        if (!targetWorkspace) return false;
        try {
          if (e instanceof PointerEvent) {
            // The event that triggers a shortcut would conventionally be a KeyboardEvent.
            // However, it may be a PointerEvent if a context menu item was used as a
            // wrapper for this callback, in which case the new block(s) should be pasted
            // at the mouse coordinates where the menu was opened, and this PointerEvent
            // is where the menu was opened.
            const mouseCoords = Blockly.utils.svgMath.screenToWsCoordinates(
              targetWorkspace,
              new Blockly.utils.Coordinate(e.clientX, e.clientY),
            );
            return !!Blockly.clipboard.paste(
              copyData,
              targetWorkspace,
              mouseCoords,
            );
          }
          // If we don't have location data about the original copyable, let the
          // paster determine position.
          return !!Blockly.clipboard.paste(copyData, targetWorkspace);
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
