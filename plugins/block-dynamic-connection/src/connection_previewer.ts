/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

interface ConnectionPreviewerConstructor {
  new (draggedBlock: Blockly.BlockSvg): Blockly.IConnectionPreviewer;
}

interface DynamicBlock extends Blockly.BlockSvg {
  onPendingConnection(connection: Blockly.Connection): void;
  finalizeConnections(): void;
}

function blockIsDynamic(block: Blockly.BlockSvg): block is DynamicBlock {
  return (
    (block as any)['onPendingConnection'] !== undefined &&
    (block as any)['finalizeConnections'] !== undefined
  );
}

export function DynamicConnectionPreviewer(
  // TODO: Make this optional before merging.
  basePreviewerConstructor: ConnectionPreviewerConstructor,
): ConnectionPreviewerConstructor {
  return class implements Blockly.IConnectionPreviewer {
    private basePreviewer: Blockly.IConnectionPreviewer;

    private pendingBlocks: Set<DynamicBlock> = new Set();

    constructor(draggedBlock: Blockly.BlockSvg) {
      this.basePreviewer = new basePreviewerConstructor(draggedBlock);
    }

    previewReplacement(
      draggedConn: Blockly.RenderedConnection,
      staticConn: Blockly.RenderedConnection,
      replacedBlock: Blockly.BlockSvg,
    ): void {
      this.previewDynamism(staticConn);
      this.basePreviewer.previewReplacement(
        draggedConn,
        staticConn,
        replacedBlock,
      );
    }

    previewConnection(
      draggedConn: Blockly.RenderedConnection,
      staticConn: Blockly.RenderedConnection,
    ): void {
      this.previewDynamism(staticConn);
      this.basePreviewer.previewConnection(draggedConn, staticConn);
    }

    hidePreview(): void {
      this.basePreviewer.hidePreview();
    }

    dispose(): void {
      for (const block of this.pendingBlocks) {
        if (block.isDeadOrDying()) return;
        block.finalizeConnections();
      }
      this.pendingBlocks.clear();
      this.basePreviewer.dispose();
    }

    /**
     * If the block is a dynamic block, calls onPendingConnection and
     * stores the block to be finalized later.
     */
    private previewDynamism(conn: Blockly.RenderedConnection) {
      const block = conn.getSourceBlock();
      if (blockIsDynamic(block)) {
        block.onPendingConnection(conn);
        this.pendingBlocks.add(block);
      }
    }
  };
}
