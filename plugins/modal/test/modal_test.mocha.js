/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Unit tests for a Blockly Modal.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

const assert = require('assert');
const Blockly = require('blockly/node');
const sinon = require('sinon');

const Modal = require('../src/index.js').Modal;

suite('Modal', () => {
  setup(() => {
    this.jsdomCleanup =
        require('jsdom-global')('<!DOCTYPE html><div id="blocklyDiv"></div>');
    this.workspace = Blockly.inject('blocklyDiv', {});
    this.modal = new Modal('Title', this.workspace);
  });

  teardown(() => {
    this.jsdomCleanup();
    sinon.restore();
  });

  suite('init()', () => {
    test('Calls render', () => {
      this.modal.render = sinon.fake();
      this.modal.init();
      sinon.assert.calledOnce(this.modal.render);
    });
  });

  suite('show()', () => {
    test('Elements focused', () => {
      this.modal.init();
      this.modal.show();
      assert.equal('blocklyModalBtn blocklyModalBtnClose',
          this.modal.firstFocusableEl_.className, 'first element');
      assert.equal('blocklyModalBtn blocklyModalBtnClose',
          this.modal.lastFocusableEl_.className, 'last element');
    });
  });

  suite('dispose()', () => {
    test('Events and button callback removed', () => {
      this.modal.init();
      const numEvents = this.modal.boundEvents_.length;
      Blockly.unbindEvent_ = sinon.fake();
      this.modal.dispose();

      assert.equal(document.querySelector('.blocklyModalOverlay'), null);
      sinon.assert.callCount(Blockly.unbindEvent_, numEvents);
    });
  });

  suite('handleKeyDown()', () => {
    setup(() => {
      this.modal.init();
      this.modal.show();
    });
    /**
     * Make a fake event.
     * @param {number} keyCode The keycode to use for the event.
     * @param {boolean} shift True if we want to emulate hitting the shift key.
     *    False otherwise.
     * @return {Object} A fake event.
     */
    function makeEvent(keyCode, shift) {
      const event = {
        keyCode: keyCode,
        shiftKey: shift,
      };
      event.stopPropagation = sinon.fake();
      event.preventDefault = sinon.fake();
      return event;
    }
    test('Tab pressed with only one element', () => {
      const event = makeEvent(Blockly.utils.KeyCodes.TAB, false);
      this.modal.handleForwardTab_ = sinon.fake();
      this.modal.handleKeyDown_(event);
      sinon.assert.notCalled(this.modal.handleForwardTab_);
    });
    test('Shift tab pressed with only one element', () => {
      const event = makeEvent(Blockly.utils.KeyCodes.TAB, true);
      this.modal.handleBackwardTab_ = sinon.fake();
      this.modal.handleKeyDown_(event);
      sinon.assert.notCalled(this.modal.handleBackwardTab_);
    });
    test('Escape pressed', () => {
      const event = makeEvent(Blockly.utils.KeyCodes.ESC, false);
      this.modal.hide = sinon.fake();
      this.modal.handleKeyDown_(event);
      assert(this.modal.hide.calledOnce);
    });
  });
});
