/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

import Blockly from 'blockly/core';


class NoOverridesField extends Blockly.FieldLabel {
  constructor(value, cssClass, config) {
    super(value, cssClass, config);

    this.EDITABLE = false;
    this.SERIALIZABLE = true;
  }
}

NoOverridesField.fromJson = function(options) {
  const text = Blockly.utils.replaceMessageReferences(options['text']);
  return new this(text, undefined, options);
};

Blockly.fieldRegistry.register('field_no_overrides', NoOverridesField);


class XmlField extends Blockly.FieldLabel {
  constructor(value, cssClass, config) {
    super(value, cssClass, config);

    this.EDITABLE = false;
    this.SERIALIZABLE = true;
  }

  toXml(element) {
    element.setAttribute('value', this.getValue());
    return element;
  }

  fromXml(element) {
    this.setValue(element.getAttribute('value'));
  }
}

XmlField.fromJson = function(options) {
  const text = Blockly.utils.replaceMessageReferences(options['text']);
  return new this(text, undefined, options);
};

Blockly.fieldRegistry.register('field_xml', XmlField);


class JsoField extends Blockly.FieldLabel {
  constructor(value, cssClass, config) {
    super(value, cssClass, config);

    this.EDITABLE = false;
    this.SERIALIZABLE = true;
  }

  saveState() {
    return {
      'value': this.getValue(),
    };
  }

  loadState(state) {
    this.setValue(state['value']);
  }
}

JsoField.fromJson = function(options) {
  const text = Blockly.utils.replaceMessageReferences(options['text']);
  return new this(text, undefined, options);
};

Blockly.fieldRegistry.register('field_jso', JsoField);


class BothField extends Blockly.FieldLabel {
  constructor(value, cssClass, config) {
    super(value, cssClass, config);

    this.EDITABLE = false;
    this.SERIALIZABLE = true;
  }

  toXml(element) {
    element.setAttribute('value', this.getValue());
    return element;
  }

  fromXml(element) {
    this.setValue(element.getAttribute('value'));
  }

  saveState() {
    return {
      'value': this.getValue(),
    };
  }

  loadState(state) {
    this.setValue(state['value']);
  }
}

BothField.fromJson = function(options) {
  const text = Blockly.utils.replaceMessageReferences(options['text']);
  return new this(text, undefined, options);
};

Blockly.fieldRegistry.register('field_both', BothField);
