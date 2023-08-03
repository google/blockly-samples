/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Registers all of the keyboard shortcuts that are necessary for
 * navigating blockly using the keyboard.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

import './gesture_monkey_patch';

import * as Blockly from 'blockly/core';

import * as Constants from './constants';
import {Navigation} from './navigation';

/**
 * Class for registering shortcuts for keyboard navigation.
 */
export class NavigationController {
  /** Data copied by the copy or cut keyboard shortcuts. */
  copyData = null;

  /** The workspace a copy or cut keyboard shortcut happened in. */
  copyWorkspace = null;

  /**
   * Constructor used for registering shortcuts.
   * This will register any default shortcuts for keyboard navigation.
   * This is intended to be a singleton.
   * @param {!Navigation=} optNavigation The class that handles keyboard
   *     navigation shortcuts. (Ex: inserting a block, focusing the flyout).
   */
  constructor(optNavigation) {
    /**
     * Handles any keyboard navigation shortcuts.
     * @type {!Navigation}
     * @public
     */
    this.navigation = optNavigation || new Navigation();
  }

  /**
   * Registers the default keyboard shortcuts for keyboard navigation.
   * @public
   */
  init() {
    this.addShortcutHandlers();
    this.registerDefaults();
  }

  /**
   * Adds methods to core Blockly components that allows them to handle keyboard
   * shortcuts when in keyboard navigation mode.
   * @protected
   */
  addShortcutHandlers() {
    if (Blockly.FieldColour) {
      Blockly.FieldColour.prototype.onShortcut = this.fieldColourHandler;
    }

    if (Blockly.FieldDropdown) {
      Blockly.FieldDropdown.prototype.onShortcut = this.fieldDropdownHandler;
    }

    if (Blockly.Toolbox) {
      Blockly.Toolbox.prototype.onShortcut = this.toolboxHandler;
    }
  }

  /**
   * Removes methods on core Blockly components that allows them to handle
   * keyboard shortcuts.
   * @protected
   */
  removeShortcutHandlers() {
    if (Blockly.FieldColour) {
      Blockly.FieldColour.prototype.onShortcut = null;
    }

    if (Blockly.FieldDropdown) {
      Blockly.FieldDropdown.prototype.onShortcut = null;
    }

    if (Blockly.Toolbox) {
      Blockly.Toolbox.prototype.onShortcut = null;
    }
  }

  /**
   * Handles the given keyboard shortcut.
   * This is only triggered when keyboard accessibility mode is enabled.
   * @param {!Blockly.ShortcutRegistry.KeyboardShortcut} shortcut The shortcut
   *     to be handled.
   * @returns {boolean} True if the field handled the shortcut,
   *     false otherwise.
   * @this {Blockly.FieldColour}
   * @protected
   */
  fieldColourHandler(shortcut) {
    if (this.picker_) {
      switch (shortcut.name) {
        case Constants.SHORTCUT_NAMES.PREVIOUS:
          this.moveHighlightBy_(0, -1);
          return true;
        case Constants.SHORTCUT_NAMES.NEXT:
          this.moveHighlightBy_(0, 1);
          return true;
        case Constants.SHORTCUT_NAMES.OUT:
          this.moveHighlightBy_(-1, 0);
          return true;
        case Constants.SHORTCUT_NAMES.IN:
          this.moveHighlightBy_(1, 0);
          return true;
        default:
          return false;
      }
    }
    // If we haven't already handled the shortcut, let the default Field
    // handler try.
    return Blockly.Field.prototype.onShortcut.call(this, shortcut);
  }

  /**
   * Handles the given keyboard shortcut.
   * This is only triggered when keyboard accessibility mode is enabled.
   * @param {!Blockly.ShortcutRegistry.KeyboardShortcut} shortcut The shortcut
   *     to be handled.
   * @returns {boolean} True if the field handled the shortcut,
   *     false otherwise.
   * @this {Blockly.FieldDropdown}
   * @protected
   */
  fieldDropdownHandler(shortcut) {
    if (this.menu_) {
      switch (shortcut.name) {
        case Constants.SHORTCUT_NAMES.PREVIOUS:
          this.menu_.highlightPrevious();
          return true;
        case Constants.SHORTCUT_NAMES.NEXT:
          this.menu_.highlightNext();
          return true;
        default:
          return false;
      }
    }
    // If we haven't already handled the shortcut, let the default Field
    // handler try.
    return Blockly.Field.prototype.onShortcut.call(this, shortcut);
  }

