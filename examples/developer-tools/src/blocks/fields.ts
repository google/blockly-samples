/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {FieldAngle} from '@blockly/field-angle';
import {FieldColour} from '@blockly/field-colour';

/** The default source to use as prepopulated text in image fields. */
const defaultImageSrc =
  'https://www.gstatic.com/codesite/ph/images/star_on.gif';
/** The tooltip text to show explaining alt text for images. */
const imageAltTooltip =
  'Alt text used for screenreaders and when image is unavailable';
/** The tooltip text to show explaining the 'flip RTL' option for images. */
const imageFlipTooltip =
  'Whether the image should be reversed when a workspace is rendered RTL';

/**
 * Check to see if more than one field has this name.
 * Highly inefficient (On^2), but n is small.
 *
 * @param referenceBlock Block to check.
 */
const checkNameConflicts = function (referenceBlock: Blockly.Block) {
  if (referenceBlock.isDeadOrDying()) return;
  const name = referenceBlock.getFieldValue('FIELDNAME').toLowerCase();
  let count = 0;
  const blocks = referenceBlock.workspace.getAllBlocks(false);
  for (const block of blocks) {
    const otherName = block.getFieldValue('FIELDNAME');
    if (
      block.isEnabled() &&
      !block.getInheritedDisabled() &&
      otherName &&
      otherName.toLowerCase() === name
    ) {
      count++;
    }
  }
  const msg =
    count > 1 ? `There are ${count} field blocks\nwith this name.` : null;
  referenceBlock.setWarningText(msg, 'duplicatename');
};

/**
 * Label (non-serializable) field.
 */
export const fieldLabel = {
  init: function () {
    this.setStyle('field');
    this.appendDummyInput('FIRST')
      .appendField('label')
      .appendField(new Blockly.FieldTextInput(''), 'TEXT');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('Static text that serves as a label.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=88');
  },
};

/**
 * Serializable label field.
 */
export const fieldLabelSerializable = {
  init: function () {
    this.setStyle('field');
    this.appendDummyInput('FIRST')
      .appendField('label')
      .appendField(new Blockly.FieldTextInput(''), 'TEXT')
      .appendField(',')
      .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip(
      'Static text that serves as a label, and is saved with' +
        ' block data. Use only if you want to modify this label at runtime.',
    );
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=88');
  },
  onchange: function () {
    checkNameConflicts(this);
  },
};

/**
 * Text input field.
 */
export const fieldInput = {
  init: function () {
    this.setStyle('field');
    this.appendDummyInput()
      .appendField('text input')
      .appendField(new Blockly.FieldTextInput('default'), 'TEXT')
      .appendField(',')
      .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('An input field for the user to enter text.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=319');
  },
  onchange: function () {
    checkNameConflicts(this);
  },
};

/**
 * Number input field.
 */
export const fieldNumber = {
  init: function () {
    this.setStyle('field');
    this.appendDummyInput()
      .appendField('numeric input')
      .appendField(new Blockly.FieldNumber(0), 'VALUE')
      .appendField(',')
      .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.appendDummyInput()
      .appendField('min')
      .appendField(new Blockly.FieldNumber(-Infinity), 'MIN')
      .appendField('max')
      .appendField(new Blockly.FieldNumber(Infinity), 'MAX')
      .appendField('precision')
      .appendField(new Blockly.FieldNumber(0, 0), 'PRECISION');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('An input field for the user to enter a number.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=319');
  },
  onchange: function () {
    checkNameConflicts(this);
  },
};

/**
 * Checkbox field.
 */
export const fieldCheckbox = {
  init: function () {
    this.setStyle('field');
    this.appendDummyInput()
      .appendField('checkbox')
      .appendField(new Blockly.FieldCheckbox('TRUE'), 'CHECKED')
      .appendField(',')
      .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('A field with a checkbox.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=485');
  },
  onchange: function () {
    checkNameConflicts(this);
  },
};

/**
 * Variable field with a dropdown for selecting a variable by name.
 */
export const fieldVariable = {
  init: function () {
    this.setStyle('field');
    this.appendDummyInput()
      .appendField('variable')
      .appendField(new Blockly.FieldTextInput('item'), 'TEXT')
      .appendField(',')
      .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('Dropdown menu for variable names.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=510');
  },
  onchange: function () {
    checkNameConflicts(this);
  },
};

/**
 * Image field.
 */
