/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A tool for making a dropdown field's options depend on the
 * value of another field.
 */

import * as Blockly from 'blockly/core';
import {Block} from 'blockly/core/block';
import {FieldDropdown, MenuOption, MenuGeneratorFunction} from 'blockly/core/field_dropdown';
import {FieldValidator} from 'blockly/core/field';

/**
 * A deep equality comparison between the two provided arrays, recursively
 * comparing any child elements that are also arrays.
 *
 * @param a The first array to compare.
 * @param b The second array to compare.
 * @returns Whether the arrays are deeply equivalent.
 */
function arraysAreEquivalent<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((aElement, index) => {
    const bElement = b[index];
    if (Array.isArray(aElement) && Array.isArray(bElement)) {
      return arraysAreEquivalent(aElement, bElement);
    }
    return aElement === bElement;
  });
}

/** The structure of a serialized DependentDropdownOptionsChange. */
export interface DependentDropdownOptionsChangeJson
    extends Blockly.Events.BlockBaseJson {
  name: string;
  newValue: string;
  oldValue: string;
  oldOptions: MenuOption[];
  newOptions: MenuOption[];
}

/** The type of the mapping from parent value to child options. */
export interface ChildOptionMapping{
  [key: string]: MenuOption[];
}

declare module 'blockly/core/field_dropdown' {
  // Add a new property to dropdown fields for recording changes to options.
  interface FieldDropdown {
    dependentOptions?: MenuOption[];
  }
}

/**
 * A change event representing a simultaneous change to a dropdown field's
 * options and value. The old value must be one of the old options, and the new
 * value must be one of the new options. However, unlike a normal value change
 * event, it's possible for this event to change the value to something that
 * wasn't previously one of the valid options, in either direction, by also
 * changing the options at the same time.
 */
class DependentDropdownOptionsChange extends Blockly.Events.BlockBase {
  /** The name to register with Blockly for the type of event. */
  /* eslint-disable @typescript-eslint/naming-convention */
  static readonly EVENT_TYPE: string = 'dropdown_options_change';
  /* eslint-enable @typescript-eslint/naming-convention */

  /** The name of the change event type for registering with Blockly. */
  readonly type = DependentDropdownOptionsChange.EVENT_TYPE;

  /** The name of the field that changed, if this is a change to a field. */
  name?: string;

  /** The original value of the field. */
  oldValue?: string;

  /** The new value of the field. */
  newValue?: string;

  /** The original available options for the dropdown field. */
  oldOptions?: MenuOption[];

  /** The new available options for the dropdown field. */
  newOptions?: MenuOption[];

