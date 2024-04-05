/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

/** Defines if an object can be added to the backpack. */
export interface Backpackable {
  /**
   * Returns a representation of this object as a FlyoutItemInfo array, so that
   * it can be displayed in the backpack.
   *
   * This method should remove any unique or useless state data (e.g. IDs or
   * coordinates).
   */
  toFlyoutData(): Blockly.utils.toolbox.FlyoutItemInfo[];
}

/** Checks whether the given object conforms to the Backpackable interface. */
export function isBackpackable(obj: any): obj is Backpackable {
  return obj.toFlyoutData !== undefined;
}
