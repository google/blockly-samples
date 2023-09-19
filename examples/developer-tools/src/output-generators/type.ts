import * as Blockly from 'blockly';
import {JsonDefinitionGenerator, Order, jsonDefinitionGenerator} from './json_definition_generator';

jsonDefinitionGenerator.forBlock['type'] = function(block: Blockly.Block, generator: JsonDefinitionGenerator): [string, number] {
  const selected = block.getFieldValue('TYPEDROPDOWN');
  let output = '';
  switch (selected) {
    case 'null': {
      output = 'null';
      break;
    }
    case 'CUSTOM': {
      const customValue = block.getFieldValue('CUSTOMTYPE');
      if (!customValue) {
        output = '';
      } else {
        output = generator.quote_(customValue);
      }
      break;
    }
    default: {
      output = generator.quote_(selected);
    }
  }

  return [output, Order.ATOMIC];
};

jsonDefinitionGenerator.forBlock['type_group'] = function(block: Blockly.Block, generator: JsonDefinitionGenerator): [string, number] {
  const types = new Set<string>();
  for (const input of block.inputList) {
    const value = generator.valueToCode(block, input.name, Order.ATOMIC);
    if (value === 'null') {
      // If the list contains 'any' then the type check is simplified to 'any'
      return ['null', Order.ATOMIC];
    }
    if (value) types.add(value);
  }
  if (types.size === 0) {
    return ['', Order.ATOMIC];
  }
  if (types.size === 1) {
    return [Array.from(types)[0], Order.ATOMIC];
  }
  return [`[${Array.from(types).join(', ')}]`, Order.ATOMIC];
};
