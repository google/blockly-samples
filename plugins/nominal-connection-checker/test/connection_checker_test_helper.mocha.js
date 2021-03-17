/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Helpers for tests of the NominalConnectionChecker.
 */


const Blockly = require('blockly/node');

/**
 * Returns an array of JSON block definitions based on the given types. This
 * creates nine blocks for each type, each representing a different
 * configuration of connections.
 * @param {!Array<string>} types The types to create blocks for.
 * @return {!Array<!Object>} Blockly block definitions.
 */
export function createBlockDefs(types) {
  const blocks = [];
  for (const type of types) {
    blocks.push({
      'type': 'static_' + type + '_outer_value',
      'message0': '%1',
      'args0': [
        {
          'type': 'input_value',
          'name': 'INPUT1',
          'check': [type],
        },
      ],
      'mutator': 'bind_type_mutator',
    });
    blocks.push({
      'type': 'static_' + type + '_outer_statement',
      'message0': '%1',
      'args0': [
        {
          'type': 'input_statement',
          'name': 'INPUT1',
          'check': [type],
        },
      ],
      'mutator': 'bind_type_mutator',
    });
    blocks.push({
      'type': 'static_' + type + '_outer_next',
      'message0': '',
      'nextStatement': [type],
      'mutator': 'bind_type_mutator',
    });

    blocks.push({
      'type': 'static_' + type + '_inner_out',
      'message0': '',
      'output': [type],
      'mutator': 'bind_type_mutator',
    });
    blocks.push({
      'type': 'static_' + type + '_inner_prev',
      'message0': '',
      'previousStatement': [type],
      'mutator': 'bind_type_mutator',
    });

    blocks.push({
      'type': 'static_' + type + '_main_out_value',
      'message0': '%1 %2 %3',
      'args0': [
        {
          'type': 'input_value',
          'name': 'INPUT1',
          'check': [type],
        },
        {
          'type': 'input_value',
          'name': 'INPUT2',
          'check': [type],
        },
        {
          'type': 'input_value',
          'name': 'INPUT3',
          'check': [type],
        },
      ],
      'output': [type],
      'mutator': 'bind_type_mutator',
    });
    blocks.push({
      'type': 'static_' + type + '_main_out_statement',
      'message0': '%1 %2 %3',
      'args0': [
        {
          'type': 'input_statement',
          'name': 'INPUT1',
          'check': [type],
        },
        {
          'type': 'input_statement',
          'name': 'INPUT2',
          'check': [type],
        },
        {
          'type': 'input_statement',
          'name': 'INPUT3',
          'check': [type],
        },
      ],
      'output': [type],
      'mutator': 'bind_type_mutator',
    });
    blocks.push({
      'type': 'static_' + type + '_main_out_next',
      'message0': '',
      'output': [type],
      'nextStatement': [type],
      'mutator': 'bind_type_mutator',
    });
    blocks.push({
      'type': 'static_' + type + '_main_prev_value',
      'message0': '%1 %2 %3',
      'args0': [
        {
          'type': 'input_value',
          'name': 'INPUT1',
          'check': [type],
        },
        {
          'type': 'input_value',
          'name': 'INPUT2',
          'check': [type],
        },
        {
          'type': 'input_value',
          'name': 'INPUT3',
          'check': [type],
        },
      ],
      'previousStatement': [type],
      'mutator': 'bind_type_mutator',
    });
    blocks.push({
      'type': 'static_' + type + '_main_prev_statement',
      'message0': '%1 %2 %3',
      'args0': [
        {
          'type': 'input_statement',
          'name': 'INPUT1',
          'check': [type],
        },
        {
          'type': 'input_statement',
          'name': 'INPUT2',
          'check': [type],
        },
        {
          'type': 'input_statement',
          'name': 'INPUT3',
          'check': [type],
        },
      ],
      'previousStatement': [type],
      'mutator': 'bind_type_mutator',
    });
    blocks.push({
      'type': 'static_' + type + '_main_prev_next',
      'message0': '',
      'previousStatement': [type],
      'nextStatement': [type],
      'mutator': 'bind_type_mutator',
    });
  }
  return blocks;
}


const twoBlockTests = [];

/**
 * Creates a two block test. Two block tests have the .getOuterInput and
 * .getInnerOutput functions available. They are run through 3 suites comprising
 * all of the possible valid combinations of input and output connections.
 * @param {string} name The name for the test.
 * @param {function()} fn The test function to run.
 */
export function twoBlockTest(name, fn) {
  twoBlockTests.push({name: name, fn: fn, skip: false});
}

/**
 * Creates a skipped two block test. Skipped tests are not run, but they are
 * listed as pending in test output.
 * @param {string} name The name of the test.
 * @param {function()} fn The test function.
 */