  /**
   * Construct a new DependentDropdownOptionsChange.
   * @param block The changed block. Undefined for a blank event.
   * @param name Name of the field affected.
   * @param oldValue Previous value of field.
   * @param newValue New value of field.
   * @param oldOptions Previous options for the dropdown.
   * @param newOptions New options for the dropdown.
   */
  constructor(
      block?: Block,
      name?: string,
      oldValue?: string,
      newValue?: string,
      oldOptions?: MenuOption[],
      newOptions?: MenuOption[]) {
    super(block);

    if (!block ||
        !name ||
        !oldValue ||
        !newValue ||
        !oldOptions ||
        !newOptions) {
      // Blank event to be populated by fromJson.
      return;
    }

    this.name = name;
    this.oldValue = oldValue;
    this.newValue = newValue;
    this.oldOptions = oldOptions;
    this.newOptions = newOptions;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  toJson(): DependentDropdownOptionsChangeJson {
    const json = super.toJson() as DependentDropdownOptionsChangeJson;
    if (!this.name ||
        !this.oldValue ||
        !this.newValue ||
        !this.oldOptions ||
        !this.newOptions) {
      throw new Error(
          'The changed element is undefined. Either pass all needed ' +
          'parameters to the constructor, or call fromJson.');
    }
    json['name'] = this.name;
    json['oldValue'] = this.oldValue;
    json['newValue'] = this.newValue;
    json['oldOptions'] = this.oldOptions;
    json['newOptions'] = this.newOptions;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  fromJson(json: DependentDropdownOptionsChangeJson): void {
    super.fromJson(json);
    this.name = json['name'];
    this.oldValue = json['oldValue'];
    this.newValue = json['newValue'];
    this.oldOptions = json['oldOptions'];
    this.newOptions = json['newOptions'];
  }

  /**
   * Does this event leave all state as it was before?
   *
   * @returns False if something changed.
   */
  isNull(): boolean {
    return !this.oldValue ||
        !this.newValue ||
        !this.oldOptions ||
        !this.newOptions ||
        (this.oldValue === this.newValue &&
            arraysAreEquivalent(this.oldOptions, this.newOptions));
  }

  /**
   * Run a change event.
   *
   * @param forward True if run forward, false if run backward (undo).
   */
  run(forward: boolean): void {
    if (!this.blockId ||
        !this.name ||
        !this.oldValue ||
        !this.newValue ||
        !this.oldOptions ||
        !this.newOptions) {
      console.warn('Can\'t run uninitialized event.');
      return;
    }
    const workspace = this.getEventWorkspace_();
    const block = workspace.getBlockById(this.blockId);
    if (!block) {
      console.warn('Can\'t change non-existent block: ' + this.blockId);
      return;
    }

    const dropdown = block.getField(this.name) as FieldDropdown;
    if (!dropdown) {
      console.warn('Can\'t change non-existent dropdown field: ' + this.name);
      return;
    }

    const value = forward ? this.newValue : this.oldValue;
    const options = forward ? this.newOptions : this.oldOptions;

    // Record the options on the dropdown for the option generator to access.
    dropdown.dependentOptions = options;

    // Re-run the option generator to update the options on the dropdown.
    dropdown.getOptions(false);

    // Set the value to one of the now-available options.
    dropdown.setValue(value);
  }
}

Blockly.registry.register(
    Blockly.registry.Type.EVENT,
    DependentDropdownOptionsChange.EVENT_TYPE,
    DependentDropdownOptionsChange);

/**
 * A class that automatically updates a dropdown field's options based on a
 * mapping from a parent field's value. In order to work correctly while
 * deserializing, the parent field must be attached to the block before the
 * child field. Instances of this class provide a parentFieldValidator and a
 * childFieldOptionGenerator that should be passed to the field constructors.
 */
export class DropdownDependency {
  /**
   * A validator function for the parent field that has the side effect of
   * updating the options of the child dropdown field based on the new value of
   * the parent field whenever it changes. The validator function is a good
   * place to do this because it is called immediately while deserializing
   * workspaces before the following fields are deserialized, so when the child
   * value is deserialized the appropriate options will already be available.
   * The new options will be assigned to a property on the child field called
   * "dependentOptions".
   */
  parentFieldValidator: FieldValidator<string>;

  /**
   * An option generator function for the child field that tries to read the
   * options from the "dependentOptions" property on the child field.
   */
  childFieldOptionGenerator: MenuGeneratorFunction;

  /**
   * Construct a new DropdownDependency.
   * @param block The block that the fields will be attached to.
   * @param parentFieldName The name that will be given to the parent field.
   * @param childFieldName The name that will be given to the child field.
   * @param childOptionMapping An object where the keys are the possible values
   *     of the parent field, and the values are the arrays of corresponding
   *     options for the child field.
   */
  constructor(
      block: Block,
      parentFieldName: string,
      childFieldName: string,
      childOptionMapping: ChildOptionMapping) {
    this.parentFieldValidator = (newValue): undefined => {
      if (newValue == undefined) {
        return;
      }
      const childDropdown = block.getField(childFieldName) as FieldDropdown;
      if (!childDropdown) {
        throw new Error('Could not find the child field: ' + childFieldName);
      }
      const oldChildValue = childDropdown.getValue();
      const oldChildOptions = childDropdown.getOptions(false);
      const newChildOptions = childOptionMapping[newValue];
      if (!Array.isArray(newChildOptions)) {
        console.warn('Could not find an array of child options matching the ' +
            'parent value: ' + newValue);
        return;
      }

      // If the child field's value is still available in the new options, keep
      // it, otherwise change the field's value to the first available option.
      const newOptionsIncludeOldValue =
          newChildOptions.find((option) => option[1] == oldChildValue) !=
          undefined;
      const newChildValue = newOptionsIncludeOldValue ?
          oldChildValue :
          newChildOptions[0][1];

      // Record the options on the dropdown so the option generator can access
      // them.
      childDropdown.dependentOptions = newChildOptions;

      // Re-run the option generator to update the options on the dropdown.
      childDropdown.getOptions(false);

      // Update the child field value without broadcasting the normal change
      // event. The normal value change event can't be properly undone, because
      // the old value is not one of the currently valid options, so a custom
      // change event will be broadcast instead that handles swapping the
      // options and the value at the same time.
      Blockly.Events.disable();
      childDropdown.setValue(newChildValue);
      Blockly.Events.enable();

      if (Blockly.Events.getRecordUndo()) {
        if (!Blockly.Events.getGroup()) {
          // Start a change group before the change event. The change event for
          // the parent field value will be created after this function returns
          // and will be part of the same group.
          Blockly.Events.setGroup(true);
          // Clear the change group later, after all related events have been
          // broadcast, but before the user performs any more actions.
          setTimeout(() => Blockly.Events.setGroup(false));
        }

        // Record that the child field's options and value have changed.
        Blockly.Events.fire(new DependentDropdownOptionsChange(
            block,
            childFieldName,
            oldChildValue,
            newChildValue,
            oldChildOptions,
            newChildOptions));
      }
    };

    this.childFieldOptionGenerator = () => {
      const childDropdown = block.getField(childFieldName) as FieldDropdown;

      // If the child drop down exists and has dependentOptions, use that.
      if (childDropdown && Array.isArray(childDropdown.dependentOptions)) {
        return childDropdown.dependentOptions;
      }

      // Fall back on the options corresponding to the parent field's current
      // value (which is fine when initializing but may be out of date when
      // making changes since the parent field's validator function triggers
      // this function before the parent field's value is updated).
      const parentField = block.getField(parentFieldName);

      // If the parent field exists, and its value is a key in the provided
      // option mapping, use the corresponding options.
      if (parentField) {
        const options = childOptionMapping[parentField.getValue()];
        if (Array.isArray(options)) {
          return options;
        }
      }

      // Fall back on basic default options.
      return [['', '']];
    };
  }
}
