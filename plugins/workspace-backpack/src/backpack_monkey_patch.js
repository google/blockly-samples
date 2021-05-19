/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A monkeypatch in Blockly to support a backpack.
 * @author kozbial@google.com (Monica Kozbial)
 */
import * as Blockly from 'blockly/core';


// TODO: No way to do this currently without monkeypatching Blockly.
(() => {
  /* eslint-disable no-import-assign */
  /**
   * Close tooltips, context menus, dropdown selections, etc.
   * @param {boolean=} opt_allowToolbox If true, don't close the toolbox.
   */
  Blockly.hideChaff = function(opt_allowToolbox) {
    Blockly.Tooltip.hide();
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
    if (!opt_allowToolbox) {
      const workspace = Blockly.getMainWorkspace();
      // For now the trashcan flyout always autocloses because it overlays the
      // trashcan UI (no trashcan to click to close it).
      if (workspace.trashcan &&
          workspace.trashcan.flyout) {
        workspace.trashcan.closeFlyout();
      }
      const toolbox = workspace.getToolbox();
      if (toolbox &&
          toolbox.getFlyout() &&
          toolbox.getFlyout().autoClose) {
        toolbox.clearSelection();
      }
      if (workspace.backpack) {
        workspace.backpack.close();
      }
    }
  };

  /**
   * Update the cursor (and possibly the trash can lid) to reflect whether the
   * dragging block would be deleted if released immediately.
   * @private
   */
  Blockly.BlockDragger.prototype.updateCursorDuringBlockDrag_ = function() {
    this.wouldDeleteBlock_ = this.draggedConnectionManager_.wouldDeleteBlock();
    const trashcan = this.workspace_.trashcan;
    if (this.wouldDeleteBlock_) {
      this.draggingBlock_.setDeleteStyle(true);
      if (this.deleteArea_ == Blockly.DELETE_AREA_TRASH && trashcan) {
        trashcan.setLidOpen(true);
      }
    } else {
      this.draggingBlock_.setDeleteStyle(false);
      if (trashcan) {
        trashcan.setLidOpen(false);
      }
    }
    // start monkeypatch edit
    if (this.isOverBackpack_) {
      this.workspace_.backpack.onDragOver_();
    } else {
      this.workspace_.backpack.onDragExit_();
    }
    // end Monkeypatch edit
  };

  /**
   * Execute a step of block dragging, based on the given event.  Update the
   * display accordingly.
   * @param {!Event} e The most recent move event.
   * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer
   *     has moved from the position at the start of the drag, in pixel units.
   * @package
   */
  Blockly.BlockDragger.prototype.dragBlock = function(e, currentDragDeltaXY) {
    const delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
    const newLoc = Blockly.utils.Coordinate.sum(this.startXY_, delta);

    this.draggingBlock_.moveDuringDrag(newLoc);
    this.dragIcons_(delta);

    // start monkeypatch edit
    if (this.workspace_.backpack &&
        this.workspace_.backpack.getTargetArea()
            .contains(e.clientX, e.clientY)) {
      this.isOverBackpack_ = true;
      this.deleteArea_ = Blockly.DELETE_AREA_NONE;
    } else {
      this.isOverBackpack_ = false;
      this.deleteArea_ = this.workspace_.isDeleteArea(e);
    }
    // end Monkeypatch edit

    this.draggedConnectionManager_.update(delta, this.deleteArea_);

    this.updateCursorDuringBlockDrag_();
  };

  /**
   * Finish a block drag and put the block back on the workspace.
   * @param {!Event} e The mouseup/touchend event.
   * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer
   *     has moved from the position at the start of the drag, in pixel units.
   * @package
   */
  Blockly.BlockDragger.prototype.endBlockDrag = function(
      e, currentDragDeltaXY) {
    // Make sure internal state is fresh.
    this.dragBlock(e, currentDragDeltaXY);
    this.dragIconData_ = [];
    this.fireDragEndEvent_();

    Blockly.utils.dom.stopTextWidthCache();

    Blockly.blockAnimations.disconnectUiStop();

    // start monkeypatch edit
    const delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
    const newLoc = this.isOverBackpack_ ?
        this.startXY_ : Blockly.utils.Coordinate.sum(this.startXY_, delta);
    this.draggingBlock_.moveOffDragSurface(newLoc);

    if (this.isOverBackpack_) {
      // Handle adding to Backpack
      const backpack = this.workspace_.backpack;
      backpack.handleBlockDrop(this.draggingBlock_);
      this.draggingBlock_.setDragging(false);
      // Blocks dragged directly from a flyout may need to be bumped.
      Blockly.bumpObjectIntoBounds_(
          this.draggingBlock_.workspace,
          this.workspace_.getMetricsManager()
              .getScrollMetrics(true), this.draggingBlock_);
      this.draggingBlock_.render();
    } else if (!this.maybeDeleteBlock_()) {
      // These are expensive and don't need to be done if we're deleting.
      this.draggingBlock_.moveConnections(delta.x, delta.y);
      this.draggingBlock_.setDragging(false);
      this.fireMoveEvent_();
      if (this.draggedConnectionManager_.wouldConnectBlock()) {
        // Applying connections also rerenders the relevant blocks.
        this.draggedConnectionManager_.applyConnections();
      } else {
        this.draggingBlock_.render();
      }
      this.draggingBlock_.scheduleSnapAndBump();
    }
    // end monkeypatch edit

    this.workspace_.setResizesEnabled(true);

    const toolbox = this.workspace_.getToolbox();
    if (toolbox && typeof toolbox.removeStyle == 'function') {
      const style = this.draggingBlock_.isDeletable() ? 'blocklyToolboxDelete' :
          'blocklyToolboxGrab';
      toolbox.removeStyle(style);
    }
    Blockly.Events.setGroup(false);
  };
  /* eslint-enable no-import-assign */
})();
