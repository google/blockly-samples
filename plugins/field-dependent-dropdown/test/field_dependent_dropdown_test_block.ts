import * as Blockly from 'blockly';
import {MenuOption} from 'blockly/core/field_dropdown';
import {DropdownDependency} from '../src/index';

Blockly.Blocks['dependent_dropdown_test'] = {
  init: function() {
    const parentFieldName = 'PARENT_FIELD';
    const childFieldName = 'CHILD_FIELD';
    const grandchildFieldName = 'GRANDCHILD_FIELD';
    const parentOptions: MenuOption[] = [['A', 'a'], ['B', 'b']];
    const childOptions: {[key: string]: MenuOption[]} = {
      'a': [['A1', 'a1'], ['A2', 'a2'], ['Shared', 'shared']],
      'b': [['B1', 'b1'], ['B2', 'b2'], ['Shared', 'shared']],
    };
    const grandchildOptions: {[key: string]: MenuOption[]} = {
      'a1': [['A11', 'a11'], ['A12', 'a12']],
      'a2': [['A21', 'a21'], ['A22', 'a22']],
      'b1': [['B11', 'b11'], ['B12', 'b12']],
      'b2': [['B21', 'b21'], ['B22', 'b22']],
      'shared': [['Only', 'only']],
    };

    const dropdownDependency1 = new DropdownDependency(
        this,
        parentFieldName,
        childFieldName,
        childOptions);
    const dropdownDependency2 = new DropdownDependency(
        this,
        childFieldName,
        grandchildFieldName,
        grandchildOptions);

    this.appendDummyInput()
        .appendField('Parent')
        .appendField(
            new Blockly.FieldDropdown(
                parentOptions,
                dropdownDependency1.parentFieldValidator),
            parentFieldName);
    this.appendDummyInput()
        .appendField('Child')
        .appendField(
            new Blockly.FieldDropdown(
                dropdownDependency1.childFieldOptionGenerator,
                dropdownDependency2.parentFieldValidator),
            childFieldName);
    this.appendDummyInput()
        .appendField('Grandchild')
        .appendField(
            new Blockly.FieldDropdown(
                dropdownDependency2.childFieldOptionGenerator),
            grandchildFieldName);
    this.setColour(100);
  },
};
