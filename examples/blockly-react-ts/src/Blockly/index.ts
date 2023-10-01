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
 * @fileoverview XML wrappers for block, category, value, field and shadow.
 * @author samelh@google.com (Sam El-Husseini)
 */

import React, { HTMLAttributes } from "react";

import BlocklyComponent from "./BlocklyComponent";

export default BlocklyComponent;

type BlocklyProps = HTMLAttributes<HTMLDivElement> & {
  type?: string;
  name?: string;
  disabled?: string;
};

const Block = (p: BlocklyProps) => {
  const { children, ...props } = p;
  props.is = "blockly";
  return React.createElement("block", props, children);
};

const Category = (p: BlocklyProps) => {
  const { children, ...props } = p;
  props.is = "blockly";
  return React.createElement("category", props, children);
};

const Value = (p: BlocklyProps) => {
  const { children, ...props } = p;
  props.is = "blockly";
  return React.createElement("value", props, children);
};

const Field = (p: BlocklyProps) => {
  const { children, ...props } = p;
  props.is = "blockly";
  return React.createElement("field", props, children);
};

const Shadow = (p: BlocklyProps) => {
  const { children, ...props } = p;
  props.is = "blockly";
  return React.createElement("shadow", props, children);
};

export { Block, Category, Value, Field, Shadow };