export const fieldImage = {
  init: function () {
    this.setStyle('field');
    const src = defaultImageSrc;
    this.appendDummyInput()
      .appendField('image')
      .appendField(new Blockly.FieldTextInput(src), 'SRC');
    this.appendDummyInput()
      .appendField('width')
      .appendField(new Blockly.FieldNumber('15', 0, null, 1), 'WIDTH')
      .appendField('height')
      .appendField(new Blockly.FieldNumber('15', 0, null, 1), 'HEIGHT')
      .appendField('alt text')
      .appendField(
        new Blockly.FieldTextInput('*', undefined, {tooltip: imageAltTooltip}),
        'ALT',
      )
      .appendField('flip RTL')
      .appendField(
        new Blockly.FieldCheckbox('FALSE', undefined, {
          tooltip: imageFlipTooltip,
        }),
        'FLIP_RTL',
      );
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip(
      'Static image (JPEG, PNG, GIF, SVG, BMP).\n' +
        'Retains aspect ratio regardless of height and width.\n' +
        'Alt text is for when collapsed.',
    );
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=567');
  },
};

export type DropdownOptionData =
  | string
  | {
      src: string;
      width: number;
      height: number;
      alt: string;
    };
/**
 * Type for a block that creates a dropdown field.
 */
export type FieldDropdownBlock = Blockly.BlockSvg & {
  /** user-visible dropdown option */
  userData: DropdownOptionData;
  /** machine-readable dropdown value */
  cpuData: string;
  optionList: string[];
  updateShape: () => void;
  getUserData: (n: number) => DropdownOptionData;
};

/**
 * Dropdown menu field.
 */