  /**
   * Handles the given keyboard shortcut.
   * This is only triggered when keyboard accessibility mode is enabled.
   * @param {!Blockly.ShortcutRegistry.KeyboardShortcut} shortcut The shortcut
   *     to be handled.
   * @returns {boolean} True if the toolbox handled the shortcut,
   *     false otherwise.
   * @this {Blockly.Toolbox}
   * @protected
   */
  toolboxHandler(shortcut) {
    if (!this.selectedItem_) {
      return false;
    }
    switch (shortcut.name) {
      case Constants.SHORTCUT_NAMES.PREVIOUS:
        return this.selectPrevious_();
      case Constants.SHORTCUT_NAMES.OUT:
        return this.selectParent_();
      case Constants.SHORTCUT_NAMES.NEXT:
        return this.selectNext_();
      case Constants.SHORTCUT_NAMES.IN:
        return this.selectChild_();
      default:
        return false;
    }
  }

  /**
   * Adds all necessary event listeners and markers to a workspace for keyboard
   * navigation to work. This must be called for keyboard navigation to work
   * on a workspace.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to add keyboard
   *     navigation to.
   * @public
   */
  addWorkspace(workspace) {
    this.navigation.addWorkspace(workspace);
  }

  /**
   * Removes all necessary event listeners and markers to a workspace for
   * keyboard navigation to work.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to remove keyboard
   *     navigation from.
   * @public
   */
  removeWorkspace(workspace) {
    this.navigation.removeWorkspace(workspace);
  }

  /**
   * Turns on keyboard navigation.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to turn on keyboard
   *     navigation for.
   * @public
   */
  enable(workspace) {
    this.navigation.enableKeyboardAccessibility(workspace);
  }

  /**
   * Turns off keyboard navigation.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to turn off keyboard
   *     navigation on.
   * @public
   */
  disable(workspace) {
    this.navigation.disableKeyboardAccessibility(workspace);
  }

  /**
   * Gives the cursor to the field to handle if the cursor is on a field.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to check.
   * @param {!Blockly.ShortcutRegistry.KeyboardShortcut} shortcut The shortcut
   *     to give to the field.
   * @returns {boolean} True if the shortcut was handled by the field, false
   *     otherwise.
   * @protected
   */
  fieldShortcutHandler(workspace, shortcut) {
    const cursor = workspace.getCursor();
    if (!cursor || !cursor.getCurNode()) {
      return;
    }
    const curNode = cursor.getCurNode();
    if (curNode.getType() === Blockly.ASTNode.types.FIELD) {
      return (/** @type {!Blockly.Field} */ (curNode.getLocation()))
          .onShortcut(shortcut);
    }
    return false;
  }

