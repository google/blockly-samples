/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


const chai = require('chai');
const assert = chai.assert;
const {Minimap} = require('../src/minimap');


suite('Interactions Suite (Shape, Size, Location)', function() {
  suite('Square, Medium, Center', function() {
    setup(function() {
      this.primaryMetrics = {contentHeight: 1000, contentWidth: 1000,
        contentTop: -500, contentLeft: -500, viewWidth: 500, viewHeight: 500};
      this.minimapMetrics = {svgWidth: 500, svgHeight: 500,
        contentHeight: 500, contentWidth: 500};
    });

    test('Top left click', function() {
      const click = {x: 0, y: 0};
      const converted = Minimap.minimapToPrimaryCoords(
          this.primaryMetrics, this.minimapMetrics,
          click.x, click.y);

      assert.deepEqual(
          converted,
          [850, 750],
          'Incorrect top left click');
    });

    test('Center click', function() {
      const click = {
        x: this.minimapMetrics.svgWidth / 2,
        y: this.minimapMetrics.svgHeight / 2};
      const converted = Minimap.minimapToPrimaryCoords(
          this.primaryMetrics, this.minimapMetrics,
          click.x, click.y);

      assert.deepEqual(
          converted,
          [250, 250],
          'Incorrect center click');
    });

    test('Bottom right click', function() {
      const click = {
        x: this.minimapMetrics.svgWidth,
        y: this.minimapMetrics.svgHeight};
      const converted = Minimap.minimapToPrimaryCoords(
          this.primaryMetrics, this.minimapMetrics,
          click.x, click.y);

      assert.deepEqual(
          converted,
          [-250, -250],
          'Incorrect bottom right click');
    });
  });

  suite('Wide, Large, Top left', function() {
    setup(function() {
      this.primaryMetrics = {contentHeight: 500, contentWidth: 2000,
        contentTop: -1000, contentLeft: -2500, viewWidth: 500, viewHeight: 500};
      this.minimapMetrics = {svgWidth: 500, svgHeight: 500,
        contentHeight: 125, contentWidth: 500};
    });

    test('Top left click', function() {
      const click = {x: 0, y: 0};
      const converted = Minimap.minimapToPrimaryCoords(
          this.primaryMetrics, this.minimapMetrics,
          click.x, click.y);

      assert.deepEqual(
          converted,
          [2750, 2000],
          'Incorrect top left click');
    });

    test('Center click', function() {
      const click = {
        x: this.minimapMetrics.svgWidth / 2,
        y: this.minimapMetrics.svgHeight / 2};
      const converted = Minimap.minimapToPrimaryCoords(
          this.primaryMetrics, this.minimapMetrics,
          click.x, click.y);

      assert.deepEqual(
          converted,
          [1750, 1000],
          'Incorrect center click');
    });

    test('Bottom right click', function() {
      const click = {
        x: this.minimapMetrics.svgWidth,
        y: this.minimapMetrics.svgHeight};
      const converted = Minimap.minimapToPrimaryCoords(
          this.primaryMetrics, this.minimapMetrics,
          click.x, click.y);

      assert.deepEqual(
          converted,
          [750, 0],
          'Incorrect bottom right click');
    });
  });

  suite('Tall, Small, Bottom right', function() {
    setup(function() {
      this.primaryMetrics = {contentHeight: 2000, contentWidth: 500,
        contentTop: 500, contentLeft: 500, viewWidth: 500, viewHeight: 500};
      this.minimapMetrics = {svgWidth: 500, svgHeight: 500,
        contentHeight: 500, contentWidth: 125};
    });

    test('Top left click', function() {
      const click = {x: 0, y: 0};
      const converted = Minimap.minimapToPrimaryCoords(
          this.primaryMetrics, this.minimapMetrics,
          click.x, click.y);

      assert.deepEqual(
          converted,
          [500, -250],
          'Incorrect top left click');
    });

    test('Center click', function() {
      const click = {
        x: this.minimapMetrics.svgWidth / 2,
        y: this.minimapMetrics.svgHeight / 2};
      const converted = Minimap.minimapToPrimaryCoords(
          this.primaryMetrics, this.minimapMetrics,
          click.x, click.y);

      assert.deepEqual(
          converted,
          [-500, -1250],
          'Incorrect center click');
    });

    test('Bottom right click', function() {
      const click = {
        x: this.minimapMetrics.svgWidth,
        y: this.minimapMetrics.svgHeight};
      const converted = Minimap.minimapToPrimaryCoords(
          this.primaryMetrics, this.minimapMetrics,
          click.x, click.y);

      assert.deepEqual(
          converted,
          [-1500, -2250],
          'Incorrect bottom right click');
    });
  });
});
