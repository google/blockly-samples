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
   * @return {boolean} True if the field handled the shortcut,
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
    return Blockly.FieldColour.superClass_.onShortcut.call(this, shortcut);
  }

  /**
   * Handles the given keyboard shortcut.
   * This is only triggered when keyboard accessibility mode is enabled.
   * @param {!Blockly.ShortcutRegistry.KeyboardShortcut} shortcut The shortcut
   *     to be handled.
   * @return {boolean} True if the field handled the shortcut,
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
    return Blockly.FieldDropdown.superClass_.onShortcut.call(this, shortcut);
  }

  /**
   * Handles the given keyboard shortcut.
   * This is only triggered when keyboard accessibility mode is enabled.
   * @param {!Blockly.ShortcutRegistry.KeyboardShortcut} shortcut The shortcut
   *     to be handled.
   * @return {boolean} True if the toolbox handled the shortcut,
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
        return this.selectPrevious();
      case Constants.SHORTCUT_NAMES.OUT:
        return this.selectParent();
      case Constants.SHORTCUT_NAMES.NEXT:
        return this.selectNext();
      case Constants.SHORTCUT_NAMES.IN:
        return this.selectChild();
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
