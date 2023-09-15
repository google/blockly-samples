import {factoryBase} from './factory_base';
import * as Blockly from 'blockly';
import {inputDummy, inputStatement, inputValue, inputEndRow} from './inputs';

export const registerAllBlocks = function() {
  Blockly.common.defineBlocks({
    'factory_base': factoryBase,
    'input_value': inputValue,
    'input_statement': inputStatement,
    'input_dummy': inputDummy,
    'input_end_row': inputEndRow,
  });
};


