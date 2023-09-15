import * as Blockly from 'blockly';

const fieldMessage = 'fields %1 %2';
const fieldArgs = [
  {
    'type': 'field_dropdown',
    'name': 'ALIGN',
    'options': [['left', 'LEFT'], ['right', 'RIGHT'], ['centre', 'CENTRE']],
  },
  {
    'type': 'input_statement',
    'name': 'FIELDS',
    'check': 'Field',
  },
];

const typeMessage = 'type %1';
const typeArgs = [
  {
    'type': 'input_value',
    'name': 'TYPE',
    'check': 'Type',
    'align': 'RIGHT',
  },
];

/**
 * Check to see if more than one input has this name.
 * Highly inefficient (On^2), but n is small.
 * @param referenceBlock Block to check.
 */
function inputNameCheck(referenceBlock: Blockly.Block) {
  if (!referenceBlock.workspace) {
    // Block has been deleted.
    return;
  }
  const name = referenceBlock.getFieldValue('INPUTNAME').toLowerCase();
  let count = 0;
  const blocks = referenceBlock.workspace.getAllBlocks(false);
  for (const block of blocks) {
    const otherName = block.getFieldValue('INPUTNAME');
    if (block.isEnabled() && !block.getInheritedDisabled() &&
        otherName && otherName.toLowerCase() === name) {
      count++;
    }
  }
  const msg = (count > 1) ?
      'There are ' + count + ' input blocks\n with this name.' : null;
  referenceBlock.setWarningText(msg);
}

export const inputValue = {
  // Value input.
  init: function() {
    this.jsonInit({
      'message0': 'value input %1 %2',
      'args0': [
        {
          'type': 'field_input',
          'name': 'INPUTNAME',
          'text': 'NAME',
        },
        {
          'type': 'input_dummy',
        },
      ],
      'message1': fieldMessage,
      'args1': fieldArgs,
      'message2': typeMessage,
      'args2': typeArgs,
      'previousStatement': 'Input',
      'nextStatement': 'Input',
      'colour': 210,
      'tooltip': 'A value socket for horizontal connections.',
      'helpUrl': 'https://www.youtube.com/watch?v=s2_xaEvcVI0#t=71',
    });
  },
  onchange: function() {
    inputNameCheck(this);
  },
};

export const inputStatement = {
  // Statement input.
  init: function() {
    this.jsonInit({
      'message0': 'statement input %1 %2',
      'args0': [
        {
          'type': 'field_input',
          'name': 'INPUTNAME',
          'text': 'NAME',
        },
        {
          'type': 'input_dummy',
        },
      ],
      'message1': fieldMessage,
      'args1': fieldArgs,
      'message2': typeMessage,
      'args2': typeArgs,
      'previousStatement': 'Input',
      'nextStatement': 'Input',
      'colour': 210,
      'tooltip': 'A statement socket for enclosed vertical stacks.',
      'helpUrl': 'https://www.youtube.com/watch?v=s2_xaEvcVI0#t=246',
    });
  },
  onchange: function() {
    inputNameCheck(this);
  },
};

export const inputDummy = {
  // Dummy input.
  init: function() {
    this.jsonInit({
      'message0': 'dummy input',
      'message1': fieldMessage,
      'args1': fieldArgs,
      'previousStatement': 'Input',
      'nextStatement': 'Input',
      'colour': 210,
      'tooltip': 'For adding fields without any block connections.' +
                 'Alignment options (left, right, centre) only affect ' +
                 'multi-row blocks.',
      'helpUrl': 'https://www.youtube.com/watch?v=s2_xaEvcVI0#t=293',
    });
  },
};

export const inputEndRow = {
  // End-row input.
  init: function() {
    this.jsonInit({
      'message0': 'end-row input',
      'message1': fieldMessage,
      'args1': fieldArgs,
      'previousStatement': 'Input',
      'nextStatement': 'Input',
      'colour': 210,
      'tooltip': 'For adding fields without any block connections that will ' +
                 'be rendered on a separate row from any following inputs. ' +
                 'Alignment options (left, right, centre) only affect ' +
                 'multi-row blocks.',
      'helpUrl': 'https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks#block_inputs',
    });
  },
};
