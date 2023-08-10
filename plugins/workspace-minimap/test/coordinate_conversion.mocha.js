/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


const chai = require('chai');
const assert = chai.assert;
const Blockly = require('blockly');
const {Minimap} = require('../src/minimap');
// const {Backpack} = require('../../workspace-backpack/src/index');
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
  setup(function() {
    this.mockMetrics = {
      viewMetrics: {
        height: 750,
        width: 750,
      },
      absoluteMetrics: {
        left: 107,
        top: 0,
      },
      toolboxMetrics: {
        position: Blockly.TOOLBOX_AT_LEFT,
      },
    };
  });

  test('LTR Vertical Start', function() {
    const options = {
      RTL: false,
      horizontalLayout: false,
      toolboxPosition: 'start',
      move: {scrollbars: true},
    };
    console.log('here 1');
    const ws = new Blockly.WorkspaceSvg(new Blockly.Options(options));

    console.log('here 2');
    const minimap = new PositionedMinimap(ws);
    minimap.init();

    console.log('here 3');
    minimap.position(this.mockMetrics, []);
    const boundingRect = minimap.getBoundingRectangle();

    console.log(boundingRect);
    assert.deepEqual(boundingRect, 10, 'LTR Vertical Start - Incorrect');
  });

  test('LTR Vertical End', function() {

  });

  test('LTR Vertical Start with Backpack', function() {

  });

  test('LTR Vertical Start with no scrollbars', function() {

  });
});

