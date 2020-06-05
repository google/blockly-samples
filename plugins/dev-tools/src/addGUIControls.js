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
export function addGUIControls(createWorkspace, defaultOptions) {
  const hash = window.location.hash;
  const guiState = JSON.parse(localStorage.getItem('guiState') ||
      '{"options":{},"debug":{}}');
  if (hash) {
    hash.replace(/#?([^=&]+)=([^=&]+)/gm, function(_m0, m1, m2) {
      guiState.options[m1] = m2;
    });
  }
  let saveOptions = {
    ...defaultOptions,
    ...guiState.options,
  };
  initDebugRenderer(guiState.debug);

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
    localStorage.setItem('guiState', JSON.stringify(guiState));
    // Save GUI state into window.hash:
    window.location.hash = Object.keys(guiState.options)
        .filter((k) => typeof guiState.options[k] != 'object')
        .map((k) => `${k}=${guiState.options[k]}`)
        .join('&');
    // Update options.
    Object.assign(options, workspace.options);
    gui.updateDisplay();
  };

  const onChange = (key, value) => {
    saveOptions[key] = value;
    guiState.options[key] = value;
    onChangeInternal();
  };

  const resetObj = {
    'Reset': () => {
      saveOptions = {
        ...defaultOptions,
      };
      guiState.options = {};
      initDebugRenderer(guiState.debug, true);
      onChangeInternal();
    }};

  gui.add(resetObj, 'Reset');

  // Options folder.
  const optionsFolder = gui.addFolder('Options');

  optionsFolder.add(options, 'RTL').name('rtl').onChange((value) =>
    onChange('rtl', value));

  // Renderer.
  populateRendererOption(optionsFolder, options, onChange);

  // Theme.
  populateThemeOption(optionsFolder, options, defaultOptions, onChange);

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
  populateBasicOptions(basicFolder, options, onChange);

  // Move options.
  const moveFolder = optionsFolder.addFolder('Move');
  populateMoveOptions(moveFolder, options, saveOptions, onChange);

  // Zoom options.
  const zoomFolder = optionsFolder.addFolder('Zoom');
  populateZoomOptions(zoomFolder, options, saveOptions, onChange);

  // Grid options.
  const gridFolder = optionsFolder.addFolder('Grid');
  populateGridOptions(gridFolder, options, saveOptions, onChange);

  // Debug renderer.
  const debugFolder = gui.addFolder('Debug');
  populateDebugOptions(debugFolder, guiState.debug, onChangeInternal);

  // GUI actions.
  const actionsFolder = gui.addFolder('Actions');
  const actionSubFolders = {};
  const actions = {};

  /**
   * Get the current workspace.
   * @return {!Blockly.WorkspaceSvg} The Blockly workspace.
   */
  const getWorkspace = () => {
    return workspace;
  };

  /**
   * Add a custom action to the list of playground actions.
   * @param {string} name The action label.
   * @param {function(!Blockly.Workspace):void} callback The callback to call
   *     when the action is clicked.
   * @param {string=} folderName Optional folder to place the action under.
   * @return {dat.GUI} The GUI controller.
   */
  const addAction = (name, callback, folderName) => {
    actions[name] = () => {
      callback(workspace);
    };
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
    return controller;
  };

  const devGui = /** @type {?} */ (gui);
  devGui.addAction = addAction;
  devGui.getWorkspace = getWorkspace;

  addActions(devGui);

  return devGui;
}

/**
 * Populate basic options.
 * @param {dat.GUI} basicFolder The dat.GUI basic folder.
 * @param {Blockly.Options} options Blockly options.
 * @param {function(string, string):void} onChange On Change method.
 */
function populateBasicOptions(basicFolder, options, onChange) {
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
}

/**
 * Populate the renderer option.
 * @param {dat.GUI} folder The dat.GUI folder.
 * @param {Blockly.Options} options Blockly options.
 * @param {function(string, string):void} onChange On Change method.
 */
function populateRendererOption(folder, options, onChange) {
  // Get the list of renderers. Previous versions of Blockly used the
  // rendererMap_, whereas newer versions that use the global registry get their
  // list of renderers from somewhere else.
  const renderers = Blockly.blockRendering.rendererMap_ ||
      Blockly.registry.typeMap_['renderer'];
  folder.add(options, 'renderer', Object.keys(renderers))
      .onChange((value) => onChange('renderer', value));
}

/**
 * Populate the theme option.
 * @param {dat.GUI} folder The dat.GUI folder.
 * @param {Blockly.Options} options Blockly options.
 * @param {Blockly.Options} defaultOptions Default Blockly options.
 * @param {function(string, string):void} onChange On Change method.
 */
