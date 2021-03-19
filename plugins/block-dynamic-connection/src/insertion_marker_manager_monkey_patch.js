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

Blockly.InsertionMarkerManager.prototype.update = function(dxy, deleteArea) {
  const candidate = this.getCandidate_(dxy);

  this.wouldDeleteBlock_ = this.shouldDelete_(candidate, deleteArea);
  const shouldUpdate = this.wouldDeleteBlock_ ||
      this.shouldUpdatePreviews_(candidate, dxy);

  if (shouldUpdate) {
    // Begin monkey patch
    if (candidate.closest &&
        candidate.closest.sourceBlock_.onPendingConnection) {
      candidate.closest.sourceBlock_.onPendingConnection(candidate.closest);
      if (!this.pendingBlocks) {
        this.pendingBlocks = new Set();
      }
      this.pendingBlocks.add(candidate.closest.sourceBlock_);
    }
    // End monkey patch
    // Don't fire events for insertion marker creation or movement.
    Blockly.Events.disable();
    this.maybeHidePreview_(candidate);
    this.maybeShowPreview_(candidate);
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
