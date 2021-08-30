/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Tests for the migration utils.
 */

const chai = require('chai');
const sinon = require('sinon');
const {addMigration,
  clearMigrations,
  getVersions,
  runMigrations,
  showVersionHelp} = require('../bin/utils');

suite('Utils', function() {
  setup(function() {
    clearMigrations();

    this.logStub = sinon.stub(console, 'log');
  });

  teardown(function() {
    this.logStub.restore();
  });

  suite('getVersions', function() {
    test('Simple', function() {
      addMigration('1', 'test1', false, 'description1', () => {});
      addMigration('1.2', 'test2', false, 'description2', () => {});
      addMigration('2', 'test3', false, 'description3', () => {});
      addMigration('3', 'test4', false, 'description4', () => {});
      chai.assert.deepEqual(
          getVersions(), ['1.0.0', '1.2.0', '2.0.0', '3.0.0']);
    });

    test('Duplicates', function() {
      addMigration('1', 'test1', false, 'description1', () => {});
      addMigration('1', 'test2', false, 'description2', () => {});
      chai.assert.deepEqual(getVersions(), ['1.0.0']);
    });

    test('Out of order', function() {
      addMigration('2', 'test1', false, 'description1', () => {});
      addMigration('1', 'test2', false, 'description2', () => {});
      chai.assert.deepEqual(getVersions(), ['1.0.0', '2.0.0']);
    });
  });

  suite('runMigrations', function() {
    test('Simple', function() {
      const stub1 = sinon.stub();
      const stub2 = sinon.stub();
      const stub3 = sinon.stub();
      addMigration('1', 'test1', false, 'description1', stub1);
      addMigration('2', 'test2', false, 'description2', stub2);
      addMigration('3', 'test3', false, 'description3', stub3);
      runMigrations('0 - 3', false, new Set());
      chai.assert.isTrue(stub1.calledOnce);
      chai.assert.isTrue(stub2.calledOnce);
      chai.assert.isTrue(stub3.calledOnce);
    });

    test('Invalid range', function() {
      runMigrations('1 - -', false, new Set());
      chai.assert.isTrue(this.logStub.calledWith('Invalid range: 1 - -'));
    });

    test('No migrations', function() {
      runMigrations('0 - 3', false, new Set());
      chai.assert.isTrue(this.logStub.calledWith('No available migrations'));
    });

    test('Range', function() {
      const stub1 = sinon.stub();
      const stub2 = sinon.stub();
      const stub3 = sinon.stub();
      const stub4 = sinon.stub();
      addMigration('1.9.9', 'test1', false, 'description1', stub1);
      addMigration('2.0.0', 'test2', false, 'description2', stub2);
      addMigration('2.9.9', 'test3', false, 'description3', stub3);
      addMigration('3.0.0', 'test4', false, 'description4', stub4);
      runMigrations('>1.9.9 <=2', false, new Set());
      chai.assert.isTrue(stub1.notCalled);
      chai.assert.isTrue(stub2.calledOnce);
      chai.assert.isTrue(stub3.calledOnce);
      chai.assert.isTrue(stub4.notCalled);
    });

    test('Only required', function() {
      const stub1 = sinon.stub();
      const stub2 = sinon.stub();
      const stub3 = sinon.stub();
      addMigration('1', 'test1', false, 'description1', stub1);
      addMigration('2', 'test2', true, 'description2', stub2);
      addMigration('3', 'test3', false, 'description3', stub3);
      runMigrations('0 - 3', true, new Set());
      chai.assert.isTrue(stub1.notCalled);
      chai.assert.isTrue(stub2.calledOnce);
      chai.assert.isTrue(stub3.notCalled);
    });

    test('Only from set', function() {
      const stub1 = sinon.stub();
      const stub2 = sinon.stub();
      const stub3 = sinon.stub();
      addMigration('1', 'test1', false, 'description1', stub1);
      addMigration('2', 'test2', false, 'description2', stub2);
      addMigration('3', 'test3', false, 'description3', stub3);
      runMigrations('0 - 3', false, new Set(['test1', 'test3']));
      chai.assert.isTrue(stub1.calledOnce);
      chai.assert.isTrue(stub2.notCalled);
      chai.assert.isTrue(stub3.calledOnce);
    });

    test('Only required from set', function() {
      const stub1 = sinon.stub();
      const stub2 = sinon.stub();
      const stub3 = sinon.stub();
      addMigration('1', 'test1', true, 'description1', stub1);
      addMigration('2', 'test2', false, 'description2', stub2);
      addMigration('3', 'test3', false, 'description3', stub3);
      runMigrations('0 - 3', true, new Set(['test1', 'test3']));
      chai.assert.isTrue(stub1.calledOnce);
      chai.assert.isTrue(stub2.notCalled);
      chai.assert.isTrue(stub3.notCalled);
    });

    test('Out of order', function() {
      const stub1 = sinon.stub();
      const stub2 = sinon.stub();
      const stub3 = sinon.stub();
      addMigration('3', 'test3', false, 'description3', stub3);
      addMigration('2', 'test2', false, 'description2', stub2);
      addMigration('1', 'test1', true, 'description1', stub1);
      runMigrations('0 - 3', false, new Set());
      chai.assert.isTrue(stub1.calledBefore(stub2));
      chai.assert.isTrue(stub2.calledBefore(stub3));
      chai.assert.isTrue(stub3.calledOnce);
    });
  });

  suite('showVersionHelp', function() {
    test('Bad version', function() {
      showVersionHelp('a');
      chai.assert.isTrue(this.logStub.calledWith('Invalid version: a'));
    });

    test('No migrations', function() {
      addMigration('1', 'test1', false, 'description1', () => {});
      addMigration('2', 'test2', false, 'description2', () => {});
      addMigration('3', 'test3', false, 'description3', () => {});
      showVersionHelp('4');
      chai.assert.isTrue(this.logStub.calledWith('Version 4 not found'));
      chai.assert.isTrue(
          this.logStub.calledWith('Available versions: 1.0.0, 2.0.0, 3.0.0'));
    });

    test('All versions in range', function() {
      addMigration('1.1', 'test1', false, 'description1', () => {});
      addMigration('1.2', 'test2', false, 'description2', () => {});
      addMigration('2', 'test3', false, 'description3', () => {});
      showVersionHelp('1');
      chai.assert.isTrue(this.logStub.calledWith('1.1.0:'));
      chai.assert.isTrue(this.logStub.calledWith('1.2.0:'));
      chai.assert.isTrue(this.logStub.neverCalledWith('2.0.0:'));
    });
  });
});
