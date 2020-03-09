/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Example of using WorkspaceSearch with Blockly in Node (Common JS)
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

var Blockly = require('blockly');
var WorkspaceSearch = require('@blockly/plugin-workspace-search').WorkspaceSearch;

var xmlText = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="text_print" x="37" y="63">
  <value name="TEXT">
    <shadow type="text">
      <field name="TEXT">Hello from Blockly!</field>
    </shadow>
  </value>
</block>
</xml>`;

try {
  var xml = Blockly.Xml.textToDom(xmlText);

  // Create workspace and import the XML
  var workspace = new Blockly.Workspace();
  Blockly.Xml.domToWorkspace(xml, workspace);
  var wsSearch = new WorkspaceSearch(workspace);

  // Convert code and log output
  var code = Blockly.Python.workspaceToCode(workspace);
  console.log(code);
}
catch (e) {
  console.log(e);
}
