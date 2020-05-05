
import * as Blockly from 'blockly/core';
import * as dat from 'dat.gui';

declare namespace DevTools {

  /**
   * A basic visualizer for debugging custom renderers.
   */
  export class DebugRenderer extends Blockly.blockRendering.Debug {
    static init(): void;
  }

  /**
   * Use dat.GUI to add controls to adjust configuration of a Blockly workspace.
   */
  function addGUIControls(createWorkspace:
      (options: Blockly.BlocklyOptions) => Blockly.Workspace,
      defaultOptions: Blockly.BlocklyOptions): dat.GUI;

  /**
   * A toolbox xml with built-in blocks split into categories.
   */
  const toolboxCategories: string;

  /**
   * A simple toolbox xml with built-in blocks and no categories.
   */
  const toolboxSimple: string;
}

export = DevTools;
