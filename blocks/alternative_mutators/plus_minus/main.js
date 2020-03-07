/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview
 */

let plusMinus = {};

function start() {
  parseArguments();
  workspace = Blockly.inject('blocklyDiv', options);
  restoreSessionStorage();

  workspace.addChangeListener(function(e) {
    console.log(e);
  })
}

document.addEventListener("DOMContentLoaded", function () { start() });

var options = {};

var workspace = null;


// Playground specific functions.
function parseArguments() {
  // RTL/LTR
  var match = location.search.match(/dir=([^&]+)/);
  var rtl = match && match[1] == 'rtl';
  document.forms.options.elements.dir.selectedIndex = Number(rtl);
  options.rtl = rtl;

  // Toolbox Position
  match = location.search.match(/side=([^&]+)/);
  var side = match ? match[1] : 'start';
  document.forms.options.elements.side.value = side;
  options.horizontalLayout = side == 'top' || side == 'bottom';
  options.toolboxPosition = side == 'top' || side == 'start' ? 'start' : 'end';

  // Toolbox
  options.toolbox = document.getElementById('toolbox');
}

function setAutoUpdate(doAutoUpdating) {
  var checkbox = document.getElementById('auto-update');
  checkbox.checked = doAutoUpdating;
  if (sessionStorage) {
    sessionStorage.setItem('doAutoUpdating', Number(doAutoUpdating));
  }

  var breakDiv = document.getElementById("break");
  var importButton = document.getElementById("import");
  var exportButton = document.getElementById("export");
  if (doAutoUpdating) {
    breakDiv.style.display = 'none';
    importButton.style.display = 'none';
    exportButton.style.display = 'none';

    workspace.addChangeListener(autoUpdater);
  } else {
    breakDiv.style.display = '';
    importButton.style.display = '';
    exportButton.style.display = '';

    workspace.removeChangeListener(autoUpdater);
  }
}

function autoUpdater(e) {
  exportWorkspace();
}

function exportWorkspace() {
  var type = document.getElementById('export-type').value;
  if (sessionStorage) {
    sessionStorage.setItem('exportType', type);
  }
  var output = document.getElementById('importExport');
  switch (type) {
    case 'clean-xml':
      var xml = Blockly.Xml.workspaceToDom(workspace);
      var xml = cleanXml(xml);
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

function restoreSessionStorage() {
  if (!sessionStorage) {
    return;
  }

  var text = sessionStorage.getItem('textarea');
  if (text) {
    document.getElementById('importExport').value = text;
  }

  var doAutoUpdating = sessionStorage.getItem('doAutoUpdating');
  if (doAutoUpdating != null) {
    setAutoUpdate(Boolean(Number(doAutoUpdating)));
  } else {
    setAutoUpdate(true);
  }

  var exportType = sessionStorage.getItem('exportType');
  if (exportType != null) {
    document.getElementById('export-type').value = exportType;
  }
}

