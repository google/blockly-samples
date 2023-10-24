/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Example "wait" block that will pause the interpreter for a
 * number of seconds. Because wait is a blocking behaviour, such blocks will
 * only work in interpreted environments.
 */

Blockly.defineBlocksWithJsonArray([{
  'type': 'wait_seconds',
  'message0': ' wait %1 seconds',
  'args0': [{
    'type': 'field_number',
    'name': 'SECONDS',
    'min': 0,
    'max': 600,
    'value': 1,
  }],
  'previousStatement': null,
  'nextStatement': null,
  'colour': '%{BKY_LOOPS_HUE}',
}]);

/**
 * Generator for wait block creates call to new method
 * <code>waitForSeconds()</code>.
 */
python.pythonGenerator.forBlock['wait_seconds'] = function(block) {
  const seconds = Number(block.getFieldValue('SECONDS'));
  const code = 'await waitForSeconds(' + seconds + ');\n';
  return code;
};

/**
 * Register the interpreter asynchronous function
 * <code>waitForSeconds()</code>.
 */
function initInterpreterWaitForSeconds(interpreter, globalObject) {
  // Ensure function name does not conflict with variable names.
  python.pythonGenerator.addReservedWords('waitForSeconds');

  const wrapper = interpreter.createAsyncFunction(
      function(timeInSeconds, callback) {
        // Delay the call to the callback.
        setTimeout(callback, timeInSeconds * 1000);
      });
  interpreter.setProperty(globalObject, 'waitForSeconds', wrapper);
}
