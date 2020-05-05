
import * as Blockly from 'blockly/core';
import * as dat from 'dat.gui';

declare namespace DevTools {

  /**
   * A basic visualizer for debugging custom renderers.
   */
  export class DebugRenderer extends Blockly.blockRendering.Debug {
    static init(): void;
  }

  function addGUIControls(createWorkspace:
      (options: Blockly.BlocklyOptions) => Blockly.Workspace,
      defaultOptions: Blockly.BlocklyOptions): dat.GUI;

  const toolboxCategories: string;
  const toolboxSimple: string;
}

export = DevTools;
