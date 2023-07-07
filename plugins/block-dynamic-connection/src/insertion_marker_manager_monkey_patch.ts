/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Overrides methods on Blockly.InsertionMarkerManager to
 * allow blocks to hook in dynamic functionality when they have pending
 * connections.
 * @author anjali@code.org (Anjali Pal)
 */

import * as Blockly from 'blockly/core';

// MonkeyPatchedInsertionMarkerManager overrides the update and dispose methods,
// and adds a new property called pendingBlocks.
interface MonkeyPatchedInsertionMarkerManager
    extends Blockly.InsertionMarkerManager {
  pendingBlocks: Set<Blockly.Block>;
}

// MonkeyPatchedInsertionMarkerManager relies on the dynamic blocks adding new
// methods called onPendingConnection and finalizeConnections.
interface DynamicBlock extends Blockly.Block {
  onPendingConnection(connection: Blockly.Connection): void;
  finalizeConnections(): void;
}

// Override the update method, possibly adding the candidate to pendingBlocks.
// Hack: Private methods of InsertionMarkerManager are called using the array
// index syntax, bypassing access checking. The private methods are also missing
// type information in the d.ts files and are considered to return any here.
Blockly.InsertionMarkerManager.prototype.update =
    function(
        this: MonkeyPatchedInsertionMarkerManager,
        dxy: Blockly.utils.Coordinate,
        dragTarget: Blockly.IDragTarget | null): void {
      const newCandidate = this['getCandidate'](dxy);

      this.wouldDeleteBlock = this['shouldDelete'](!!newCandidate, dragTarget);

      const shouldUpdate: boolean = this.wouldDeleteBlock ||
          this['shouldUpdatePreviews'](newCandidate, dxy);

      if (shouldUpdate) {
        // Begin monkey patch
        if (newCandidate?.closest?.sourceBlock_.onPendingConnection) {
          newCandidate.closest.sourceBlock_
              .onPendingConnection(newCandidate.closest);
          if (!this.pendingBlocks) {
            this.pendingBlocks = new Set();
          }
          this.pendingBlocks.add(newCandidate.closest.sourceBlock_);
        }
        // End monkey patch
        // Don't fire events for insertion marker creation or movement.
        Blockly.Events.disable();
        this['maybeHidePreview'](newCandidate);
        this['maybeShowPreview'](newCandidate);
        Blockly.Events.enable();
      }
    };

const oldDispose = Blockly.InsertionMarkerManager.prototype.dispose;
Blockly.InsertionMarkerManager.prototype.dispose =
    function(this: MonkeyPatchedInsertionMarkerManager) {
      if (this.pendingBlocks) {
        this.pendingBlocks.forEach((block) => {
          if ((block as DynamicBlock).finalizeConnections) {
            (block as DynamicBlock).finalizeConnections();
          }
        });
      }
      oldDispose.call(this);
    };
