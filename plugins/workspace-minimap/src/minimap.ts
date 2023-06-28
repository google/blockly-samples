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
      const options = {readOnly: true};
    //   this.minimap_ = new Blockly.WorkspaceSvg(new Blockly.Options(options));
    this.minimap_ = Blockly.inject('blocklyDiv', {readOnly: true});
    }
  
    /**
     * Initialize.
     */
    init(): void {
        this.initMirror();
    }

    initMirror(): void {
        const eventFilter = [
            Blockly.Events.BLOCK_CHANGE,
            Blockly.Events.BLOCK_CREATE,
            Blockly.Events.BLOCK_DELETE,
            Blockly.Events.BLOCK_DRAG,
            Blockly.Events.BLOCK_MOVE];

        const mirror = function (event) {
            if (eventFilter.indexOf(event) === -1) {
                return;
            }
            const json = event.toJson();
            console.log(event, json);
            const duplciateEvent = Blockly.Events.fromJson(json, this.minimap_);
            duplciateEvent.run(true);
        }
        this.workspace_.addChangeListener(mirror)
    }
  }
  