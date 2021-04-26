/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Test playground for the nominal connection checker.
 */

import * as Blockly from 'blockly';
import {addCodeEditor} from '@blockly/dev-tools/src/playground/monaco';
import {LocalStorageState} from '@blockly/dev-tools/src/playground/state';
import {renderPlayground, renderCodeTab} from
  '@blockly/dev-tools/src/playground/ui.js';
import {pluginInfo as NominalConnectionCheckerPluginInfo} from '../src/index';

/**
 * @typedef {{
 *     state: !Object,
 *     tabElement: !HTMLElement,
 * }}
 */
let PlaygroundTab;

/**
 * Creates a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Object} typeHierarchy The type hierarchy.
 * @param {!Array<!Object>} blocks The array of json block definitions.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, typeHierarchy, blocks) {
  Blockly.defineBlocksWithJsonArray(blocks);
  const toolboxContents = [];
  blocks.forEach((def) => {
    toolboxContents.push({
      kind: 'BLOCK',
      type: def.type,
    });
  });
  const options = {
    plugins: {
      ...NominalConnectionCheckerPluginInfo,
    },
    toolbox: {
      'kind': Blockly.utils.toolbox.FLYOUT_TOOLBOX_KIND,
      'contents': toolboxContents,
    },
    move: {
      scrollbars: true,
      drag: true,
      wheel: true,
    },
    zoom: {
      wheel: true,
    },
  };

  const workspace = Blockly.inject(blocklyDiv, options);
  workspace.connectionChecker.init(typeHierarchy);

  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('root');
  const components = renderPlayground(container);
  const blocklyDiv = components.blocklyDiv;
  const monacoDiv = components.monacoDiv;
  const tabsDiv = components.tabsDiv;
  const guiContainer = components.guiContainer;

  // Hide the guiContainer since we don't need it for now.
  guiContainer.style.flex = '0';
  monacoDiv.parentElement.style.maxHeight = '100%';

  return addCodeEditor(monacoDiv, {
    minimap: {
      enabled: false,
    },
    theme: 'vs-dark',
    scrollBeyondLastLine: false,
    automaticLayout: true,
  }).then((editor) => {
    /**
     * Adds a new tab with the given name and language to the monaco editor.
     * @param {!string} name The display name for the tab.
     * @param {!string} language The language for the tab.
     * @return {!PlaygroundTab} The newly added tab.
     */
    function addCodeTab(name, language) {
      const tabElement = renderCodeTab(name);
      tabElement.setAttribute('data-tab', name);
      tabsDiv.appendChild(tabElement);

      const model = window.monaco.editor.createModel('', language);
      model.updateOptions({tabSize: 2});
      editor.setModel(model);

      const state = {
        name,
        model,
        language,
        viewState: undefined,
      };

      return {
        state,
        tabElement,
      };
    }

    /**
     * Sets the currently selected/active tab.
     * @param {!string} tab The name of the tab to select.
     */
    function setActiveTab(tab) {
      currentTab = tab;
      editor.setModel(currentTab.state.model);

      // Update tab UI.
      Object.values(tabs).forEach((t) =>
        t.tabElement.style.background =
              (t.tabElement == tab.tabElement) ? '#1E1E1E' : '#2D2D2D');
      // Update editor state.
      playgroundState.set('activeTab', tab.state.name);
      playgroundState.save();
    }

    // Selects the given tab when it is clicked.
    tabsDiv.addEventListener('click', (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      const tabName = target.getAttribute('data-tab');
      if (!tabName) {
        // Not a tab.
        return;
      }
      const tab = tabs[tabName];

      // Save current tab state (eg: scroll position).
      currentTab.state.viewState = editor.saveViewState();

      setActiveTab(tab);

      // Restore tab state (eg: scroll position).
      editor.restoreViewState(currentTab.state.viewState);
      editor.focus();
    });

    /**
     * Loads the saved data for the given tab and adds a change listener to it
     * that saves its state.
     * @param {!string} name The name of the tab to load.
     */
    function loadTab(name) {
      const model = tabs[name].state.model;
      model.setValue(playgroundState.get(name));
      model.onDidChangeContent(() => {
        playgroundState.set(name, model.getValue());
        playgroundState.save();
      });
    }

    /**
     * Loads the saved xml into the workspace.
     *
     * If the deserialization fails, it gives the user the option to clear the
     * saved xml. If the user chooses not to clear it then the user gets a
     * chance to fix whatever they messed up, and the next time they load the
     * page the same xml will be loaded again.
     *
     * @param {!Blockly.Workspace} workspace The workspace to load the xml into.
     */
    function loadXml(workspace) {
      let addListener = true;
      try {
        // Try to deserialize the saved xml.
        Blockly.Xml.domToWorkspace(
            Blockly.Xml.textToDom(playgroundState.get('workspaceXml')),
            workspace);
      } catch (e) {
        // Xml load failed, ask if they want to clear the workspace.
        console.error(e);
        const msg = `Xml load failed with error: ${e}
            Clear workspace and continue?`;
        if (confirm(msg)) {
          workspace.clear();
        } else {
          addListener = false;
        }
      } finally {
        // Add the change listener to save the workspace state.
        if (addListener) {
          workspace.addChangeListener(() => {
            const xml = Blockly.Xml.domToPrettyText(
                Blockly.Xml.workspaceToDom(workspace));
            playgroundState.set('workspaceXml', xml);
            playgroundState.save();
          });
        }
      }
    }

    const typesTabName = 'Type Hierarchy';
    const blocksTabName = 'Blocks';

    const tabs = {
      [typesTabName]: addCodeTab(typesTabName, 'json'),
      [blocksTabName]: addCodeTab(blocksTabName, 'json'),
    };

    const playgroundState = new LocalStorageState('playgroundState', {
      workspaceXml: '<xml></xml>',
      activeTab: typesTabName,
      [typesTabName]: '{\n  \n}',
      [blocksTabName]:
          '[\n' +
          '  {\n' +
          '    "type": "my_block_type"\n' +
          '  }\n' +
          ']',
    });
    playgroundState.load();

    loadTab(typesTabName);
    loadTab(blocksTabName);

    let currentTab = tabs[playgroundState.get('activeTab')];
    setActiveTab(currentTab);

    try {
      // Create the workspace.
      const workspace = createWorkspace(blocklyDiv,
          JSON.parse(tabs[typesTabName].state.model.getValue()),
          JSON.parse(tabs[blocksTabName].state.model.getValue()));
      loadXml(workspace);
    } catch (e) {
      // JSON parse failed, send an alert.
      alert(e);
    }
  });
});
