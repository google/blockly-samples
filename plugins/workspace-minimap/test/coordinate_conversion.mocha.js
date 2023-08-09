/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


const chai = require('chai');
const assert = chai.assert;
const Blockly = require('blockly');
const {Minimap} = require('../src/minimap');
const {Backpack} = require('../../workspace-backpack/src/index');
const {PositionedMinimap} = require('../src/positioned_minimap');


suite('Converting click coordinates from minimap to primary workspace',
    function() {
      suite('Square, medium, and ceentered content', function() {
        setup(function() {
          this.primaryMetrics = {
            contentHeight: 1000, contentWidth: 1000,
            contentTop: -500, contentLeft: -500,
            viewWidth: 500, viewHeight: 500};
          this.minimapMetrics = {
            svgWidth: 500, svgHeight: 500,
            contentHeight: 500, contentWidth: 500};
        });

        test('Top left click', function() {
          const click = {x: 0, y: 0};
          const converted = Minimap.minimapToPrimaryCoords(
              this.primaryMetrics, this.minimapMetrics,
              click.x, click.y);

          assert.deepEqual(converted, [750, 750],
              'Incorrect top left click');
        });

        test('Center click', function() {
          const click = {
            x: this.minimapMetrics.svgWidth / 2,
            y: this.minimapMetrics.svgHeight / 2};
          const converted = Minimap.minimapToPrimaryCoords(
              this.primaryMetrics, this.minimapMetrics,
              click.x, click.y);

          assert.deepEqual(converted, [250, 250],
              'Incorrect center click');
        });

        test('Bottom right click', function() {
          const click = {
            x: this.minimapMetrics.svgWidth,
            y: this.minimapMetrics.svgHeight};
          const converted = Minimap.minimapToPrimaryCoords(
              this.primaryMetrics, this.minimapMetrics,
              click.x, click.y);

          assert.deepEqual(converted, [-250, -250],
              'Incorrect bottom right click');
        });
      });

      suite('Wide, large, and top left shifted content', function() {
        setup(function() {
          this.primaryMetrics = {
            contentHeight: 500, contentWidth: 2000,
            contentTop: -1000, contentLeft: -2500,
            viewWidth: 500, viewHeight: 500};
          this.minimapMetrics = {
            svgWidth: 500, svgHeight: 500,
            contentHeight: 125, contentWidth: 500};
        });

        test('Top left click', function() {
          const click = {x: 0, y: 0};
          const converted = Minimap.minimapToPrimaryCoords(
              this.primaryMetrics, this.minimapMetrics,
              click.x, click.y);

          assert.deepEqual(converted, [2750, 2000],
              'Incorrect top left click');
        });

        test('Center click', function() {
          const click = {
            x: this.minimapMetrics.svgWidth / 2,
            y: this.minimapMetrics.svgHeight / 2};
          const converted = Minimap.minimapToPrimaryCoords(
              this.primaryMetrics, this.minimapMetrics,
              click.x, click.y);

          assert.deepEqual(converted, [1750, 1000],
              'Incorrect center click');
        });

        test('Bottom right click', function() {
          const click = {
            x: this.minimapMetrics.svgWidth,
            y: this.minimapMetrics.svgHeight};
          const converted = Minimap.minimapToPrimaryCoords(
              this.primaryMetrics, this.minimapMetrics,
              click.x, click.y);

          assert.deepEqual(converted, [750, 0],
              'Incorrect bottom right click');
        });
      });

      suite('Tall, small, and bottom right shifted content', function() {
        setup(function() {
          this.primaryMetrics = {
            contentHeight: 2000, contentWidth: 500,
            contentTop: 500, contentLeft: 500,
            viewWidth: 500, viewHeight: 500};
          this.minimapMetrics = {svgWidth: 500, svgHeight: 500,
            contentHeight: 500, contentWidth: 125};
        });

        test('Top left click', function() {
          const click = {x: 0, y: 0};
          const converted = Minimap.minimapToPrimaryCoords(
              this.primaryMetrics, this.minimapMetrics,
              click.x, click.y);

          assert.deepEqual(converted, [500, -250],
              'Incorrect top left click');
        });

        test('Center click', function() {
          const click = {
            x: this.minimapMetrics.svgWidth / 2,
            y: this.minimapMetrics.svgHeight / 2};
          const converted = Minimap.minimapToPrimaryCoords(
              this.primaryMetrics, this.minimapMetrics,
              click.x, click.y);

          assert.deepEqual(converted, [-500, -1250],
              'Incorrect center click');
        });

        test('Bottom right click', function() {
          const click = {
            x: this.minimapMetrics.svgWidth,
            y: this.minimapMetrics.svgHeight};
          const converted = Minimap.minimapToPrimaryCoords(
              this.primaryMetrics, this.minimapMetrics,
              click.x, click.y);

          assert.deepEqual(converted, [-1500, -2250],
              'Incorrect bottom right click');
        });
      });
    });


// LTR-vert-start-backpack
// LTR-vert-start-!scrollbar
// LTR-vert-start
// LTR-vert-end
// LTR-hori-start
// LTR-hori-end
// RTL-vert-start
// RTL-vert-end
// RTL-hori-start
// RTL-hori-end

suite('Positioning the minimap in the primary workspace', function() {
  suite('LTR', function() {
    suite('Vertical', function() {
      test('LTR Vertical Start', function() {
        const options = new Blockly.Options({
          RTL: false,
          horizontalLayout: false,
          toolboxPosition: 'start',
        });
        const workspace = new Blockly.WorkspaceSvg(options);
        const minimap = new PositionedMinimap(workspace);
        minimap.init();

        const boundingRect = minimap.getBoundingRectangle();
        console.log(boundingRect);
        assert.deepEqual(boundingRect, 10, 'LTR Vertical Start - Incorrect');
      });

      test('LTR Vertical End', function() {
        const options = new Blockly.Options({
          RTL: false,
          horizontalLayout: false,
          toolboxPosition: 'end',
        });
        const workspace = new Blockly.WorkspaceSvg(options);
        const minimap = new PositionedMinimap(workspace);
        minimap.init();

        const boundingRect = minimap.getBoundingRectangle();
        console.log(boundingRect);
        assert.deepEqual(boundingRect, 10, 'LTR Vertical End - Incorrect');
      });

      test('LTR Vertical Start with Backpack', function() {
        const options = new Blockly.Options({
          RTL: false,
          horizontalLayout: false,
          toolboxPosition: 'start',
        });
        const workspace = new Blockly.WorkspaceSvg(options);
        const backpack = new Backpack(workspace);
        const minimap = new PositionedMinimap(workspace);
        backpack.init();
        minimap.init();

        const boundingRect = minimap.getBoundingRectangle();
        console.log(boundingRect);
        assert.deepEqual(boundingRect, 10, 'LTR Vertical Start bp - Incorrect');
      });

      test('LTR Vertical Start with no scrollbars', function() {
        const options = new Blockly.Options({
          RTL: false,
          horizontalLayout: false,
          toolboxPosition: 'start',
          move: {scrollbars: false},
        });
        const workspace = new Blockly.WorkspaceSvg(options);
        const minimap = new PositionedMinimap(workspace);
        minimap.init();

        const boundingRect = minimap.getBoundingRectangle();
        console.log(boundingRect);
        assert.deepEqual(boundingRect, 10, 'LTR Vertical Start ns - Incorrect');
      });
    });
  });
});
