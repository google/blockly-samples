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
  const parsedOptions = {
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
    return parsedOptions;
  }
  if (options.contextMenu !== undefined) {
    if (options.contextMenu.emptyBackpack !== undefined) {
      parsedOptions.contextMenu.emptyBackpack =
          !!options.contextMenu.emptyBackpack;
    }
    if (options.contextMenu.removeFromBackpack !== undefined) {
      parsedOptions.contextMenu.removeFromBackpack =
          !!options.contextMenu.removeFromBackpack;
    }
    if (options.contextMenu.copyToBackpack !== undefined) {
      parsedOptions.contextMenu.copyToBackpack =
          !!options.contextMenu.copyToBackpack;
    }
    if (options.contextMenu.copyAllToBackpack !== undefined) {
      parsedOptions.contextMenu.copyAllToBackpack =
          !!options.contextMenu.copyAllToBackpack;
    }
    if (options.contextMenu.pasteAllToBackpack !== undefined) {
      parsedOptions.contextMenu.pasteAllToBackpack =
          !!options.contextMenu.pasteAllToBackpack;
    }
    if (options.contextMenu.disablePreconditionChecks !== undefined) {
      parsedOptions.contextMenu.disablePreconditionChecks =
          !!options.contextMenu.disablePreconditionChecks;
    }
  }
}