export const fieldDropdown = {
  init: function (this: FieldDropdownBlock) {
    this.appendDummyInput()
      .appendField('dropdown')
      .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.optionList = ['text', 'text', 'text'];
    this.updateShape();
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setMutator(
      new Blockly.icons.MutatorIcon(
        ['field_dropdown_option_text', 'field_dropdown_option_image'],
        this,
      ),
    );
    this.setStyle('field');
    this.setTooltip('Dropdown menu with a list of options.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=386');
  },
  saveExtraState: function (): {options: string[]} {
    return {
      options: this.optionList,
    };
  },
  loadExtraState: function (state: {options: string[]}) {
    this.optionList = state.options;
    this.updateShape();
  },
  decompose: function (workspace: Blockly.WorkspaceSvg) {
    // Populate the mutator's dialog with this block's components.
    const containerBlock = workspace.newBlock('field_dropdown_container');
    containerBlock.initSvg();
    let connection = containerBlock.getInput('STACK').connection;
    for (const option of this.optionList) {
      const optionBlock = workspace.newBlock('field_dropdown_option_' + option);
      optionBlock.initSvg();
      connection.connect(optionBlock.previousConnection);
      connection = optionBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function (this: FieldDropdownBlock, containerBlock: Blockly.Block) {
    // Reconfigure this block based on the mutator dialog's components.
    let optionBlock = containerBlock.getInputTargetBlock(
      'STACK',
    ) as FieldDropdownBlock;
    // Count number of inputs and save the existing data.
    this.optionList.length = 0;
    const data = [];
    while (optionBlock) {
      if (optionBlock.type === 'field_dropdown_option_text') {
        this.optionList.push('text');
      } else if (optionBlock.type === 'field_dropdown_option_image') {
        this.optionList.push('image');
      }
      data.push([optionBlock.userData, optionBlock.cpuData]);
      optionBlock =
        optionBlock.nextConnection &&
        (optionBlock.nextConnection.targetBlock() as FieldDropdownBlock);
    }
    this.updateShape();
    // Restore any data.
    for (let i = 0; i < this.optionList.length; i++) {
      const [userData, cpuData] = data[i];
      if (userData !== undefined) {
        if (typeof userData === 'string') {
          this.setFieldValue(userData || 'option', 'USER' + i);
        } else {
          this.setFieldValue(userData.src, 'SRC' + i);
          this.setFieldValue(userData.width, 'WIDTH' + i);
          this.setFieldValue(userData.height, 'HEIGHT' + i);
          this.setFieldValue(userData.alt, 'ALT' + i);
        }
        this.setFieldValue(cpuData || 'OPTIONNAME', 'CPU' + i);
      }
    }
  },
  saveConnections: function (containerBlock: Blockly.Block) {
    // Store all data for each option.
    let optionBlock = containerBlock.getInputTargetBlock(
      'STACK',
    ) as FieldDropdownBlock;
    let i = 0;
    while (optionBlock) {
      optionBlock.userData = this.getUserData(i);
      optionBlock.cpuData = this.getFieldValue('CPU' + i);
      i++;
      optionBlock =
        optionBlock.nextConnection &&
        (optionBlock.nextConnection.targetBlock() as FieldDropdownBlock);
    }
  },
  updateShape: function () {
    // Delete everything.
    let i = 0;
    while (this.getInput('OPTION' + i)) {
      this.removeInput('OPTION' + i);
      this.removeInput('OPTION_IMAGE' + i, true);
      i++;
    }
    // Rebuild block.
    for (let i = 0; i <= this.optionList.length; i++) {
      const type = this.optionList[i];
      if (type === 'text') {
        this.appendDummyInput('OPTION' + i)
          .appendField('•')
          .appendField(new Blockly.FieldTextInput('option'), 'USER' + i)
          .appendField(',')
          .appendField(new Blockly.FieldTextInput('OPTIONNAME'), 'CPU' + i);
      } else if (type === 'image') {
        this.appendDummyInput('OPTION' + i)
          .appendField('•')
          .appendField('image')
          .appendField(new Blockly.FieldTextInput(defaultImageSrc), 'SRC' + i);
        this.appendDummyInput('OPTION_IMAGE' + i)
          .appendField(' ')
          .appendField('width')
          .appendField(new Blockly.FieldNumber('15', 0, NaN, 1), 'WIDTH' + i)
          .appendField('height')
          .appendField(new Blockly.FieldNumber('15', 0, NaN, 1), 'HEIGHT' + i)
          .appendField('alt text')
          .appendField(
            new Blockly.FieldTextInput('*', undefined, {
              tooltip: imageAltTooltip,
            }),
            'ALT' + i,
          )
          .appendField(',')
          .appendField(new Blockly.FieldTextInput('OPTIONNAME'), 'CPU' + i);
      }
    }
  },
  onchange: function () {
    let msg = null;
    if (!this.isDeadOrDying() && this.optionList.length < 1) {
      msg = 'Drop down menu must\nhave at least one option.';
    }
    this.setWarningText(msg, 'dropdownoption');

    checkNameConflicts(this);
  },
  /**
   * Gets the data for a single dropdown option. For a text option,
   * this is the string shown to users in the menu. For an image option,
   * this includes all the image data needed to render the image.
   *
   * @param n Number of the input to get the data for.
   * @returns User data for a single dropdown option.
   */
  getUserData: function (n: number) {
    if (this.optionList[n] === 'text') {
      return this.getFieldValue('USER' + n);
    }
    if (this.optionList[n] === 'image') {
      return {
        src: this.getFieldValue('SRC' + n),
        width: Number(this.getFieldValue('WIDTH' + n)),
        height: Number(this.getFieldValue('HEIGHT' + n)),
        alt: this.getFieldValue('ALT' + n),
      };
    }
    throw new Error('Unknown dropdown type');
  },
};

/** Container for the dropdown field mutator. */
export const fieldDropdownContainer = {
  init: function () {
    this.setStyle('field');
    this.appendDummyInput().appendField('add options');
    this.appendStatementInput('STACK');
    this.setTooltip(
      'Add, remove, or reorder options\n' +
        'to reconfigure this dropdown menu.',
    );
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=386');
    this.contextMenu = false;
  },
};

/** Text option for the dropdown field mutator. */
export const fieldDropdownOptionText = {
  init: function () {
    this.setStyle('field');
    this.appendDummyInput().appendField('text option');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Add a new text option to the dropdown menu.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=386');
    this.contextMenu = false;
  },
};

/** Image option for the dropdown field mutator. */
export const fieldDropdownOptionImage = {
  init: function () {
    this.setStyle('field');
    this.appendDummyInput().appendField('image option');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Add a new image option to the dropdown menu.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=386');
    this.contextMenu = false;
  },
};

/** Angle field. */
export const fieldAngle = {
  init: function () {
    this.setStyle('field');
    this.appendDummyInput()
      .appendField('angle')
      .appendField(new FieldAngle('90'), 'ANGLE')
      .appendField(',')
      .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('A field for the user to enter an angle.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=372');
  },
  onchange: function () {
    checkNameConflicts(this);
  },
};

/** Colour field. */
export const fieldColour = {
  init: function () {
    this.setStyle('field');
    this.appendDummyInput()
      .appendField('colour')
      .appendField(new FieldColour('#ff0000'), 'COLOUR')
      .appendField(',')
      .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('Colour field.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=495');
  },
  onchange: function () {
    checkNameConflicts(this);
  },
};
