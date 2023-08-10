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
        height: 1000,
        width: 1000,
      },
      absoluteMetrics: {
        left: 0,
        top: 0,
      },
      toolboxMetrics: {
        position: Blockly.TOOLBOX_AT_LEFT,
      },
    };

    this.options = {
      RTL: true,
      horizontalLayout: true,
      toolboxPosition: 'start',
      move: {scrollbars: true},
      scrollbar: {
        isVisible() {
          return true;
        },
        canScrollVertically() {
          return true;
        },
        canScrollHorizontally() {
          return true;
        },
      },
      getMetrics() {
        return {viewWidth: 100};
      },
    };
  });

  test('LTR Vertical Start', function() {
    this.options.RTL = false;
    this.options.horizontalLayout = false;
    this.options.toolboxPosition = 'start';
    this.mockMetrics.absoluteMetrics = {
      top: 0,
      left: 107,
    };
    this.mockMetrics.toolboxMetrics.position = Blockly.TOOLBOX_AT_LEFT;

    const minimap = new PositionedMinimap(this.options);
    minimap.position(this.mockMetrics, []);
    const position = minimap.getBoundingRectangle();

    assert.equal(position.top, 20, 'LTR Vertical Start: Incorrect top');
    assert.equal(position.left, 872, 'LTR Vertical Start: Incorrect left');
  });

  test('LTR Vertical End', function() {
    this.options.RTL = false;
    this.options.horizontalLayout = false;
    this.options.toolboxPosition = 'end';
    this.mockMetrics.absoluteMetrics = {
      top: 0,
      left: 0,
    };
    this.mockMetrics.toolboxMetrics.position = Blockly.TOOLBOX_AT_RIGHT;

    const minimap = new PositionedMinimap(this.options);
    minimap.position(this.mockMetrics, []);
    const position = minimap.getBoundingRectangle();

    assert.equal(position.top, 20, 'LTR Vertical End: Incorrect top');
    assert.equal(position.left, 20, 'LTR Vertical End: Incorrect left');
  });

  test('LTR Horizontal Start', function() {
    this.options.RTL = false;
    this.options.horizontalLayout = true;
    this.options.toolboxPosition = 'start';
    this.mockMetrics.absoluteMetrics = {
      top: 35,
      left: 0,
    };
    this.mockMetrics.toolboxMetrics.position = Blockly.TOOLBOX_AT_TOP;

    const minimap = new PositionedMinimap(this.options);
    minimap.position(this.mockMetrics, []);
    const position = minimap.getBoundingRectangle();

    assert.equal(position.top, 55, 'LTR Horizontal Start: Incorrect top');
    assert.equal(position.left, 765, 'LTR Horizontal Start: Incorrect left');
  });

  test('LTR Horizontal Start (no scrollbar)', function() {
    this.options.RTL = false;
    this.options.horizontalLayout = true;
    this.options.toolboxPosition = 'start';
    this.mockMetrics.absoluteMetrics = {
      top: 35,
      left: 0,
    };
    this.mockMetrics.toolboxMetrics.position = Blockly.TOOLBOX_AT_TOP;
    this.options.scrollbar = false;

    const minimap = new PositionedMinimap(this.options);
    minimap.position(this.mockMetrics, []);
    const position = minimap.getBoundingRectangle();

    assert.equal(position.top, 55, 'LTR Horizontal Start: Incorrect top');
    assert.equal(position.left, 780, 'LTR Horizontal Start: Incorrect left');
  });

  test('LTR Horizontal End', function() {
    this.options.RTL = false;
    this.options.horizontalLayout = true;
    this.options.toolboxPosition = 'end';
    this.mockMetrics.absoluteMetrics = {
      top: 0,
      left: 0,
    };
    this.mockMetrics.toolboxMetrics.position = Blockly.TOOLBOX_AT_BOTTOM;

    const minimap = new PositionedMinimap(this.options);
    minimap.position(this.mockMetrics, []);
    const position = minimap.getBoundingRectangle();

    assert.equal(parseInt(position.top), 831,
        'LTR Horizontal End: Incorrect top');
    assert.equal(position.left, 765, 'LTR Horizontal End: Incorrect left');
  });

  test('RTL Vertical Start', function() {
    this.options.RTL = true;
    this.options.horizontalLayout = false;
    this.options.toolboxPosition = 'start';
    this.mockMetrics.absoluteMetrics = {
      top: 0,
      left: 0,
    };
    this.mockMetrics.toolboxMetrics.position = Blockly.TOOLBOX_AT_RIGHT;

    const minimap = new PositionedMinimap(this.options);
    minimap.position(this.mockMetrics, []);
    const position = minimap.getBoundingRectangle();
    console.log(position);
    assert.equal(position.top, 20, 'RTL Vertical End: Incorrect top');
    assert.equal(position.left, 872, 'RTL Vertical End: Incorrect left');
  });
});

