/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A helper to use the dat.GUI interface for configuring Blockly
 * workspace options.
 * @author samelh@google.com (Sam El-Husseini)
 */
import * as dat from 'dat.gui';
import * as Blockly from 'blockly/core';
import {DebugRenderer} from './debugRenderer';

/**
 * Use dat.GUI to add controls to adjust configuration of a Blockly workspace.
 * @param {!function(!Blockly.BlocklyOptions):Blockly.Workspace} createWorkspace
 *     A workspace creation method called every time the toolbox is
 *     re-configured.
 * @param {Blockly.BlocklyOptions} defaultOptions The default workspace options
 *     to use.
 */
export default function addGUIControls(createWorkspace, defaultOptions) {
  let workspace = createWorkspace(defaultOptions);
  const saveOptions = defaultOptions;

  const gui = new dat.GUI({autoPlace: false});
  gui.close();

  const guiElement = gui.domElement;
  guiElement.style.position = 'absolute';
  guiElement.style.zIndex = '1000';

  const onResize = () => {
    const metrics = workspace.getMetrics();
    if (workspace.RTL) {
      guiElement.style.left = metrics.absoluteLeft + 'px';
      guiElement.style.right = 'auto';
    } else {
      guiElement.style.left = 'auto';
      if (metrics.toolboxPosition === Blockly.TOOLBOX_AT_RIGHT) {
        guiElement.style.right = metrics.toolboxWidth + 'px';
      } else {
        guiElement.style.right = '0';
      }
    }
    guiElement.style.top = metrics.absoluteTop + 'px';
  };
  onResize();

  const container = workspace.getInjectionDiv().parentNode;
  container.style.position = 'relative';
  container.appendChild(guiElement);

  const options = workspace.options;

  const onChangeInternal = () => {
    // Serialize current workspace state.
    const state = Blockly.Xml.workspaceToDom(workspace);
    // Dispose of the current workspace
    workspace.dispose();
    // Create a new workspace with options.
    workspace = createWorkspace(saveOptions);
    // Deserialize state into workspace.
    Blockly.Xml.domToWorkspace(state, workspace);
    // Resize the gui.
    onResize();
  };

  const onChange = (key, value) => {
    saveOptions[key] = value;
    onChangeInternal();
  };

  gui.add(options, 'RTL').onChange((value) => onChange('rtl', value));
  gui.add(options, 'readOnly').onChange((value) => onChange('readOnly', value));
  gui.add(options, 'hasTrashcan').onChange((value) =>
    onChange('trashcan', value));
  gui.add(options, 'hasSounds').onChange((value) => onChange('sounds', value));

  gui.add(options, 'disable').onChange((value) => onChange('disable', value));
  gui.add(options, 'collapse').onChange((value) => onChange('collapse', value));
  gui.add(options, 'comments').onChange((value) => onChange('comments', value));

  // Renderer.
  gui.add(options, 'renderer', ['geras', 'thrasos', 'zelos'])
      .onChange((value) => onChange('renderer', value));

  // Toolbox sides.
  const toolboxSides = {top: 0, bottom: 1, left: 2, right: 3};
  gui.add(options, 'toolboxPosition', toolboxSides)
      .onChange((value) => {
        const side = Object.keys(toolboxSides).find((key) =>
          toolboxSides[key] == value);
        saveOptions['horizontalLayout'] = side == 'top' || side == 'bottom';
        saveOptions['toolboxPosition'] = side == 'top' || side == 'left' ?
          'start' : 'end';
        onChangeInternal();
      });

  // Move options.
  const moveFolder = gui.addFolder('Move');
  moveFolder.add(options.moveOptions, 'scrollbars').onChange((value) =>
    onChange('move', {
      ...saveOptions.move,
      scrollbars: value,
    }));
  moveFolder.add(options.moveOptions, 'wheel').onChange((value) =>
    onChange('move', {
      ...saveOptions.move,
      wheel: value,
    }));
  moveFolder.add(options.moveOptions, 'drag').onChange((value) =>
    onChange('move', {
      ...saveOptions.move,
      drag: value,
    }));

  // Zoom options.
  const zoomFolder = gui.addFolder('Zoom');
  zoomFolder.add(options.zoomOptions, 'controls').onChange((value) =>
    onChange('zoom', {
      ...saveOptions.zoom,
      controls: value,
    }));
  zoomFolder.add(options.zoomOptions, 'wheel').onChange((value) =>
    onChange('zoom', {
      ...saveOptions.zoom,
      wheel: value,
    }));
  zoomFolder.add(options.zoomOptions, 'startScale', 0.1, 4).onChange((value) =>
    onChange('zoom', {
      ...saveOptions.zoom,
      startScale: value,
    }));
  zoomFolder.add(options.zoomOptions, 'maxScale', 1, 20).onChange((value) =>
    onChange('zoom', {
      ...saveOptions.zoom,
      maxScale: value,
    })).step(1);
  zoomFolder.add(options.zoomOptions, 'minScale', 0.1, 1).onChange((value) =>
    onChange('zoom', {
      ...saveOptions.zoom,
      minScale: value,
    })).step(0.05);

  // Grid options.
  const gridFolder = gui.addFolder('Grid');
  gridFolder.add(options.gridOptions, 'spacing', 0, 50).onChange((value) =>
    onChange('grid', {
      ...saveOptions.grid,
      spacing: value,
    }));
  gridFolder.add(options.gridOptions, 'length', 0, 30).onChange((value) =>
    onChange('grid', {
      ...saveOptions.grid,
      length: value,
    }));
  gridFolder.addColor(options.gridOptions, 'colour').onChange((value) =>
    onChange('grid', {
      ...saveOptions.grid,
      colour: value,
    }));
  gridFolder.add(options.gridOptions, 'snap').onChange((value) =>
    onChange('grid', {
      ...saveOptions.grid,
      snap: value,
    }));
  // Debug renderer.
  DebugRenderer.init();
  const debugFolder = gui.addFolder('Debug');
  Object.keys(DebugRenderer.config).map((key) =>
    debugFolder.add(DebugRenderer.config, key, 0, 50).onChange((value) => {
      DebugRenderer.config[key] = value;
      onChangeInternal();
    })
  );
}
