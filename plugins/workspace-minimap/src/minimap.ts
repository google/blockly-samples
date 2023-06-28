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
const BLOCK_EVENTS_ = [
    Blockly.Events.BLOCK_CHANGE,
    Blockly.Events.BLOCK_CREATE,
    Blockly.Events.BLOCK_DELETE,
    Blockly.Events.BLOCK_DRAG,
    Blockly.Events.BLOCK_MOVE];

/**
 * A minimap is a miniature version of your blocks that appears on
 * top of your main workspace. This gives you an overview of what
 * your code looks like, and how it is organized.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to sit in.
 */
export class Minimap {
    protected workspace_: Blockly.WorkspaceSvg;
    protected minimap_: Blockly.WorkspaceSvg;
    /**
     * Constructor for a minimap
     * @param {!Blockly.WorkspaceSvg} workspace The workspace to sit in.
     */
    constructor(workspace: Blockly.WorkspaceSvg) {
        this.workspace_ = workspace;
        const options = {
            readOnly: true,
        }
        this.minimap_ = Blockly.inject('minimapDiv', options);
        this.mirror = this.mirror.bind(this);
    }
  
    /**
     * Initialize.
     */
    init(): void {
        this.workspace_.addChangeListener(this.mirror);
    }

    /**
     * Creates the mirroring between workspaces. Passes on all desired events
     * to the minimap from the primary worskpace.
     * @param {Blockly.Events.Abstract} event The primary workspace event.
     * @protected
     */
    mirror(event: Blockly.Events.Abstract): void {
        if (BLOCK_EVENTS_.indexOf(event.type) > -1) {
            const json = event.toJson();
            const duplciateEvent = Blockly.Events.fromJson(json, this.minimap_);
            duplciateEvent.run(true);
        }
    }
  }
  