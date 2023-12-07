# @blockly/field-angle [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) angle field.

## Installation

### Yarn

```
yarn add @blockly/field-angle
```

### npm

```
npm install @blockly/field-angle --save
```

## Usage

This field accepts up to 9 parameters, in addition to the 4 accepted by the
[number field][number-field]:

- "value" to specify the default value of the angle field. Defaults to 0.
- "mode" to specify the basic setup of the angle field. Either Mode.COMPASS
  or Mode.PROTRACTOR. COMPASS specifies "clockwise" should be "true", and the
  "offset" should be "90". PROTRACTOR specifies that "clockwise" should be
  "false" and the "offset" should be 0. These settings can be overridden by
  the following options. Defaults to PROTRACTOR.
- "clockwise" to specify whether the value of the angle field should increase
  in the clockwise direction (if true) or in the counter-clockwise direction
  (if false). Defaults to false.
- "offset" to specify where the minimum/maximum displayed value of the angle
  field should be. The offset is in degree units that consider the circle to
  be 360 degrees. A 0 offset (or multiple of 360) specifies the right side of
  the circle as the minimum/maximum value. More positive values rotate
  clockwise and more negative values rotate counter clockwise (regardless of
  the "clockwise" setting). Defaults to 0.
- "displayMin" to specify the minimum displayed value of the angle field. The
  minimum displayed value may not actually be a selectable value. For example,
  you may have a full 0-360 degree circle ("displayMin" of 0), but only be
  able to select angle values from 90-270. Defaults to 0.
- "displayMax" to specify the maximum displayed value of the angle field. The
  maximum displayed value may not actually be a selectable value. For example,
  you may have a full 0-360 degree circle ("displayMax" of 360), but only be
  able to select angle values from 90-270. Defaults to 360.
- "minorTick" to specify the distance between small tick marks on the angle
  picker. The minorTick is in units from your displayMin-displayMax. The ticks
  start at your "min" rounded up to a multiple of your "minorTick". The
  ticks end at you "max" rounded down to a multiple of your "minorTick".
  Defaults to 15.
- "majorTick" to specify the distance between big tick marks on the angle
  picker. The majorTick is in units from your displayMin-displayMax. The ticks
  start at your "min" rounded up to a multiple of your "majorTick". The
  ticks end at you "max" rounded down to a multiple of your "majorTick".
  Defaults to 45.
- "symbol" to specify the unit symbol to append to your number. Defaults to °.

### JavaScript

```js
import * as Blockly from 'blockly';
import {FieldAngle} from '@blockly/field-angle';
Blockly.Blocks['test_field_angle'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('angle: ')
      .appendField(new FieldAngle(90), 'FIELDNAME');
  },
};
```

### JSON

```js
import * as Blockly from 'blockly';
import '@blockly/field-angle';
Blockly.defineBlocksWithJsonArray([
  {
    type: 'test_field_angle',
    message0: 'angle: %1',
    args0: [
      {
        type: 'field_angle',
        name: 'FIELDNAME',
        value: 50,
      },
    ],
  },
]);
```

## License

Apache 2.0

[number-field]: https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/number#creation
