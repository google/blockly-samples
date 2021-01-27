/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Holds all methods necessary to use Blockly through the
 * keyboard.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

import * as Blockly from 'blockly/core';
import * as Constants from './constants';
import {
  registrationName as cursorRegistrationName,
  registrationType as cursorRegistrationType} from './flyout_cursor';

/**
 * Class that holds all methods necessary for keyboard navigation to work.
 */
export class Navigation {
  /**
   * Constructor for keyboard navigation.
   */
  constructor() {
    /**
     * Object holding the location of the cursor for each workspace.
     * Possible locations of the cursor are: workspace, flyout or toolbox.
     * @type {Object<string,Constants.STATE>}
     * @protected
     */
    this.workspaceStates = {};

    /**
     * An optional method that allows a developer to customize how to handle
     * logs, warnings, and errors. The first argument is one of 'log', 'warn',
     * or 'error'. The second argument is the message.
     * @type {?function(string, string)}
     * @public
     */
    this.loggingCallback = null;

    /**
     * The distance to move the cursor when the cursor is on the workspace.
     * @type {number}
     * @public
     */
    this.WS_MOVE_DISTANCE = 40;

    /**
     * The name of the marker to use for keyboard navigation.
     * @type {string}
     * @public
     */
    this.MARKER_NAME = 'local_marker_1';

    /**
     * The default coordinate to use when focusing on the workspace and no
     * blocks are present.
     * @type {!Blockly.utils.Coordinate}
     * @public
     */
    this.DEFAULT_WS_COORDINATE = new Blockly.utils.Coordinate(100, 100);

    /**
     * The default coordinate to use when moving the cursor to the workspace
     * after a block has been deleted.
     * @type {!Blockly.utils.Coordinate}
     * @public
     */
    this.WS_COORDINATE_ON_DELETE = new Blockly.utils.Coordinate(100, 100);

    /**
     * Wrapper for method that deals with workspace changes.
     * Used for removing change listener.
     * @type {Function}
     * @protected
     */
    this.wsChangeWrapper = this.workspaceChangeListener.bind(this);

    /**
     * Wrapper for method that deals with flyout changes.
     * Used for removing change listener.
     * @type {Function}
     * @protected
     */
    this.flyoutChangeWrapper = this.flyoutChangeListener.bind(this);

    /**
     * The list of registered workspaces.
     * Used when removing change listeners in dispose.
     * @protected
     */
    this.workspaces = [];
  }

  /**
   * Adds all necessary change listeners and markers to a workspace for keyboard
   * navigation to work. This must be called for keyboard navigation to work
   * on a workspace.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to add keyboard
   *     navigation to.
   * @public
   */
  addWorkspace(workspace) {
    this.workspaces.push(workspace);
    const flyout = workspace.getFlyout();
    workspace.getMarkerManager().registerMarker(
        this.MARKER_NAME, new Blockly.Marker());
    workspace.addChangeListener(this.wsChangeWrapper);

    if (flyout) {
      this.addFlyout(flyout);
    }
  }

  /**
   * Removes all keyboard navigation change listeners and markers.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to remove keyboard
   *     navigation from.
   * @public
   */
  removeWorkspace(workspace) {
    const workspaceIdx = this.workspaces.indexOf(workspace);
    const flyout = workspace.getFlyout();

    if (workspace.getCursor()) {
      this.disableKeyboardAccessibility(workspace);
    }

    if (workspaceIdx > -1) {
      this.workspaces.splice(workspaceIdx, 1);
    }
    if (workspace.getMarkerManager()) {
      workspace.getMarkerManager().unregisterMarker(this.MARKER_NAME);
    }
    workspace.removeChangeListener(this.wsChangeWrapper);

    if (flyout) {
      this.removeFlyout(flyout);
    }
  }

  /**
   * Sets the state for the given workspace.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to set the state on.
   * @param {Constants.STATE} state The navigation state.
   * @protected
   */
  setState(workspace, state) {
    this.workspaceStates[workspace.id] = state;
  }

