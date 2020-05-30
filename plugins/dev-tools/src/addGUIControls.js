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
 * @return {dat.GUI} The dat.GUI instance.
 */
export default function addGUIControls(createWorkspace, defaultOptions) {
  let guiControlOptions =
    JSON.parse(localStorage.getItem('guiControlOptions') || '{}');
  let saveOptions = {
    ...defaultOptions,
    ...guiControlOptions,
  };
  let workspace = createWorkspace(saveOptions);

  const gui = new dat.GUI({
    autoPlace: false,
    closeOnTop: true,
    width: 250,
  });

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

  const options = Object.assign({}, workspace.options);

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
    // Save GUI control options to local storage.
    localStorage.setItem('guiControlOptions',
        JSON.stringify(guiControlOptions));
    // Update options.
    Object.assign(options, workspace.options);
    gui.updateDisplay();
  };

  const onChange = (key, value) => {
    saveOptions[key] = value;
    guiControlOptions[key] = value;
    onChangeInternal();
  };

  // Options folder.
  const optionsFolder = gui.addFolder('Options');
  optionsFolder.open();

  const resetObj = {
    'Reset to Defaults': () => {
      saveOptions = {
        ...defaultOptions,
      };
      guiControlOptions = {};
      Object.keys(DebugRenderer.config)
          .forEach((key) => DebugRenderer.config[key] = false);
      onChangeInternal();
    }};

  optionsFolder.add(resetObj, 'Reset to Defaults');

  optionsFolder.add(options, 'RTL').name('rtl').onChange((value) =>
    onChange('rtl', value));

  // Renderer.
  optionsFolder.add(options, 'renderer',
      Object.keys(Blockly.blockRendering.rendererMap_))
      .onChange((value) => onChange('renderer', value));

  // Theme.
  const themes = {
    'classic': Blockly.Themes.Classic,
    'dark': Blockly.Themes.Dark,
    'deuteranopia': Blockly.Themes.Deuteranopia,
    'highcontrast': Blockly.Themes.HighContrast,
    'tritanopia': Blockly.Themes.Tritanopia,
  };
  if (defaultOptions.theme) {
    themes[defaultOptions.theme.name] = defaultOptions.theme;
  }
  optionsFolder.add(options.theme, 'name', Object.keys(themes)).name('theme')
      .onChange((value) => onChange('theme', themes[value]));

  // Toolbox.
  const toolboxSides = {top: 0, bottom: 1, left: 2, right: 3};
  optionsFolder.add(options, 'toolboxPosition', toolboxSides)
      .name('toolboxPosition')
      .onChange((value) => {
        const side = Object.keys(toolboxSides).find((key) =>
          toolboxSides[key] == value);
        saveOptions['horizontalLayout'] = side == 'top' || side == 'bottom';
        saveOptions['toolboxPosition'] = side == 'top' || side == 'left' ?
          'start' : 'end';
        onChangeInternal();
      });

  // Basic options.
  const basicFolder = optionsFolder.addFolder('Basic');
  basicFolder.add(options, 'readOnly').onChange((value) =>
    onChange('readOnly', value));
  basicFolder.add(options, 'hasTrashcan').name('trashCan').onChange((value) =>
    onChange('trashcan', value));
  basicFolder.add(options, 'hasSounds').name('sounds').onChange((value) =>
    onChange('sounds', value));
  basicFolder.add(options, 'disable').onChange((value) =>
    onChange('disable', value));
  basicFolder.add(options, 'collapse').onChange((value) =>
    onChange('collapse', value));
  basicFolder.add(options, 'comments').onChange((value) =>
    onChange('comments', value));

  // Move options.
  const moveFolder = optionsFolder.addFolder('Move');
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
  const zoomFolder = optionsFolder.addFolder('Zoom');
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
  const gridFolder = optionsFolder.addFolder('Grid');
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
  Object.keys(DebugRenderer.config)
      .forEach((key) => DebugRenderer.config[key] = false);
  const debugFolder = gui.addFolder('Debug');
  Object.keys(DebugRenderer.config).map((key) =>
    debugFolder.add(DebugRenderer.config, key, 0, 50).onChange((value) => {
      DebugRenderer.config[key] = value;
      onChangeInternal();
    })
  );

  // GUI actions.
  const actionsFolder = gui.addFolder('Actions');
  const actionSubFolders = {};
  const actions = {};

  const devGui = /** @type {*} */ (gui);
  devGui.addAction = (name, callback, folderName) => {
    actions[name] = callback(workspace);
    let folder = actionsFolder;
    if (folderName) {
      if (actionSubFolders[folderName]) {
        folder = actionSubFolders[folderName];
      } else {
        folder = actionsFolder.addFolder(folderName);
        folder.open();
        actionSubFolders[folderName] = folder;
      }
    }
    const controller = folder.add(actions, name);
    if (name) {
      controller.name(name);
    }
  };

  // Visibility actions.
  devGui.addAction('Show', (workspace) => {
    return () => {
      workspace.setVisible(true);
    };
  }, 'Visibility');
  devGui.addAction('Hide', (workspace) => {
    return () => {
      workspace.setVisible(false);
    };
  }, 'Visibility');

  // Block actions.
  devGui.addAction('Clear', (workspace) => {
    return () => {
      workspace.clear();
    };
  }, 'Blocks');
  devGui.addAction('Format', (workspace) => {
    return () => {
      workspace.cleanUp();
    };
  }, 'Blocks');

  // Undo/Redo actions.
  devGui.addAction('Undo', (workspace) => {
    return () => {
      workspace.undo();
    };
  }, 'Undo/Redo');
  devGui.addAction('Redo', (workspace) => {
    return () => {
      workspace.undo(true);
    };
  }, 'Undo/Redo');
  devGui.addAction('Clear Undo Stack', (workspace) => {
    return () => {
      workspace.clearUndo();
    };
  }, 'Undo/Redo');

  // Scale actions.
  devGui.addAction('Zoom to Fit', (workspace) => {
    return () => {
      workspace.zoomToFit();
    };
  }, 'Scale');

  // Accessibility actions.
  devGui.addAction('Keyboard', (workspace) => {
    return () => {
      if (workspace.keyboardAccessibilityMode) {
        Blockly.navigation.disableKeyboardAccessibility();
      } else {
        Blockly.navigation.enableKeyboardAccessibility();
      }
    };
  }, 'Accessibility');
  devGui.addAction('Navigate All', (workspace) => {
    return () => {
      Blockly.ASTNode.NAVIGATE_ALL_FIELDS =
        !Blockly.ASTNode.NAVIGATE_ALL_FIELDS;
    };
  }, 'Accessibility');

  return gui;
}