  /**
   * Keyboard shortcut to go to the previous location when in keyboard
   * navigation mode.
   * @protected
   */
  registerPrevious() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const previousShortcut = {
      name: Constants.SHORTCUT_NAMES.PREVIOUS,
      preconditionFn: (workspace) => {
        return workspace.keyboardAccessibilityMode;
      },
      callback: (workspace, e, shortcut) => {
        const flyout = workspace.getFlyout();
        const toolbox = workspace.getToolbox();
        let isHandled = false;
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.WORKSPACE:
            isHandled = this.fieldShortcutHandler(workspace, shortcut);
            if (!isHandled) {
              workspace.getCursor().prev();
              isHandled = true;
            }
            return isHandled;
          case Constants.STATE.FLYOUT:
            isHandled = this.fieldShortcutHandler(workspace, shortcut);
            if (!isHandled) {
              flyout.getWorkspace().getCursor().prev();
              isHandled = true;
            }
            return isHandled;
          case Constants.STATE.TOOLBOX:
            return toolbox && typeof toolbox.onShortcut == 'function' ?
                toolbox.onShortcut(shortcut) :
                false;
          default:
            return false;
        }
      },
    };

    Blockly.ShortcutRegistry.registry.register(previousShortcut);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        Blockly.utils.KeyCodes.W, previousShortcut.name);
  }

  /**
   * Keyboard shortcut to turn keyboard navigation on or off.
   * @protected
   */
  registerToggleKeyboardNav() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const toggleKeyboardNavShortcut = {
      name: Constants.SHORTCUT_NAMES.TOGGLE_KEYBOARD_NAV,
      callback: (workspace) => {
        if (workspace.keyboardAccessibilityMode) {
          this.navigation.disableKeyboardAccessibility(workspace);
        } else {
          this.navigation.enableKeyboardAccessibility(workspace);
        }
        return true;
      },
    };

    Blockly.ShortcutRegistry.registry.register(toggleKeyboardNavShortcut);
    const ctrlShiftK = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.K,
        [Blockly.utils.KeyCodes.CTRL, Blockly.utils.KeyCodes.SHIFT]);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        ctrlShiftK, toggleKeyboardNavShortcut.name);
  }

  /**
   * Keyboard shortcut to go to the out location when in keyboard navigation
   * mode.
   * @protected
   */
  registerOut() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const outShortcut = {
      name: Constants.SHORTCUT_NAMES.OUT,
      preconditionFn: (workspace) => {
        return workspace.keyboardAccessibilityMode;
      },
      callback: (workspace, e, shortcut) => {
        const toolbox = workspace.getToolbox();
        let isHandled = false;
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.WORKSPACE:
            isHandled = this.fieldShortcutHandler(workspace, shortcut);
            if (!isHandled) {
              workspace.getCursor().out();
              isHandled = true;
            }
            return isHandled;
          case Constants.STATE.FLYOUT:
            this.navigation.focusToolbox(workspace);
            return true;
          case Constants.STATE.TOOLBOX:
            return toolbox && typeof toolbox.onShortcut == 'function' ?
                toolbox.onShortcut(shortcut) :
                false;
          default:
            return false;
        }
      },
    };

    Blockly.ShortcutRegistry.registry.register(outShortcut);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        Blockly.utils.KeyCodes.A, outShortcut.name);
  }

  /**
   * Keyboard shortcut to go to the next location when in keyboard navigation
   * mode.
   * @protected
   */
  registerNext() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const nextShortcut = {
      name: Constants.SHORTCUT_NAMES.NEXT,
      preconditionFn: (workspace) => {
        return workspace.keyboardAccessibilityMode;
      },
      callback: (workspace, e, shortcut) => {
        const toolbox = workspace.getToolbox();
        const flyout = workspace.getFlyout();
        let isHandled = false;
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.WORKSPACE:
            isHandled = this.fieldShortcutHandler(workspace, shortcut);
            if (!isHandled) {
              workspace.getCursor().next();
              isHandled = true;
            }
            return isHandled;
          case Constants.STATE.FLYOUT:
            isHandled = this.fieldShortcutHandler(workspace, shortcut);
            if (!isHandled) {
              flyout.getWorkspace().getCursor().next();
              isHandled = true;
            }
            return isHandled;
          case Constants.STATE.TOOLBOX:
            return toolbox && typeof toolbox.onShortcut == 'function' ?
                toolbox.onShortcut(shortcut) :
                false;
          default:
            return false;
        }
      },
    };

    Blockly.ShortcutRegistry.registry.register(nextShortcut);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        Blockly.utils.KeyCodes.S, nextShortcut.name);
  }

  /**
   * Keyboard shortcut to go to the in location when in keyboard navigation
   * mode.
   * @protected
   */
  registerIn() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const inShortcut = {
      name: Constants.SHORTCUT_NAMES.IN,
      preconditionFn: (workspace) => {
        return workspace.keyboardAccessibilityMode;
      },
      callback: (workspace, e, shortcut) => {
        const toolbox = workspace.getToolbox();
        let isHandled = false;
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.WORKSPACE:
            isHandled = this.fieldShortcutHandler(workspace, shortcut);
            if (!isHandled) {
              workspace.getCursor().in();
              isHandled = true;
            }
            return isHandled;
          case Constants.STATE.TOOLBOX:
            isHandled = toolbox && typeof toolbox.onShortcut == 'function' ?
                toolbox.onShortcut(shortcut) :
                false;
            if (!isHandled) {
              this.navigation.focusFlyout(workspace);
            }
            return true;
          default:
            return false;
        }
      },
    };

    Blockly.ShortcutRegistry.registry.register(inShortcut);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        Blockly.utils.KeyCodes.D, inShortcut.name);
  }

  /**
   * Keyboard shortcut to connect a block to a marked location when in keyboard
   * navigation mode.
   * @protected
   */
  registerInsert() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const insertShortcut = {
      name: Constants.SHORTCUT_NAMES.INSERT,
      preconditionFn: (workspace) => {
        return workspace.keyboardAccessibilityMode &&
            !workspace.options.readOnly;
      },
      callback: (workspace) => {
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.WORKSPACE:
            return this.navigation.connectMarkerAndCursor(workspace);
          default:
            return false;
        }
      },
    };

    Blockly.ShortcutRegistry.registry.register(insertShortcut);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        Blockly.utils.KeyCodes.I, insertShortcut.name);
  }

  /**
   * Keyboard shortcut to mark a location when in keyboard navigation mode.
   * @protected
   */
  registerMark() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const markShortcut = {
      name: Constants.SHORTCUT_NAMES.MARK,
      preconditionFn: (workspace) => {
        return workspace.keyboardAccessibilityMode &&
            !workspace.options.readOnly;
      },
      callback: (workspace) => {
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.WORKSPACE:
            this.navigation.handleEnterForWS(workspace);
            return true;
          case Constants.STATE.FLYOUT:
            this.navigation.insertFromFlyout(workspace);
            return true;
          default:
            return false;
        }
      },
    };

    Blockly.ShortcutRegistry.registry.register(markShortcut);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        Blockly.utils.KeyCodes.ENTER, markShortcut.name);
  }

  /**
   * Keyboard shortcut to disconnect two blocks when in keyboard navigation
   * mode.
   * @protected
   */
  registerDisconnect() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const disconnectShortcut = {
      name: Constants.SHORTCUT_NAMES.DISCONNECT,
      preconditionFn: (workspace) => {
        return workspace.keyboardAccessibilityMode &&
            !workspace.options.readOnly;
      },
      callback: (workspace) => {
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.WORKSPACE:
            this.navigation.disconnectBlocks(workspace);
            return true;
          default:
            return false;
        }
      },
    };

    Blockly.ShortcutRegistry.registry.register(disconnectShortcut);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        Blockly.utils.KeyCodes.X, disconnectShortcut.name);
  }

  /**
   * Keyboard shortcut to focus on the toolbox when in keyboard navigation
   * mode.
   * @protected
   */
  registerToolboxFocus() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const focusToolboxShortcut = {
      name: Constants.SHORTCUT_NAMES.TOOLBOX,
      preconditionFn: (workspace) => {
        return workspace.keyboardAccessibilityMode &&
            !workspace.options.readOnly;
      },
      callback: (workspace) => {
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.WORKSPACE:
            if (!workspace.getToolbox()) {
              this.navigation.focusFlyout(workspace);
            } else {
              this.navigation.focusToolbox(workspace);
            }
            return true;
          default:
            return false;
        }
      },
    };

    Blockly.ShortcutRegistry.registry.register(focusToolboxShortcut);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        Blockly.utils.KeyCodes.T, focusToolboxShortcut.name);
  }

  /**
   * Keyboard shortcut to exit the current location and focus on the workspace
   * when in keyboard navigation mode.
   * @protected
   */
  registerExit() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const exitShortcut = {
      name: Constants.SHORTCUT_NAMES.EXIT,
      preconditionFn: (workspace) => {
        return workspace.keyboardAccessibilityMode;
      },
      callback: (workspace) => {
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.FLYOUT:
            this.navigation.focusWorkspace(workspace);
            return true;
          case Constants.STATE.TOOLBOX:
            this.navigation.focusWorkspace(workspace);
            return true;
          default:
            return false;
        }
      },
    };

    Blockly.ShortcutRegistry.registry.register(exitShortcut, true);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        Blockly.utils.KeyCodes.ESC, exitShortcut.name, true);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        Blockly.utils.KeyCodes.E, exitShortcut.name, true);
  }

  /**
   * Keyboard shortcut to move the cursor on the workspace to the left when in
   * keyboard navigation mode.
   * @protected
   */
  registerWorkspaceMoveLeft() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const wsMoveLeftShortcut = {
      name: Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_LEFT,
      preconditionFn: (workspace) => {
        return workspace.keyboardAccessibilityMode &&
            !workspace.options.readOnly;
      },
      callback: (workspace) => {
        return this.navigation.moveWSCursor(workspace, -1, 0);
      },
    };

    Blockly.ShortcutRegistry.registry.register(wsMoveLeftShortcut);
    const shiftA = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.A, [Blockly.utils.KeyCodes.SHIFT]);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        shiftA, wsMoveLeftShortcut.name);
  }

  /**
   * Keyboard shortcut to move the cursor on the workspace to the right when in
   * keyboard navigation mode.
   * @protected
   */
  registerWorkspaceMoveRight() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const wsMoveRightShortcut = {
      name: Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_RIGHT,
      preconditionFn: (workspace) => {
        return workspace.keyboardAccessibilityMode &&
            !workspace.options.readOnly;
      },
      callback: (workspace) => {
        return this.navigation.moveWSCursor(workspace, 1, 0);
      },
    };

    Blockly.ShortcutRegistry.registry.register(wsMoveRightShortcut);
    const shiftD = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.D, [Blockly.utils.KeyCodes.SHIFT]);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        shiftD, wsMoveRightShortcut.name);
  }

  /**
   * Keyboard shortcut to move the cursor on the workspace up when in keyboard
   * navigation mode.
   * @protected
   */
  registerWorkspaceMoveUp() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const wsMoveUpShortcut = {
      name: Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_UP,
      preconditionFn: (workspace) => {
        return workspace.keyboardAccessibilityMode &&
            !workspace.options.readOnly;
      },
      callback: (workspace) => {
        return this.navigation.moveWSCursor(workspace, 0, -1);
      },
    };

    Blockly.ShortcutRegistry.registry.register(wsMoveUpShortcut);
    const shiftW = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.W, [Blockly.utils.KeyCodes.SHIFT]);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        shiftW, wsMoveUpShortcut.name);
  }

  /**
   * Keyboard shortcut to move the cursor on the workspace down when in
   * keyboard navigation mode.
   * @protected
   */
  registerWorkspaceMoveDown() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const wsMoveDownShortcut = {
      name: Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_DOWN,
      preconditionFn: (workspace) => {
        return workspace.keyboardAccessibilityMode &&
            !workspace.options.readOnly;
      },
      callback: (workspace) => {
        return this.navigation.moveWSCursor(workspace, 0, 1);
      },
    };

    Blockly.ShortcutRegistry.registry.register(wsMoveDownShortcut);
    const shiftW = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.S, [Blockly.utils.KeyCodes.SHIFT]);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        shiftW, wsMoveDownShortcut.name);
  }

  /**
   * Keyboard shortcut to copy the block the cursor is currently on.
   * @protected
   */
  registerCopy() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const copyShortcut = {
      name: Constants.SHORTCUT_NAMES.COPY,
      preconditionFn: (workspace) => {
        if (workspace.keyboardAccessibilityMode &&
            !workspace.options.readOnly) {
          const curNode = workspace.getCursor().getCurNode();
          if (curNode && curNode.getSourceBlock()) {
            const sourceBlock = curNode.getSourceBlock();
            return !Blockly.Gesture.inProgress() && sourceBlock &&
                sourceBlock.isDeletable() && sourceBlock.isMovable();
          }
        }
        return false;
      },
      callback: (workspace) => {
        const sourceBlock =/** @type {Blockly.BlockSvg} */ (
          workspace.getCursor().getCurNode().getSourceBlock());
        workspace.hideChaff();
        this.copyData = sourceBlock.toCopyData();
        this.copyWorkspace = sourceBlock.workspace;
        return !!this.copyData;
      },
    };

    Blockly.ShortcutRegistry.registry.register(copyShortcut);

    const ctrlC = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.CTRL]);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        ctrlC, copyShortcut.name, true);

    const altC = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.ALT]);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        altC, copyShortcut.name, true);

    const metaC = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.META]);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        metaC, copyShortcut.name, true);
  }

  /**
   * Register shortcut to paste the copied block to the marked location.
   * @protected
   */
  registerPaste() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const pasteShortcut = {
      name: Constants.SHORTCUT_NAMES.PASTE,
      preconditionFn: (workspace) => {
        return workspace.keyboardAccessibilityMode &&
            !workspace.options.readOnly && !Blockly.Gesture.inProgress();
      },
      callback: () => {
        if (!this.copyData || !this.copyWorkspace) return false;
        return this.navigation.paste(this.copyData, this.copyWorkspace);
      },
    };

    Blockly.ShortcutRegistry.registry.register(pasteShortcut);

    const ctrlV = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.CTRL]);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        ctrlV, pasteShortcut.name, true);

    const altV = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.ALT]);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        altV, pasteShortcut.name, true);

    const metaV = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.META]);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        metaV, pasteShortcut.name, true);
  }

  /**
   * Keyboard shortcut to copy and delete the block the cursor is on using
   * ctrl+x, cmd+x, or alt+x.
   * @protected
   */
  registerCut() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const cutShortcut = {
      name: Constants.SHORTCUT_NAMES.CUT,
      preconditionFn: (workspace) => {
        if (workspace.keyboardAccessibilityMode &&
            !workspace.options.readOnly) {
          const curNode = workspace.getCursor().getCurNode();
          if (curNode && curNode.getSourceBlock()) {
            const sourceBlock = curNode.getSourceBlock();
            return !Blockly.Gesture.inProgress() && sourceBlock &&
                sourceBlock.isDeletable() && sourceBlock.isMovable() &&
                !sourceBlock.workspace.isFlyout;
          }
        }
        return false;
      },
      callback: (workspace) => {
        const sourceBlock =/** @type {Blockly.BlockSvg} */ (
          workspace.getCursor().getCurNode().getSourceBlock());
        this.copyData = sourceBlock.toCopyData();
        this.copyWorkspace = sourceBlock.workspace;
        this.navigation.moveCursorOnBlockDelete(workspace, sourceBlock);
        sourceBlock.checkAndDelete();
        return true;
      },
    };

    Blockly.ShortcutRegistry.registry.register(cutShortcut);

    const ctrlX = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.CTRL]);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        ctrlX, cutShortcut.name, true);

    const altX = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.ALT]);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        altX, cutShortcut.name, true);

    const metaX = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.META]);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        metaX, cutShortcut.name, true);
  }

  /**
   * Registers shortcut to delete the block the cursor is on using delete or
   * backspace.
   * @protected
   */
  registerDelete() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const deleteShortcut = {
      name: Constants.SHORTCUT_NAMES.DELETE,
      preconditionFn: function(workspace) {
        if (workspace.keyboardAccessibilityMode &&
            !workspace.options.readOnly) {
          const curNode = workspace.getCursor().getCurNode();
          if (curNode && curNode.getSourceBlock()) {
            const sourceBlock = curNode.getSourceBlock();
            return sourceBlock && sourceBlock.isDeletable();
          }
        }
        return false;
      },
      callback: (workspace, e) => {
        const sourceBlock = workspace.getCursor().getCurNode().getSourceBlock();
        // Delete or backspace.
        // Stop the browser from going back to the previous page.
        // Do this first to prevent an error in the delete code from resulting
        // in data loss.
        e.preventDefault();
        // Don't delete while dragging.  Jeez.
        if (Blockly.Gesture.inProgress()) {
          return false;
        }
        this.navigation.moveCursorOnBlockDelete(workspace, sourceBlock);
        sourceBlock.checkAndDelete();
        return true;
      },
    };
    Blockly.ShortcutRegistry.registry.register(deleteShortcut);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        Blockly.utils.KeyCodes.DELETE, deleteShortcut.name, true);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        Blockly.utils.KeyCodes.BACKSPACE, deleteShortcut.name, true);
  }

  /**
   * Registers all default keyboard shortcut items for keyboard navigation. This
   * should be called once per instance of KeyboardShortcutRegistry.
   * @protected
   */
  registerDefaults() {
    this.registerPrevious();
    this.registerNext();
    this.registerIn();
    this.registerOut();

    this.registerDisconnect();
    this.registerExit();
    this.registerInsert();
    this.registerMark();
    this.registerToolboxFocus();
    this.registerToggleKeyboardNav();

    this.registerWorkspaceMoveDown();
    this.registerWorkspaceMoveLeft();
    this.registerWorkspaceMoveUp();
    this.registerWorkspaceMoveRight();

    this.registerCopy();
    this.registerPaste();
    this.registerCut();
    this.registerDelete();
  }

  /**
   * Removes all the keyboard navigation shortcuts.
   * @public
   */
  dispose() {
    const shortcutNames = Object.values(Constants.SHORTCUT_NAMES);
    for (const name of shortcutNames) {
      Blockly.ShortcutRegistry.registry.unregister(name);
    }
    this.removeShortcutHandlers();
    this.navigation.dispose();
  }
}