  /**
   * Gets the navigation state of the current workspace.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to get the state of.
   * @return {Constants.STATE} The sate of the given workspace.
   * @package
   */
  getState(workspace) {
    return this.workspaceStates[workspace.id];
  }

  /**
   * Gets the marker created for keyboard navigation.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to get the marker
   *     from.
   * @return {Blockly.Marker} The marker created for keyboard navigation.
   * @protected
   */
  getMarker(workspace) {
    return workspace.getMarker(this.MARKER_NAME);
  }

  /**
   * Adds all event listeners and cursors to the flyout that are needed for
   * keyboard navigation to work.
   * @param {!Blockly.IFlyout} flyout The flyout to add a cursor and change
   *     listeners to.
   * @protected
   */
  addFlyout(flyout) {
    const flyoutWorkspace = flyout.getWorkspace();
    flyoutWorkspace.addChangeListener(this.flyoutChangeWrapper);
    const FlyoutCursorClass = Blockly.registry.getClass(
        cursorRegistrationType, cursorRegistrationName);
    flyoutWorkspace.getMarkerManager().setCursor(new FlyoutCursorClass());
  }

  /**
   * Removes all change listeners from the flyout that are needed for
   * keyboard navigation to work.
   * @param {!Blockly.IFlyout} flyout The flyout to add a cursor and event
   *     listeners to.
   * @protected
   */
  removeFlyout(flyout) {
    const flyoutWorkspace = flyout.getWorkspace();
    flyoutWorkspace.removeChangeListener(this.flyoutChangeWrapper);
  }

  /**
   * Updates the state of keyboard navigation and the position of the cursor
   * based on workspace events.
   * @param {!Blockly.Events.Abstract} e The Blockly event to process.
   * @protected
   */
  workspaceChangeListener(e) {
    const workspace = Blockly.Workspace.getById(e.workspaceId);
    if (!workspace || !workspace.keyboardAccessibilityMode) {
      return;
    }
    switch (e.type) {
      case Blockly.Events.DELETE:
        this.handleBlockDeleteByDrag(workspace, e);
        break;
      case Blockly.Events.BLOCK_CHANGE:
        if (e.element === 'mutation') {
          this.handleBlockMutation(
              workspace, /** @type {Blockly.Events.BlockChange} */ (e));
        }
        break;
      case Blockly.Events.CLICK:
        this.handleWorkspaceClick(
            workspace, /** @type {Blockly.Events.Click} */ (e));
        break;
      case Blockly.Events.TOOLBOX_ITEM_SELECT:
        this.handleToolboxCategoryClick(
            workspace, /** @type {Blockly.Events.ToolboxItemSelect} */ (e));
        break;
      case Blockly.Events.BLOCK_CREATE:
        this.handleBlockCreate(workspace, e);
    }
  }

  /**
   * Updates the state of keyboard navigation and the position of the cursor
   * based on events emitted from the flyout's workspace.
   * @param {!Blockly.Events.Abstract} e The Blockly event to process.
   * @protected
   */
  flyoutChangeListener(e) {
    const flyoutWorkspace = Blockly.Workspace.getById(e.workspaceId);
    const mainWorkspace = flyoutWorkspace.targetWorkspace;
    const flyout = mainWorkspace.getFlyout();

    if (mainWorkspace && mainWorkspace.keyboardAccessibilityMode &&
        !flyout.autoClose) {
      if ((e.type === Blockly.Events.CLICK && e.targetType === 'block')) {
        const block = flyoutWorkspace.getBlockById(e.blockId);
        this.handleBlockClickInFlyout(mainWorkspace, block);
      } else if (e.type === Blockly.Events.SELECTED) {
        const block = flyoutWorkspace.getBlockById(e.newElementId);
        this.handleBlockClickInFlyout(mainWorkspace, block);
      }
    }
  }

  /**
   * Moves the cursor to the workspace if a block has been dragged from a simple
   * toolbox. For a category toolbox this is handled in
   * handleToolboxCategoryClick_.
   * @param {Blockly.WorkspaceSvg} workspace The workspace the cursor belongs
   *     to.
   * @param {!Blockly.Events.Abstract} e The Blockly event to process.
   * @protected
   */
  handleBlockCreate(workspace, e) {
    if (this.getState(workspace) === Constants.STATE.FLYOUT) {
      this.resetFlyout(workspace, !!workspace.getToolbox());
      this.setState(workspace, Constants.STATE.WORKSPACE);
    }
  }

