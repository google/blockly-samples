/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Unit tests for validation of a type hierarchy definition.
 */

const chai = require('chai');
const sinon = require('sinon');

const {validateHierarchy} = require('../src/hierarchy_validation.js');

suite('Hierarchy Validation', function() {
  setup(function() {
    this.errorStub = sinon.stub(console, 'error');
  });

  teardown(function() {
    this.errorStub.restore();
  });

  suite('Correct type', function() {
    test('Object', function() {
      validateHierarchy({});
      chai.assert.isTrue(this.errorStub.notCalled);
    });

    test('Undefined', function() {
      validateHierarchy();
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(
          'The hierarchy definition should be an object.'));
    });

    test('Array', function() {
      validateHierarchy([]);
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(
          'The hierarchy definition should be an object.'));
    });
  });

  suite('Conflicts', function() {
    setup(function() {
      this.conflictMsg =
          'The type name \'%s\' conflicts with the type name(s) %s';
    });

    test('No conflicts', function() {
      validateHierarchy({
        'typeA': { },
        'typeB': { },
        'typeC': { },
      });
      chai.assert.isTrue(this.errorStub.notCalled);
    });

    test('Type conflicts once', function() {
      validateHierarchy({
        'typeA': { },
        'TypeA': { },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(
          this.conflictMsg, 'typeA', ['TypeA']));
    });

    test('Type conflicts multiple', function() {
      validateHierarchy({
        'typeA': { },
        'TypeA': { },
        'Typea': { },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(
          this.conflictMsg, 'typeA', ['TypeA', 'Typea']));
    });

    test('Multiple conflicts', function() {
      validateHierarchy({
        'typeA': { },
        'TypeA': { },
        'typeB': { },
        'TypeB': { },
      });
      chai.assert.isTrue(this.errorStub.calledTwice);
      chai.assert.isTrue(this.errorStub.calledWith(
          this.conflictMsg, 'typeA', ['TypeA']));
      chai.assert.isTrue(this.errorStub.calledWith(
          this.conflictMsg, 'typeB', ['TypeB']));
    });
  });
});
