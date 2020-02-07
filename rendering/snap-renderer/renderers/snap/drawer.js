/**
 * @license
 * Copyright 2020 Google LLC
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
 * @fileoverview SNAP renderer.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

/**
 * An object that draws a block based on the given rendering information.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.zelos.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @package
 * @constructor
 * @extends {Blockly.zelos.Drawer}
 */
Blockly.snap.Drawer = function(block, info) {
  Blockly.snap.Drawer.superClass_.constructor.call(this, block, info);
};
Blockly.utils.object.inherits(Blockly.snap.Drawer,
    Blockly.zelos.Drawer);


/**
 * @override
 */
Blockly.snap.Drawer.prototype.positionInlineInputConnection_ = function(input) {
  var inputName = input.input.name;
  var yPos = input.centerline - input.height / 2;
  // Move the connection.
  if (input.connectionModel) {
    // xPos already contains info about startX
    var connX = input.xPos + input.connectionWidth + input.connectionOffsetX;
    if (this.info_.RTL) {
      connX *= -1;
    }
    input.connectionModel.setOffsetInBlock(connX,
        yPos + input.connectionOffsetY);
    this.block_.pathObject.setOutlineDimensions(inputName, connX, yPos,
        input.width, input.height);
  }
};
