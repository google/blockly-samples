/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

/** A Draggable that can be autoscrolled. */
export interface AutoScrollable extends Blockly.IDraggable {
  /** TODO: check if we can use drag instead */
  moveDuringDrag: (coordinate: Blockly.utils.Coordinate) => void;

  /**
   * Returns the coordinates of a bounding box describing the dimensions of
   * this draggable.
   */
  getBoundingRectangle: () => Blockly.utils.Rect;
}

/**
 * Checks if the draggable implements the AutoScrollable interface.
 *
 * @param draggable
 * @returns true if draggable is also AutoScrollable
 */
export function isAutoScrollable(
  draggable: Blockly.IDraggable,
): draggable is AutoScrollable {
  return (
    typeof (draggable as AutoScrollable).moveDuringDrag === 'function' &&
    typeof (draggable as AutoScrollable).getBoundingRectangle === 'function'
  );
}
