/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A minimap is a miniature version of your blocks that
 * appears on top of your main workspace. This gives you an overview
 * of what your code looks like, and how it is organized.
 * @author cesarades@google.com (Cesar Ades)
 */

import * as Blockly from 'blockly/core';

// Events that should be send over to the minimap from the primary workspace
const BlockEvents = [
  Blockly.Events.BLOCK_CHANGE,
  Blockly.Events.BLOCK_CREATE,
  Blockly.Events.BLOCK_DELETE,
  Blockly.Events.BLOCK_DRAG,
  Blockly.Events.BLOCK_MOVE];

/**
 * A minimap is a miniature version of your blocks that appears on
 * top of your main workspace. This gives you an overview of what
 * your code looks like, and how it is organized.
 */
export class Minimap {
    protected primaryWorkspace: Blockly.WorkspaceSvg;
    protected minimapWorkspace: Blockly.WorkspaceSvg;
    /**
     * Constructor for a minimap
     * @param workspace The workspace to mirror
     */
    constructor(workspace: Blockly.WorkspaceSvg) {
      this.primaryWorkspace = workspace;
      const options = {
        readOnly: true,
      };
      this.minimapWorkspace = Blockly.inject('minimapDiv', options);
    }

    /**
     * Initialize.
     */
    init(): void {
      this.mirror = this.mirror.bind(this);
      this.primaryWorkspace.addChangeListener(this.mirror);
    }

    /**
     * Creates the mirroring between workspaces. Passes on all desired events
     * to the minimap from the primary workspace.
     * @param event The primary workspace event.
     */
    private mirror(event: Blockly.Events.Abstract): void {
      if (BlockEvents.indexOf(event.type) > -1) {
        const json = event.toJson();
        const duplicate = Blockly.Events.fromJson(json, this.minimapWorkspace);
        duplicate.run(true);
      }
    }
}
