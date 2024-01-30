/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

interface ConnectionPreviewerConstructor {
  new (draggedBlock: Blockly.BlockSvg): Blockly.IConnectionPreviewer;
}

export function DynamicConnectionPreviewer(
  // TODO: Make this optional before merging.
  basePreviewerConstructor: ConnectionPreviewerConstructor,
): ConnectionPreviewerConstructor {
  return class implements Blockly.IConnectionPreviewer {
    private basePreviewer: Blockly.IConnectionPreviewer;

    constructor(draggedBlock: Blockly.BlockSvg) {
      this.basePreviewer = new basePreviewerConstructor(draggedBlock);
    }

    previewReplacement(
      draggedConn: Blockly.RenderedConnection,
      staticConn: Blockly.RenderedConnection,
      replacedBlock: Blockly.BlockSvg,
    ): void {
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
      this.basePreviewer.previewConnection(draggedConn, staticConn);
    }

    hidePreview(): void {
      this.basePreviewer.hidePreview();
    }

    dispose(): void {
      this.basePreviewer.dispose();
    }
  };
}
