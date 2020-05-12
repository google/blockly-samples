/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plus minus blocks' test playground.
 */

import * as Blockly from 'blockly';
import {addGUIControls, populateRandomButton} from '@blockly/dev-tools';
import '../src/index.js';

let workspace;

/**
 * Injects the workspace.
 */
function start() {
  const defaultOptions = {
    toolbox: document.getElementById('toolbox'),
  };
  addGUIControls((options) => {
    workspace = Blockly.inject('blocklyDiv', options);
    return workspace;
  }, defaultOptions);


  populateRandomButton(Blockly.getMainWorkspace,
      document.getElementById('toolsDiv'), 10);
}

document.addEventListener('DOMContentLoaded', start);


window.exportWorkspace = function() {
  const type = document.getElementById('export-type').value;
  if (sessionStorage) {
    sessionStorage.setItem('exportType', type);
  }
  const output = document.getElementById('importExport');
  let value;
  switch (type) {
    case 'clean-xml':
      value = Blockly.Xml.workspaceToDom(workspace);
      value = window.cleanXml(value);
      value = Blockly.Xml.domToPrettyText(value);
      break;
    case 'xml':
      value = Blockly.Xml.workspaceToDom(workspace);
      value = Blockly.Xml.domToPrettyText(value);
      break;
    default:
      output.value = Blockly[type].workspaceToCode(workspace);
      break;
  }
  output.value = value;
  window.textAreaChange();
};

window.cleanXml = function(xml) {
  const newXml = xml.cloneNode(true);
  let node = newXml;
  while (node) {
    // Things like text inside tags are still treated as nodes, but they
    // don't have attributes (or the removeAttribute function) so we can
    // skip removing attributes from them.
    if (node.removeAttribute) {
      node.removeAttribute('x');
      node.removeAttribute('y');
      node.removeAttribute('id');
    }

    // Try to go down the tree
    let nextNode = node.firstChild || node.nextSibling;
    // If we can't go down, try to go back up the tree.
    if (!nextNode) {
      nextNode = node.parentNode;
      while (nextNode) {
        // We are valid again!
        if (nextNode.nextSibling) {
          nextNode = nextNode.nextSibling;
          break;
        }
        // Try going up again. If parentNode is null that means we have
        // reached the top, and we will break out of both loops.
        nextNode = nextNode.parentNode;
      }
    }
    node = nextNode;
  }
  return newXml;
};

window.fromXml = function() {
  const input = document.getElementById('importExport');
  const xml = Blockly.Xml.textToDom(input.value);
  Blockly.Xml.domToWorkspace(xml, workspace);
  window.textAreaChange();
};

window.textAreaChange = function() {
  const textarea = document.getElementById('importExport');
  if (sessionStorage) {
    sessionStorage.setItem('textarea', textarea.value);
  }
  let valid = true;
  try {
    Blockly.Xml.textToDom(textarea.value);
  } catch (e) {
    valid = false;
  }
  document.getElementById('import').disabled = !valid;
};
