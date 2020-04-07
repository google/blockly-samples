/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plus minus blocks' test playground.
 */

import Blockly from 'blockly';
import '../src/index.js';

let workspace;

function start() {
  workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
  });
}

document.addEventListener("DOMContentLoaded", start);

function exportWorkspace() {
  var type = document.getElementById('export-type').value;
  if (sessionStorage) {
    sessionStorage.setItem('exportType', type);
  }
  var output = document.getElementById('importExport');
  switch (type) {
    case 'clean-xml':
      var xml = Blockly.Xml.workspaceToDom(workspace);
      xml = cleanXml(xml);
      output.value = Blockly.Xml.domToPrettyText(xml);
      break;
    case 'xml':
      var xml = Blockly.Xml.workspaceToDom(workspace);
      output.value = Blockly.Xml.domToPrettyText(xml);
      break;
    default:
      output.value = Blockly[type].workspaceToCode(workspace);
      break;
  }
  textAreaChange();
}

function cleanXml(xml) {
  var newXml = xml.cloneNode(true);
  var node = newXml;
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
    var nextNode = node.firstChild || node.nextSibling;
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
}

function fromXml() {
  var input = document.getElementById('importExport');
  var xml = Blockly.Xml.textToDom(input.value);
  Blockly.Xml.domToWorkspace(xml, workspace);
  textAreaChange();
}

function textAreaChange() {
  var textarea = document.getElementById('importExport');
  if (sessionStorage) {
    sessionStorage.setItem('textarea', textarea.value);
  }
  var valid = true;
  try {
    Blockly.Xml.textToDom(textarea.value);
  } catch (e) {
    valid = false;
  }
  document.getElementById('import').disabled = !valid;
}