function populateThemeOption(folder, options, defaultOptions, onChange) {
  let themes;
  if (Blockly.registry.typeMap_['theme']) {
    // Using a version of Blockly that registers themes.
    themes = Blockly.registry.typeMap_['theme'];
  } else {
    // Fall back to a pre-set list of themes.
    themes = {
      'classic': Blockly.Themes.Classic,
      'dark': Blockly.Themes.Dark,
      'deuteranopia': Blockly.Themes.Deuteranopia,
      'highcontrast': Blockly.Themes.HighContrast,
      'tritanopia': Blockly.Themes.Tritanopia,
    };
    if (defaultOptions.theme) {
      themes[defaultOptions.theme.name] = defaultOptions.theme;
    }
  }
  folder.add(options.theme, 'name', Object.keys(themes)).name('theme')
      .onChange((value) => onChange('theme', themes[value]));
}

/**
 * Populate move options.
 * @param {dat.GUI} moveFolder The dat.GUI move options folder.
 * @param {Blockly.Options} options Blockly options.
 * @param {Blockly.Options} saveOptions Saved Blockly options.
 * @param {function(string, string):void} onChange On Change method.
 */
function populateMoveOptions(moveFolder, options, saveOptions, onChange) {
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
}

/**
 * Populate zoom options.
 * @param {dat.GUI} zoomFolder The dat.GUI zoom options folder.
 * @param {Blockly.Options} options Blockly options.
 * @param {Blockly.Options} saveOptions Saved Blockly options.
 * @param {function(string, string):void} onChange On Change method.
 */
function populateZoomOptions(zoomFolder, options, saveOptions, onChange) {
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
}

/**
 * Populate grid options.
 * @param {dat.GUI} gridFolder The dat.GUI grid options folder.
 * @param {Blockly.Options} options Blockly options.
 * @param {Blockly.Options} saveOptions Saved Blockly options.
 * @param {function(string, string):void} onChange On Change method.
 */
function populateGridOptions(gridFolder, options, saveOptions, onChange) {
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
}

/**
 * Initialize debug renderer.
 * @param {Object.<string, boolean>} guiDebugState Saved GUI debug state.
 * @param {boolean=} reset Whether or not to reset the renderer config.
 */
function initDebugRenderer(guiDebugState, reset) {
  DebugRenderer.init();
  Object.keys(DebugRenderer.config).map((key) => {
    if (guiDebugState[key] == undefined || reset) {
      guiDebugState[key] = false;
    }
    DebugRenderer.config[key] = guiDebugState[key];
  });
}

/**
 * Populate debug options.
 * @param {dat.GUI} debugFolder The dat.GUI debug folder.
 * @param {Object.<string, boolean>} guiDebugState Saved GUI debug state.
 * @param {function():void} onChangeInternal Internal on change method.
 */
function populateDebugOptions(debugFolder, guiDebugState, onChangeInternal) {
  Object.keys(DebugRenderer.config).map((key) => {
    debugFolder.add(guiDebugState, key, 0, 50).onChange((value) => {
      guiDebugState[key] = value;
      DebugRenderer.config[key] = guiDebugState[key];
      onChangeInternal();
    });
  });
}

/**
 * Add default actions to the GUI instance.
 * @param {?} gui The GUI instance.
 */
function addActions(gui) {
  // Visibility actions.
  gui.addAction('Show', (workspace) => {
    workspace.setVisible(true);
  }, 'Visibility');
  gui.addAction('Hide', (workspace) => {
    workspace.setVisible(false);
  }, 'Visibility');

  // Block actions.
  gui.addAction('Clear', (workspace) => {
    workspace.clear();
  }, 'Blocks');
  gui.addAction('Format', (workspace) => {
    workspace.cleanUp();
  }, 'Blocks');

  // Undo/Redo actions.
  gui.addAction('Undo', (workspace) => {
    workspace.undo();
  }, 'Undo/Redo');
  gui.addAction('Redo', (workspace) => {
    workspace.undo(true);
  }, 'Undo/Redo');
  gui.addAction('Clear Undo Stack', (workspace) => {
    workspace.clearUndo();
  }, 'Undo/Redo');

  // Scale actions.
  gui.addAction('Zoom reset', (workspace) => {
    workspace.setScale(workspace.options.zoomOptions.startScale);
    workspace.scrollCenter();
  }, 'Scale');
  gui.addAction('Zoom center', (workspace) => {
    workspace.scrollCenter();
  }, 'Scale');
  gui.addAction('Zoom to Fit', (workspace) => {
    workspace.zoomToFit();
  }, 'Scale');

  // Accessibility actions.
  gui.addAction('Keyboard', (workspace) => {
    if (workspace.keyboardAccessibilityMode) {
      Blockly.navigation.disableKeyboardAccessibility();
    } else {
      Blockly.navigation.enableKeyboardAccessibility();
    }
  }, 'Accessibility');
  gui.addAction('Navigate All', (_workspace) => {
    Blockly.ASTNode.NAVIGATE_ALL_FIELDS =
      !Blockly.ASTNode.NAVIGATE_ALL_FIELDS;
  }, 'Accessibility');
}