twoBlockTest.skip = function(name, fn) {
  twoBlockTests.push({name: name, fn: fn, skip: true});
};

/**
 * Clears all of the two block tests that are in the array to be run. Should be
 * called before starting a new suite of two block tests.
 */
export function clearTwoBlockTests() {
  twoBlockTests.length = 0;
}

/**
 * Runs all of the two block tests in the array of tests to be run. Should be
 * called at the end of a suite of two block tests.
 */
export function runTwoBlockTests() {
  /**
   * Creates a function which creates a new block and returns its next
   * connection or first input connection.
   * @param {string} suffix The suffix for the block type.
   * @return {function(string, string=): !Blockly.Connection} A function that
   *     takes in a type name and returns next connection or input connection.
   */
  function createGetOuterInput(suffix) {
    return function(type, name) {
      const block = this.workspace.newBlock('static_' + type + suffix);
      const inConn = block.nextConnection ||
          block.getInput('INPUT1').connection;
      inConn.name = name || type + 'In';
      return inConn;
    };
  }

  /**
   * Creates a function which creates a new block and returns its output
   * connection or previous connection.
   * @param {string} suffix The suffix for the block type.
   * @return {function(string, string=): !Blockly.Connection} A function that
   *     takes in a type name and returns an output connection or
   *     previous connection.
   */
  function createGetInnerOutput(suffix) {
    return function(type, name) {
      const block = this.workspace.newBlock('static_' + type + suffix);
      const outConn = block.outputConnection || block.previousConnection;
      outConn.name = name || type + 'Out';
      return outConn;
    };
  }

  suite('Outer value, inner out', function() {
    setup(function() {
      this.getOuterInput = createGetOuterInput('_outer_value');
      this.getInnerOutput = createGetInnerOutput('_inner_out');
    });

    runTests(twoBlockTests);
  });

  suite('Outer statement, inner prev', function() {
    setup(function() {
      this.getOuterInput = createGetOuterInput('_outer_statement');
      this.getInnerOutput = createGetInnerOutput('_inner_prev');
    });

    runTests(twoBlockTests);
  });

  suite('Outer next, inner prev', function() {
    setup(function() {
      this.getOuterInput = createGetOuterInput('_outer_next');
      this.getInnerOutput = createGetInnerOutput('_inner_prev');
    });

    runTests(twoBlockTests);
  });
}


const threeBlockTests = [];

/**
 * Creates a three block test. Three block tests have the .getOuterInput
 * .getMain and .getInnerOutput functions available. They are run through 9
 * suites comprising all of the possible valid combinations of input and output
 * connections for three blocks.
 * @param {string} name The name for the test.
 * @param {function()} fn The test function to run.
 */
export function threeBlockTest(name, fn) {
  threeBlockTests.push({name: name, fn: fn});
}

/**
 * Creates a skipped three block test. Skipped tests are not run, but they are
 * listed as pending in test output.
 * @param {string} name The name of the test.
 * @param {function()} fn The test function.
 */
threeBlockTest.skip = function(name, fn) {
  threeBlockTests.push({name: name, fn: fn, skip: true});
};

/**
 * Clears all of the three block tests that are in the array to be run. Should
 * be called before starting a new suite of three block tests.
 */
export function clearThreeBlockTests() {
  threeBlockTests.length = 0;
}

/**
 * Runs all of the three block tests in the array of tests to be run. Should be
 * called at the end of a suite of three block tests.
 */
