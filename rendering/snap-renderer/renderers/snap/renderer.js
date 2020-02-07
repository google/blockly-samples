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
 * The SNAP renderer.
 * @param {string} name The renderer name.
 * @package
 * @constructor
 * @extends {Blockly.zelos.Renderer}
 */
Blockly.snap.Renderer = function (name) {
  Blockly.snap.Renderer.superClass_.constructor.call(this, name);
};
Blockly.utils.object.inherits(Blockly.snap.Renderer,
  Blockly.zelos.Renderer);

/**
 * Create a new instance of the renderer's constant provider.
 * @return {!Blockly.zelos.ConstantProvider} The constant provider.
 * @protected
 * @override
 */
Blockly.snap.Renderer.prototype.makeConstants_ = function() {
  return new Blockly.snap.ConstantProvider();
};

/**
 * Create a new instance of a renderer path object.
 * @param {!SVGElement} root The root SVG element.
 * @param {!Blockly.Theme.BlockStyle} style The style object to use for
 *     colouring.
 * @return {!Blockly.snap.PathObject} The renderer path object.
 * @package
 * @override
 */
Blockly.snap.Renderer.prototype.makePathObject = function(root, style) {
  return new Blockly.snap.PathObject(root, style,
      /** @type {!Blockly.zelos.ConstantProvider} */ (this.getConstants()));
};

/**
 * Create a new instance of the renderer's drawer.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.blockRendering.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @return {!Blockly.snap.Drawer} The drawer.
 * @protected
 * @override
 */
Blockly.snap.Renderer.prototype.makeDrawer_ = function(block, info) {
  return new Blockly.snap.Drawer(block,
      /** @type {!Blockly.zelos.RenderInfo} */ (info));
};

Blockly.blockRendering.register('snap', Blockly.snap.Renderer);
