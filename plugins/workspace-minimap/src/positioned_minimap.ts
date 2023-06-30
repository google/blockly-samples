/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A positionable version of the minimap.
 * @author cesarades@google.com (Cesar Ades)
 */

import * as Blockly from 'blockly/core';
import {Minimap} from './minimap';

/**
 * A positionable version of minimap that implements IPositionable.
 * @param {Minimap} minimap The minimap to position.
 * @implements {Blockly.IPositionable}
 */
export class PositionedMinimap {
    protected minimap: Minimap;
    /**
     * Constructor for a minimap
     * @param {Minimap} minimap The workspace to sit in.
     */
    constructor(minimap: Minimap) {
      this.minimap = minimap;
    }

    /**
     * Initialize.
     */
    init(): void {
    //   this.work
    }
}