  /**
   * Moves the cursor to the block level when the block the cursor is on
   * mutates.
   * @param {Blockly.WorkspaceSvg} workspace The workspace the cursor belongs
   *     to.
   * @param {!Blockly.Events.BlockChange} e The Blockly event to process.
   * @protected
   */
  handleBlockMutation(workspace, e) {
    const mutatedBlockId = e.blockId;
    const cursor = workspace.getCursor();
    if (cursor) {
      const curNode = cursor.getCurNode();
      const block = curNode ? curNode.getSourceBlock() : null;
      if (block && block.id === mutatedBlockId) {
        cursor.setCurNode(Blockly.ASTNode.createBlockNode(block));
      }
    }
  }

  /**
   * Moves the cursor to the workspace when a user clicks on the workspace.
   * @param {Blockly.WorkspaceSvg} workspace The workspace the cursor belongs
   *     to.
   * @param {!Blockly.Events.Click} e The Blockly event to process.
   * @protected
   */
  handleWorkspaceClick(workspace, e) {
    const workspaceState = this.getState(workspace);
    if (workspaceState !== Constants.STATE.WORKSPACE) {
      this.resetFlyout(workspace, !!workspace.getToolbox());
      this.setState(workspace, Constants.STATE.WORKSPACE);
    }
  }

  /**
   * Moves the cursor to the toolbox when a user clicks on a toolbox category.
   * Moves the cursor to the workspace if theh user closes the toolbox category.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace the toolbox is on.
   * @param {!Blockly.Events.ToolboxItemSelect} e The event emitted from the
   *     workspace.
   * @protected
   */
  handleToolboxCategoryClick(workspace, e) {
    const workspaceState = this.getState(workspace);
    if (e.newItem && workspaceState !== Constants.STATE.TOOLBOX) {
      // If the toolbox category was just clicked, focus on the toolbox.
      this.focusToolbox(workspace);
    } else if (!e.newItem) {
      // If the toolbox was closed, focus on the workspace.
      this.resetFlyout(workspace, !!workspace.getToolbox());
      this.setState(workspace, Constants.STATE.WORKSPACE);
    }
  }

  /**
   * Moves the cursor to the workspace when its parent block is deleted by
   * being dragged to the flyout or to the trashcan.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace the block was on.
   * @param {!Blockly.Events.Delete} e The event emitted when a block is
   *     deleted.
   * @protected
   */
  handleBlockDeleteByDrag(workspace, e) {
    const deletedBlockId = e.blockId;
    const ids = e.ids;
    const cursor = workspace.getCursor();

    // Make sure the cursor is on a block.
    if (!cursor || !cursor.getCurNode() ||
        !cursor.getCurNode().getSourceBlock()) {
      return;
    }

    const curNode = cursor.getCurNode();
    const sourceBlock = curNode.getSourceBlock();
    if (sourceBlock.id === deletedBlockId || ids.indexOf(sourceBlock.id) > -1) {
      cursor.setCurNode(Blockly.ASTNode.createWorkspaceNode(
          workspace, this.WS_COORDINATE_ON_DELETE));
    }
  }

  /**
   * Handles when a user clicks on a block in the flyout by moving the cursor
   * to that stack of blocks and setting the state of navigation to the flyout.
   * @param {Blockly.WorkspaceSvg} mainWorkspace The workspace the user clicked
   *     on.
   * @param {Blockly.BlockSvg} block The block the user clicked on.
   * @protected
   */
  handleBlockClickInFlyout(mainWorkspace, block) {
    if (!block) {
      return;
    }
    if (block.isShadow()) {
      block = /** @type {Blockly.BlockSvg}*/ (block.getParent());
    }
    this.getFlyoutCursor(mainWorkspace)
        .setCurNode(Blockly.ASTNode.createStackNode(block));
    this.setState(mainWorkspace, Constants.STATE.FLYOUT);
  }
}