export function runThreeBlockTests() {
  /**
   * Creates a function which creates a new block and returns its next
   * connection or first input connection.
   * @param {string} suffix The suffix for the block type.
   * @return {function(string, string=): !Blockly.Connection} A function that
   *     takes in a type name and returns a next connection or input connection.
   */
  function createGetOuterInput(suffix) {
    return function(type, name) {
      const block = this.workspace.newBlock('static_' + type + suffix);
      const inConn = block.nextConnection ||
          block.getInput('INPUT1').connection;
      inConn.name = name || type + 'In';
      return inConn;
    };
  }

  /**
   * Creates a function which creates a new block and returns an object
   * containing its next/input and previous/output connections.
   * of a main block.
   * @param {string} suffix The suffix for the block type.
   * @return {function(string, string=):
   *     {in: !Blockly.Connection, out: !Blockly.Connection}} A function that
   *     takes in a type name and returns an object containing next/input
   *     connections and previous/output connections.
   */
  function createGetMain(suffix) {
    return function(type, name) {
      const prefix = name || type;

      const block = this.workspace.newBlock('static_' + type + suffix);
      const outConn = block.outputConnection || block.previousConnection;
      outConn.name = prefix + '.out';
      const inConn = block.nextConnection ||
          block.getInput('INPUT1').connection;
      inConn.name = prefix + '.in';
      return {
        out: outConn,
        in: inConn,
      };
    };
  }

  /**
   * Creates a function which creates a new block returns its output or previous
   * connection.
   * @param {string} suffix The suffix for the block type.
   * @return {function(string, string=): !Blockly.Connection} A function that
   *     takes in a type name and returns an output/previous connection.
   */
  function createGetInnerOutput(suffix) {
    return function(type, name) {
      const block = this.workspace.newBlock('static_' + type + suffix);
      const outConn = block.outputConnection || block.previousConnection;
      outConn.name = name || type + 'Out';
      return outConn;
    };
  }

  suite('Outer value, main value, inner out', function() {
    setup(function() {
      this.getOuterInput = createGetOuterInput('_outer_value');
      this.getMain = createGetMain('_main_out_value');
      this.getInnerOutput = createGetInnerOutput('_inner_out');
    });

    runTests(threeBlockTests);
  });

  suite('Outer value, main statement, inner prev', function() {
    setup(function() {
      this.getOuterInput = createGetOuterInput('_outer_value');
      this.getMain = createGetMain('_main_out_statement');
      this.getInnerOutput = createGetInnerOutput('_inner_prev');
    });

    runTests(threeBlockTests);
  });

  suite('Outer value, main next, inner prev', function() {
    setup(function() {
      this.getOuterInput = createGetOuterInput('_outer_value');
      this.getMain = createGetMain('_main_out_next');
      this.getInnerOutput = createGetInnerOutput('_inner_prev');
    });

    runTests(threeBlockTests);
  });

  suite('Outer statement, main input, inner out', function() {
    setup(function() {
      this.getOuterInput = createGetOuterInput('_outer_statement');
      this.getMain = createGetMain('_main_prev_value');
      this.getInnerOutput = createGetInnerOutput('_inner_out');
    });

    runTests(threeBlockTests);
  });

  suite('Outer statement, main statement, inner prev', function() {
    setup(function() {
      this.getOuterInput = createGetOuterInput('_outer_statement');
      this.getMain = createGetMain('_main_prev_statement');
      this.getInnerOutput = createGetInnerOutput('_inner_prev');
    });

    runTests(threeBlockTests);
  });

  suite('Outer statement, main next, inner prev', function() {
    setup(function() {
      this.getOuterInput = createGetOuterInput('_outer_statement');
      this.getMain = createGetMain('_main_prev_next');
      this.getInnerOutput = createGetInnerOutput('_inner_prev');
    });

    runTests(threeBlockTests);
  });

  suite('Outer next, main input, inner out', function() {
    setup(function() {
      this.getOuterInput = createGetOuterInput('_outer_next');
      this.getMain = createGetMain('_main_prev_value');
      this.getInnerOutput = createGetInnerOutput('_inner_out');
    });

    runTests(threeBlockTests);
  });

  suite('Outer next, main statement, inner prev', function() {
    setup(function() {
      this.getOuterInput = createGetOuterInput('_outer_next');
      this.getMain = createGetMain('_main_prev_statement');
      this.getInnerOutput = createGetInnerOutput('_inner_prev');
    });

    runTests(threeBlockTests);
  });

  suite('Outer next, main next, inner prev', function() {
    setup(function() {
      this.getOuterInput = createGetOuterInput('_outer_next');
      this.getMain = createGetMain('_main_prev_next');
      this.getInnerOutput = createGetInnerOutput('_inner_prev');
    });

    runTests(threeBlockTests);
  });
}


const siblingTests = [];

/**
 * Creates a sibbling test. Sibling tests have the .getOuterInput
 * .getMain and .getInnerOutput functions available. They are run through 3
 * suites comprising all combinations of connections where the main block
 * has multiple inputs. This means that there are no tests where the main block
 * has a next connection as its input connection.
 * @param {string} name The name for the test.
 * @param {function()} fn The test function to run.
 */
export function siblingTest(name, fn) {
  siblingTests.push({name: name, fn: fn});
}

/**
 * Creates a skipped sibling test. Skipped tests are not run, but they are
 * listed as pending in test output.
 * @param {string} name The name of the test.
 * @param {function()} fn The test function.
 */
siblingTest.skip = function(name, fn) {
  siblingTests.push({name: name, fn: fn, skip: true});
};

/**
 * Clears all of the sibling tests that are in the array to be run. Should
 * be called before starting a new suite of sibling tests.
 */
export function clearSiblingTests() {
  siblingTests.length = 0;
}

/**
 * Runs all of the sibling tests in the array of tests to be run. Should be
 * called at the end of a suite of sibling tests.
 */
