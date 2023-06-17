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

Blockly.InsertionMarkerManager.prototype.update = function(dxy, dragTarget) {
  const newCandidate = this.getCandidate(dxy);

  this.wouldDeleteBlock = this.shouldDelete(!!newCandidate, dragTarget);

  const shouldUpdate =
      this.wouldDeleteBlock || this.shouldUpdatePreviews(newCandidate, dxy);

  if (shouldUpdate) {
    // Begin monkey patch
    if (newCandidate &&
        newCandidate.closest &&
        newCandidate.closest.sourceBlock_.onPendingConnection) {
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
    this.maybeHidePreview(newCandidate);
    this.maybeShowPreview(newCandidate);
    Blockly.Events.enable();
  }
};

const oldDispose = Blockly.InsertionMarkerManager.prototype.dispose;
Blockly.InsertionMarkerManager.prototype.dispose = function() {
  if (this.pendingBlocks) {
    this.pendingBlocks.forEach((block) => {
      if (block.finalizeConnections) {
        block.finalizeConnections();
      }
    });
  }
  oldDispose.call(this);
};
