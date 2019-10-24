<template>
  <div>

    <div id="blocklyDiv" txt1="test"></div>
  </div>
</template>

<script>
/**
 * @license
 *
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blockly Vue Component.
 * @author abbychau@gmail.com (Abby Chau)
 */

import Blockly from "blockly";
import Swal from "sweetalert2";

var renameVar = function(name) {
  return name;
};

Blockly.prompt = function(msg, defaultValue, callback) {
  Swal.fire({
    title: "Variable:",
    input: "text",
    inputAttributes: {
      autocapitalize: "off"
    },
    showCancelButton: true,
    confirmButtonText: "Look up",
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading()
  }).then(result => {
    if (result.value) {
      // console.log(result);
      callback(renameVar(result.value));
    }
  });
};

Blockly.Blocks["stock_buy_simple"] = {
  init: function() {
    this.appendValueInput("Number")
      .setCheck("Number")
      .appendField("Buy Stock ID")
      .appendField(new Blockly.FieldNumber(0), "ID")
      .appendField("For amount")
      .appendField(new Blockly.FieldNumber(0), "Amount")
      .appendField("At Price")
      .appendField(new Blockly.FieldNumber(0), "Price");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, "String");
    this.setColour(230);
    this.setTooltip("buy id");
    this.setHelpUrl("https://example.com");
  }
};
Blockly.JavaScript["stock_buy_simple"] = function(block) {
  var number_id = block.getFieldValue("ID");
  var number_amount = block.getFieldValue("Amount");
  var number_price = block.getFieldValue("Price");
  var value_number = Blockly.JavaScript.valueToCode(
    block,
    "Number",
    Blockly.JavaScript.ORDER_ATOMIC
  );
  var code = `buy(${number_id},${number_amount},${number_price},${value_number});\n`;
  return code;
};

Blockly.Blocks["stock_buy_prog"] = {
  init: function() {
    this.appendValueInput("Number")
      .setCheck("Number")
      .appendField("Buy Stock ID");
    this.appendValueInput("NAME")
      .setCheck("Number")
      .appendField("For amount");
    this.appendValueInput("NAME")
      .setCheck("Number")
      .appendField("At Price");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, "String");
    this.setColour(230);
    this.setTooltip("buy id");
    this.setHelpUrl("https://example.com");
  }
};
Blockly.JavaScript["stock_buy_prog"] = function(block) {
  var value_number = Blockly.JavaScript.valueToCode(
    block,
    "Number",
    Blockly.JavaScript.ORDER_ATOMIC
  );
  var value_name = Blockly.JavaScript.valueToCode(
    block,
    "NAME",
    Blockly.JavaScript.ORDER_ATOMIC
  );
  // TODO: Assemble JavaScript into code variable.
  var code = `buy(${value_number},${value_name},${value_name});\n`;
  return code;
};

Blockly.Blocks["stock_fetch_price"] = {
  init: function() {
    this.appendValueInput("Fetch")
      .setCheck("Number")
      .appendField("Fetch Price of Stock ID:");
    this.appendDummyInput()
      .appendField("And set to:")
      .appendField(new Blockly.FieldVariable("item"), "variable");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("fetch stock price");
    this.setHelpUrl("https://example.com");
  }
};

Blockly.JavaScript["stock_fetch_price"] = function(block) {
  var value_fetch = Blockly.JavaScript.valueToCode(
    block,
    "Fetch",
    Blockly.JavaScript.ORDER_ATOMIC
  );
  var variable_variable = Blockly.JavaScript.variableDB_.getName(
    block.getFieldValue("variable"),
    Blockly.Variables.NAME_TYPE
  );
  // TODO: Assemble JavaScript into code variable.
  var code = `fetch_price(${value_fetch},${variable_variable});\n`;
  return code;
};

export default {
  name: "BlocklyComponent",
  data() {
    return {
      workspace: null
    };
  },
  methods : {
    toCode() {
      Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
      return Blockly.JavaScript.workspaceToCode(this.workspace);
    }
  },
  mounted() {


    var xml = `<xml>
    <category name="Logic" colour="%{BKY_LOGIC_HUE}">
      <block type="controls_if"></block>
      <block type="logic_compare"></block>
      <block type="logic_operation"></block>
      <block type="logic_negate"></block>
      <block type="logic_boolean"></block>
    </category>
    <category name="Loops" colour="%{BKY_LOOPS_HUE}">
      <block type="controls_repeat_ext">
        <value name="TIMES">
          <block type="math_number">
            <field name="NUM">10</field>
          </block>
        </value>
      </block>
      <block type="controls_whileUntil"></block>
    </category>
    <category name="Math" colour="%{BKY_MATH_HUE}">
      <block type="math_number">
        <field name="NUM">123</field>
      </block>
      <block type="math_arithmetic"></block>
      <block type="math_single"></block>
    </category>
    <category name="Text" colour="%{BKY_TEXTS_HUE}">
      <block type="text"></block>
      <block type="text_length"></block>
      <block type="text_print"></block>
    </category>

    <category name="Variables" custom="VARIABLE" colour="%{BKY_VARIABLES_HUE}">
      </category>
    <category name="Stocks" colour="%{BKY_LOOPS_HUE}">
      <block type="stock_buy_simple"></block>
      <block type="stock_buy_prog"></block>
      <block type="stock_fetch_price"></block>
      
    </category>
    </xml>`;
    //console.log(xml)
    this.workspace = Blockly.inject(document.getElementById("blocklyDiv"), {
      toolbox: Blockly.Xml.textToDom(xml) //document.getElementById('toolbox')
    });
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#blocklyDiv {
  height: 100%;
  width: 100%;
  position: absolute;
  bottom: 0;
  text-align: left;
}
</style>
