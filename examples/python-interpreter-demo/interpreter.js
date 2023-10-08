/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

/**
 * @fileoverview Interpreting Python in JavaScript.
 * @author zoeyli@google.com (Zoey Li)
 */

var XWorker;

import('https://esm.sh/polyscript@0.4.11').then(
  module => { XWorker = module.XWorker; }
);

/**
 * Create a new interpreter.
 * @param {string|!Object} code Raw JavaScript text or AST.
 * @param {Function=} opt_initFunc Optional initialization function.  Used to
 *     define APIs.  When called it is passed the interpreter object and the
 *     global scope object.
 * @constructor
 */
var Interpreter = function(code, opt_initFunc) {
  this.code_ = code;
  this.globalScope_ = {};
  this.initFunc_ = opt_initFunc;
  this.initGlobal(this.globalScope_);
};

/**
 * Create a new native asynchronous function.
 * @param {!Function} asyncFunc JavaScript function.
 * @returns {!Function} New function.
 */
Interpreter.prototype.createAsyncFunction = function(asyncFunc) {
  return (...args) => {
    return new Promise((resolve) => {
      asyncFunc(...args, resolve);
    });
  };
}

/**
 * Create a new native function.
 * @param {!Function} nativeFunc JavaScript function.
 * @returns {!Function} New function.
 */
Interpreter.prototype.createNativeFunction = function(nativeFunc) {
  return nativeFunc;
};

/**
 * Set a property value on a data object.
 * @param {Object} obj Data object.
 * @param {string} name Name of property.
 * @param {Function} value New property value.
 */
Interpreter.prototype.setProperty = function(obj, name, value) {
  if(name.match(/^\w+$/) === null) {
    throw new Error('Property name contains invalid characters: ' + name);
  }
  if (name in obj) {
    throw new Error('Property already exists: ' + name);
  }
  obj[name] = value;
}

/**
 * Initialize the global object with buitin properties and functions.
 * @param {!Object} globalObject Global object.
 */
Interpreter.prototype.initGlobal = function(globalObject) {
  this.setProperty(globalObject, 'breakpoint', this.breakpoint_.bind(this));
  // Run any user-provided initialization.
  if (this.initFunc_) {
    this.initFunc_(this, globalObject);
  }
};

/**
 * Executes the program.
 * @returns {boolean} True if a execution is asynchronously blocked,
 *     false if no more instructions.
 */
Interpreter.prototype.run = function() {
  this.bootstrapAndRun_();
  return !this.finished_;
};

/**
 * Execute one step of the interpreter.
 * @returns {boolean} True if a step was executed, false if no more instructions.
 */
Interpreter.prototype.step = function() {
  this.bootstrapAndRun_();
  if (this.paused_ && this.resume_) {
    this.paused_ = false;
    this.resume_();
  }
  return !this.finished_;
};

/**
 * Aborts the current execution.
 */
Interpreter.prototype.abort = function() {
  if (this.paused_ && this.abort_) {
    this.paused_ = false;
    this.finished_ = true;
    this.abort_();
  }
};

Interpreter.prototype.bootstrapAndRun_ = function() {
  if (!this.worker_) {
    this.finished_ = false;
    this.paused_ = false;
    var workerCode = [
      'from polyscript import xworker',
      'for name in getattr(xworker.sync, "interpreter.globalFuncs")():',
      '  globals()[name] = getattr(xworker.sync, name)',
      this.code_,
      'import js',
      'js.postMessage(0)',
    ];

    this.worker_ = XWorker(
      URL.createObjectURL(
        new Blob([workerCode.join('\n')], { type: "text/plain" }),
      ),
      { type: "micropython" },
    );

    for (var name in this.globalScope_) {
      this.worker_.sync[name] = this.globalScope_[name];
    }

    this.worker_.sync["interpreter.globalFuncs"] = () => Object.keys(this.globalScope_);
    this.worker_.addEventListener("message", this.done_.bind(this));
  }
}

Interpreter.prototype.breakpoint_ = function() {
  if (this.worker_ && !this.finished_ && !this.paused_) {
    this.paused_ = true;
    return new Promise((resolve, reject) => {
      this.resume_ = resolve;
      this.abort_ = reject;
    });
  }
};

Interpreter.prototype.done_ = function() {
  this.finished_ = true;
  this.paused_ = false;
  this.resume_ = null;
  this.abort_ = null;
}
