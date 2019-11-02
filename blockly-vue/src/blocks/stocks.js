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
 * @fileoverview Define custom blocks.
 * @author abbychau@gmail.com (Abby Chau)
 */

// More on defining blocks:
// https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks


import * as Blockly from 'blockly/core';

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
  var code = `fetch_price(${value_fetch},${variable_variable});\n`;
  return code;
};
