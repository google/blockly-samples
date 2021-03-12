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

const oldApplyConnections =
  Blockly.InsertionMarkerManager.prototype.applyConnections;

Blockly.InsertionMarkerManager.prototype.applyConnections = function() {
  oldApplyConnections.call(this);

  if (this.closestConnection_ &&
      this.closestConnection_.sourceBlock_.finalizeConnections) {
    this.closestConnection_.sourceBlock_.finalizeConnections();
  }
};

Blockly.InsertionMarkerManager.prototype.update = function(dxy, deleteArea) {
  const candidate = this.getCandidate_(dxy);
  // Begin monkey patch
  const previousTargetBlock = this.closestConnection_ &&
    this.closestConnection_.sourceBlock_;
  // End monkey patch

  this.wouldDeleteBlock_ = this.shouldDelete_(candidate, deleteArea);
  const shouldUpdate = this.wouldDeleteBlock_ ||
      this.shouldUpdatePreviews_(candidate, dxy);

  if (shouldUpdate) {
    // Begin monkey patch
    if (candidate.closest &&
        candidate.closest.sourceBlock_.onPendingConnection) {
      candidate.closest.sourceBlock_.onPendingConnection(candidate.closest);
    }
    // End monkey patch
    // Don't fire events for insertion marker creation or movement.
    Blockly.Events.disable();
    this.maybeHidePreview_(candidate);
    this.maybeShowPreview_(candidate);
    Blockly.Events.enable();
  }

  // Begin monkey patch
  const newTargetBlock = (
    candidate &&
    candidate.closest &&
    candidate.closest.sourceBlock_
  );
  if (newTargetBlock != previousTargetBlock) {
    if (previousTargetBlock && previousTargetBlock.finalizeConnections) {
      previousTargetBlock.finalizeConnections();
    }
  }
  // End monkey patch
};
