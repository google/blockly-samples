/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Typedefs and utility methods for parsing options for the
 * backpack plugin.
 * @author kozbial@google.com (Monica Kozbial)
 */

/**
 * @typedef {{
 *   emptyBackpack:(boolean|undefined),
 *   removeFromBackpack:(boolean|undefined),
 *   copyToBackpack:(boolean|undefined),
 *   copyAllToBackpack:(boolean|undefined),
 *   pasteAllToBackpack:(boolean|undefined),
 *   disablePreconditionChecks:(boolean|undefined),
 * }}
 */
export let BackpackContextMenuOptions;

/**
 * @typedef {{
 *    contextMenu:(!BackpackContextMenuOptions|undefined),
 * }}
 */
export let BackpackOptions;

/**
 * Returns a new options object with all properties set, using default values
 * if not specified in the optional options that were passed in.
 * @param {BackpackOptions=} options The options to use.
 * @return {!BackpackOptions} The created options object.
 */
export function parseOptions(options) {
  const defaultOptions = {
    contextMenu: {
      emptyBackpack: true,
      removeFromBackpack: true,
      copyToBackpack: true,
      copyAllToBackpack: false,
      pasteAllToBackpack: false,
      disablePreconditionChecks: false,
    },
  };
  if (!options) {
    return defaultOptions;
  }
  const mergedOptions = {};
  mergedOptions.contextMenu = {
    ...defaultOptions.contextMenu, ...options.contextMenu};
  return mergedOptions;
}
