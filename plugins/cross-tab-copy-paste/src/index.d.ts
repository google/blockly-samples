/**
 * A Blockly plugin that adds context menu items and keyboard shortcuts
 * to allow users to copy and paste a block between tabs.
 */
export class CrossTabCopyPaste {
  /**
   * Initializes the cross tab copy paste plugin. If no options are selected
   * then both context menu items and keyboard shortcuts are added.
   * @param {{contextMenu: boolean, shortcut: boolean}} options
   * `contextMenu` Register copy and paste in the context menu.
   * `shortcut` Register cut (ctr + x), copy (ctr + c) and paste (ctr + v)
   * in the shortcut.
   */
  init({
    contextMenu,
    shortcut,
  }?: {
    contextMenu: boolean;
    shortcut: boolean;
  }): void;
}
