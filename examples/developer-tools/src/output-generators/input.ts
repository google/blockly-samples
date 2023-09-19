import {JsonDefinitionGenerator, Order, jsonDefinitionGenerator} from './json_definition_generator';
import * as Blockly from 'blockly';


jsonDefinitionGenerator.forBlock['input'] = function(block: Blockly.Block, generator: JsonDefinitionGenerator): string {
  const name = generator.quote_(block.getFieldValue('INPUTNAME'));
  const inputType = generator.quote_(block.getFieldValue('INPUT_TYPE'));

  const alignValue = block.getFieldValue('ALIGNMENT');
  let align = '';
  if (alignValue !== 'LEFT') {
    align = `,\n    "align": ${generator.quote_(alignValue)}`;
  }

  const typeValue = generator.valueToCode(block, 'TYPE', Order.ATOMIC);
  let type = '';
  if (typeValue && typeValue !== 'null') {
    type = `,\n    "check": ${typeValue}`;
  }


  return `{
    "type": ${inputType},
    "name": ${name}${align}${type}
  }`;
};