export function runSiblingTests() {
  /**
   * Creates a function which creates a block and returns its next connection or
   * first input connection.
   * @param {string} suffix The suffix for the block type.
   * @return {function(string, string=): !Blockly.Connection} A function that
   *     takes in a type name and returns an input connection.
   */
  function createGetOuterInput(suffix) {
    return function(type, name) {
      const block = this.workspace.newBlock('static_' + type + suffix);
      const inConn = block.nextConnection ||
          block.getInput('INPUT1').connection;
      inConn.name = name || type + 'In';
      return inConn;
    };
  }

  /**
   * Creates a function which creates a block and returns an object containing
   * the its three input connections, and its output/previous connection.
   * @param {string} suffix The suffix for the block type.
   * @return {function(string, string=):{
   *     out: !Blockly.Connection,
   *     in1: !Blockly.Connection,
   *     in2: !Blockly.Connection,
   *     in3: !Blockly.Connection}
   *     } A function that takes in a type name and
   *     returns an object containing input and output connections.
   */
  function createGetMain(suffix) {
    return function(type, name) {
      const prefix = name || type;
      const block = this.workspace.newBlock('static_' + type + suffix);
      const outConn = block.outputConnection || block.previousConnection;
      outConn.name = prefix + '.out';
      const inConn1 = block.getInput('INPUT1').connection;
      inConn1.name = prefix + '.in1';
      const inConn2 = block.getInput('INPUT2').connection;
      inConn2.name = prefix + '.in2';
      const inConn3 = block.getInput('INPUT3').connection;
      inConn3.name = prefix + '.in3';
      return {
        out: outConn,
        in1: inConn1,
        in2: inConn2,
        in3: inConn3,
      };
    };
  }

  /**
   * Creates a function which creates a block and returns its output/previous
   * connection.
   * @param {string} suffix The suffix for the block type.
   * @return {function(string, string=): !Blockly.Connection} A function that
   *     takes in a type name and returns an output connection.
   */
  function createGetInnerOutput(suffix) {
    return function(type, name) {
      const block = this.workspace.newBlock('static_' + type + suffix);
      const outConn = block.outputConnection || block.previousConnection;
      outConn.name = name || type + 'Out';
      return outConn;
    };
  }

  suite('Outer value, main value, inner out', function() {
    setup(function() {
      this.getOuterInput = createGetOuterInput('_outer_value');
      this.getMain = createGetMain('_main_out_value');
      this.getInnerOutput = createGetInnerOutput('_inner_out');
    });

    runTests(siblingTests);
  });

  suite('Outer statement, main statement, inner prev', function() {
    setup(function() {
      this.getOuterInput = createGetOuterInput('_outer_statement');
      this.getMain = createGetMain('_main_prev_statement');
      this.getInnerOutput = createGetInnerOutput('_inner_prev');
    });

    runTests(siblingTests);
  });

  suite('Outer next, main statement, inner prev', function() {
    setup(function() {
      this.getOuterInput = createGetOuterInput('_outer_next');
      this.getMain = createGetMain('_main_prev_statement');
      this.getInnerOutput = createGetInnerOutput('_inner_prev');
    });

    runTests(siblingTests);
  });
}


/**
 * Runs a suite of tests.
 * @param {!Array<{name: string, fn: function, skip: boolean}>} tests The tests
 *     to run.
 */
function runTests(tests) {
  for (const {name, fn, skip} of tests) {
    if (skip) {
      test.skip(name, fn);
    } else {
      test(name, fn);
    }
  }
}


const BIND_TYPE_MUTATOR = {
  mutationToDom: function() {
    if (!this.boundTypes_.size) {
      return null;
    }
    const container = Blockly.utils.xml.createElement('mutation');
    for (const [genericType, explicitType] of this.boundTypes_) {
      const typeElem = Blockly.utils.xml.createElement('type');
      typeElem.setAttribute('generictype', genericType);
      typeElem.setAttribute('explicittype', explicitType);
      container.appendChild(typeElem);
    }
    if (!container.childNodes.length) {
      return null;
    }
    return container;
  },

  domToMutation: function(xmlElement) {
    for (const childNode of xmlElement.childNodes) {
      this.bindType(
          childNode.getAttribute('generictype'),
          childNode.getAttribute('explicittype'));
    }
  },

  bindType: function(genericType, explicitType) {
    this.workspace.connectionChecker.bindType(this, genericType, explicitType);
    this.boundTypes_.set(genericType, explicitType);
  },
};

const BIND_TYPE_HELPER = function() {
  this.boundTypes_ = new Map();
};

Blockly.Extensions.registerMutator(
    'bind_type_mutator', BIND_TYPE_MUTATOR, BIND_TYPE_HELPER);
