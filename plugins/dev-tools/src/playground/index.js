/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Entry point for the Blockly playground.
 * @author samelh@google.com (Sam El-Husseini)
 */

import * as Blockly from 'blockly/core';
import * as BlocklyJS from 'blockly/javascript';
import * as BlocklyPython from 'blockly/python';
import * as BlocklyLua from 'blockly/lua';
import * as BlocklyDart from 'blockly/dart';
import * as BlocklyPHP from 'blockly/php';

import {renderPlayground, renderCheckbox, renderCodeTab} from './ui';
import {addCodeEditor, displayCode, displayErrorMessage} from './monaco';
import addGUIControls from '../addGUIControls';

/**
 * @typedef {function(!HTMLElement,!Blockly.BlocklyOptions):Blockly.Workspace}
 */
let CreateWorkspaceFn;

/**
 * @typedef {{
 *     addAction: function(string,function(!Blockly.Workspace):void,string=),
 *     addGenerator: function(string,!Blockly.Generator,string=),
 * }}
 */
let PlaygroundAPI;

/**
 * Create the Blockly playground.
 * @param {!HTMLElement} container Container element.
 * @param {CreateWorkspaceFn} createWorkspace A workspace creation method called
 *     every time the toolbox is re-configured.
 * @param {Blockly.BlocklyOptions} defaultOptions The default workspace options
 *     to use.
 * @param {string=} vsEditorPath Optional editor path.
 * @return {Promise<PlaygroundAPI>} A promise to the playground API.
 */
export function createPlayground(container, createWorkspace,
    defaultOptions, vsEditorPath) {
  const {blocklyDiv, monacoDiv, guiContainer, tabButtons, tabsDiv} =
    renderPlayground(container);

  // Load the code editor.
  return addCodeEditor(monacoDiv, {
    value: '',
    language: 'xml',
    minimap: {
      enabled: false,
    },
    theme: 'vs-dark',
    scrollBeyondLastLine: false,
    automaticLayout: true,
  }, vsEditorPath).then((editor) => {
    let workspace;

    // TODO(samelh): Sync playground settings with localStorage.
    const playgroundSettings = {
      activeTab: 0,
      autoGenerate: true,
    };

    /**
     * Register a generator and create a new code tab for it.
     * @param {string} name The generator label.
     * @param {string} language The monaco language to use.
     * @param {Blockly.Generator} generator The Blockly generator.
     * @param {boolean=} isReadOnly Whether the editor should be set to
     *     read-only mode.
     * @return {{tab: !HTMLElement, update: function():void}} An object that
     *     contains the newly created tab element, and an update method.
     */
    function registerGenerator(name, language, generator, isReadOnly) {
      const tab = renderCodeTab(name);
      /**
       * Call the generator, displaying an error message if it fails.
       */
      function generate() {
        try {
          const code = generator(workspace);
          displayCode(editor, code, language, isReadOnly);
          isEditorXml.set(language == 'xml');
        } catch (e) {
          console.error(e);
          displayErrorMessage(editor, e.message);
        }
      }
      tab.addEventListener('click', () => {
        markActive(tab);
        updateEditor = generate;
        updateEditor();
      });
      tabsDiv.appendChild(tab);

      return {
        tab,
        generate,
      };
    }

    // Add tabs.
    const tabs = [
      registerGenerator('XML', 'xml', (ws) =>
        Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(ws))),
      registerGenerator('JavaScript', 'javascript',
          (ws) => BlocklyJS.workspaceToCode(ws), true),
      registerGenerator('Python', 'python',
          (ws) => BlocklyPython.workspaceToCode(ws), true),
      registerGenerator('Dart', 'javascript',
          (ws) => BlocklyDart.workspaceToCode(ws), true),
      registerGenerator('Lua', 'lua',
          (ws) => BlocklyLua.workspaceToCode(ws), true),
      registerGenerator('PHP', 'php',
          (ws) => BlocklyPHP.workspaceToCode(ws), true),
    ];
    const markActive = (tab) => {
      tabs.forEach((t) =>
        t.tab.style.background = (t.tab == tab) ? '#1E1E1E' : '#2D2D2D');
    };
    // Add tab buttons.
    const [autoGenerateButton, autoGenerateLabel] =
      renderCheckbox('autoGenerate', 'Auto');
    let autoGenerate = playgroundSettings.autoGenerate;
    autoGenerateButton.checked = autoGenerate;
    autoGenerateButton.addEventListener('change', (e) => {
      autoGenerate = !!e.target.checked;
      if (autoGenerate) {
        updateEditor();
      }
    });
    tabButtons.appendChild(autoGenerateButton);
    tabButtons.appendChild(autoGenerateLabel);

    // Mark the initial tab as active.
    const initialTab = tabs[playgroundSettings.activeTab];
    let updateEditor = initialTab.generate;
    markActive(initialTab.tab);

    // Add editor commands.
    const isEditorXml = editor.createContextKey('isEditorXml', true);
    editor.addAction({
      id: 'import-xml',
      label: 'Import',
      keybindings: [
        window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KEY_I,
      ],
      precondition: 'isEditorXml',
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: () => {
        const xml = editor.getModel().getValue();
        Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
      },
    });
    editor.addAction({
      id: 'export-xml',
      label: 'Export',
      keybindings: [
        window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KEY_S,
      ],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: updateEditor,
    });

    // Load the GUI controls.
    const gui = addGUIControls((options) => {
      workspace = createWorkspace(blocklyDiv, options);
      if (autoGenerate) {
        updateEditor();
      }
      workspace.addChangeListener((e) => {
        if (e.type !== 'ui') {
          if (autoGenerate) {
            updateEditor();
          }
        }
      });
      return workspace;
    }, defaultOptions);

    // Move the GUI Element to the gui container.
    const guiElement = gui.domElement;
    guiElement.removeChild(guiElement.firstChild);
    guiElement.style.position = 'relative';
    guiElement.style.minWidth = '100%';
    guiContainer.appendChild(guiElement);

    // Playground API.

    /**
     * Add a custom action to the list of playground actions.
     * @param {string} name The action label.
     * @param {function(!Blockly.Workspace):void} callback The callback to call
     *     when the action is clicked.
     * @param {string=} folderName Optional folder to place the action under.
     */
    const addAction = function(name, callback, folderName) {
      gui.addAction(name, (workspace) => {
        return () => {
          callback(workspace);
        };
      }, folderName);
    };

    /**
     * Add a generator tab.
     * @param {string} label The label of the generator tab.
     * @param {Blockly.Generator} generator The Blockly generator.
     * @param {string=} language Optional editor language, defaults to
     *     'javascript'.
     */
    const addGenerator = function(label, generator, language) {
      if (!label || !generator) {
        throw Error('usage: addGenerator(label, generator, language?);');
      }
      tabs.push(registerGenerator(label, language || 'javascript',
          (ws) => generator.workspaceToCode(ws), true));
    };

    return {
      addAction: addAction,
      addGenerator: addGenerator,
    };
  });
}
