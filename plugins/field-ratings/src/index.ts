/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Rating field.
 */

import * as Blockly from 'blockly';

/**
 * A rating field.
 */
export class FieldRatings extends Blockly.Field {
  // SVG elements.
  private ratingsGroup: SVGGElement;
  private stars: SVGPolygonElement[];

  // Field config properties.
  private maxRating: number;

  private starOuterRadius: number;
  private starInnerRadius: number;
  private starPadding: number;

  private starColour: string;
  private starColourSelect: string;
  private starColourHover: string;

  // Bound events.
  private boundEvents_: Blockly.EventData[];

  /**
   * Ratings field constructor.
   * @param {number=} optValue The initial rating.
   * @param {?Function=} optValidator  A function that is called to validate
   *    changes to the field's value. Takes in a value & returns a validated
   *    value, or null to abort the change.
   * @param {Object=} optConfig A map of options used to configure this field.
   * @constructor
   */
  constructor(optValue?: number, optValidator?: Function,
      optConfig?: {}) {
    super(optValue, optValidator, optConfig);

    this.boundEvents_ = [];
    this.stars = [];
  }

  /**
   * Process the configuration map passed to the field.
   * @param {!Object} config A map of options used to configure the field. See
   *    the individual field's documentation for a list of properties this
   *    parameter supports.
   */
  configure_(config: {}) {
    super.configure_(config);

    /**
     * Parse and validate a number input.
     * @param {number} num A number input.
     * @param {number} defaultValue If we're unable to parse the number, use
     *     this value instead.
     * @param {number} isInt Whether or not the resulting number should be an
     *     integer.
     * @return {number} The parsed number.
     */
    function validateNumber(num: number, defaultValue: number,
        isInt?: boolean): number {
      if (num == null) {
        return defaultValue;
      } else {
        const parsedNum = Number(num);
        if (!isNaN(parsedNum)) {
          return isInt ? Math.floor(parsedNum) : parsedNum;
        }
        return defaultValue;
      }
    }

    this.maxRating = validateNumber(config['maxRating'], 5, true);

    // Star shape.
    this.starOuterRadius = validateNumber(config['starSize'], 10, true);
    this.starInnerRadius = validateNumber(config['starInnerRadius'], 5, true);
    this.starPadding = validateNumber(config['starPadding'], 2, true);

    // Star style.
    this.starColour = config['starColour'] || '#eee';
    this.starColourSelect = config['starColourSelect'] || '#FFB422';
    this.starColourHover = config['starColourHover'] || this.starColourSelect;
  }

  /**
   * Constructs a FieldRatings from a JSON arg object.
   * @param {!Object} options A JSON object with options.
   * @return {!FieldRatings} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options): FieldRatings {
    return new FieldRatings(options['value'], undefined, options);
  }

  /**
   * Create the block UI for this field.
   */
  initView() {
    this.createRatings();
  }

  /**
   * Create the rating stars.
   */
  createRatings() {
    const starSize = this.starOuterRadius * 2;

    this.size_.height = starSize + this.starPadding * 2;
    this.size_.width =
      ((starSize + this.starPadding) * this.maxRating) + this.starPadding;

    this.ratingsGroup = Blockly.utils.dom.createSvgElement('g', {
      class: 'blocklyRatingsGroup',
    }, this.getSvgRoot()) as SVGGElement;

    Blockly.utils.dom.createSvgElement('rect', {
      class: 'blocklyRatingsRect',
      cursor: 'pointer',
      height: this.size_.height,
      width: this.size_.width,
    }, this.ratingsGroup) as SVGRectElement;

    for (let i = 0; i < this.maxRating; i++) {
      this.stars.push(this.createRatingStar(i));
    }

    const isReadOnly =
      (this.sourceBlock_.workspace.options as Blockly.BlocklyOptions).readOnly;
    if (isReadOnly) {
      return;
    }

    this.boundEvents_.push(
        Blockly.bindEvent_(this.ratingsGroup, 'mousemove', this,
            (e: MouseEvent) => {
              const bBox = this.ratingsGroup.getBoundingClientRect();
              const index =Math.floor((e.clientX - bBox.left) /
                  bBox.width * this.maxRating);
              this.updateStars(index + 1, true);
            }));

    this.boundEvents_.push(
        Blockly.bindEvent_(this.ratingsGroup, 'mouseout', this, () => {
          this.updateStars(this.getValue());
        }));

    this.boundEvents_.push(
        Blockly.bindEvent_(this.ratingsGroup, 'click', this,
            (e: MouseEvent) => {
              const bBox = this.ratingsGroup.getBoundingClientRect();
              const index = Math.floor((e.clientX - bBox.left) /
                  bBox.width * this.maxRating);
              if (index != null) {
                this.setValue(index + 1);
              }
            }));
  }

  /**
   * Create a rating star.
   * @param {number} index The index of the star in the list.
   * @return {SVGPolygonElement} The resulting star SVG.
   */
  createRatingStar(index): SVGPolygonElement {
    const innerRadius = this.starInnerRadius;
    const outerRadius = this.starOuterRadius;

    const center = Math.max(innerRadius, outerRadius);
    const angle = Math.PI / 5;
    const points = [];

    for (let i = 0; i < 10; i++) {
      const radius = i & 1 ? innerRadius : outerRadius;
      points.push(center + radius * Math.sin(i * angle));
      points.push(center - radius * Math.cos(i * angle));
    }

    const starSize = this.starOuterRadius * 2;
    const transform = `translate(${this.starPadding + index *
        (starSize + this.starPadding)}, ${this.starPadding})`;
    const star = Blockly.utils.dom.createSvgElement('polygon', {
      class: 'blocklyRatingsStar',
      style: `fill: ${this.starColour}`,
      transform,
      points,
    }, this.ratingsGroup) as SVGPolygonElement;

    return star;
  }

  /**
   * Update all stars fill and class properties.
   * @param {number} value The number of stars to fill.
   * @param {boolean=} isHover Whether or not we are currently hovering over the
   *     stars.
   */
  updateStars(value: number, isHover?: boolean) {
    for (let i = 0; i < this.maxRating; i++) {
      const star = this.stars[i];
      if (i < value) {
        star.style.fill = isHover ? this.starColourHover :
          this.starColourSelect;
        Blockly.utils.dom.addClass(star, 'blocklyStarSelected');
        if (isHover) {
          Blockly.utils.dom.addClass(star, 'blocklyStarHover');
        }
      } else {
        Blockly.utils.dom.removeClass(star, 'blocklyStarHover');
        Blockly.utils.dom.removeClass(star, 'blocklyStarSelected');
        star.style.fill = this.starColour;
      }
    }
  }

  /**
   * Re-render the stars after the value has been updated.
   */
  render_() {
    this.updateStars(this.getValue());
  }

  /**
   * Safely dispose of this field.
   */
  dispose() {
    this.boundEvents_.forEach((e) => Blockly.unbindEvent_(e));
  }
}

Blockly.Css.register([`
  .blocklyRatingsRect {
    fill: transparent;
  }
  .blocklyRatingsStar {
    pointer-events: none;
  }
  .blocklyRatingsStar.blocklyStarSelected {
    stroke: white;
  }
  .blocklyRatingsStar.blocklyStarHover {
  }
`]);

Blockly.fieldRegistry.register('field_ratings', FieldRatings);
