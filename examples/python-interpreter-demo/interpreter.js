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

/**
 * Create a new interpreter.
 * @param {string|!Object} code Raw JavaScript text or AST.
 * @param {Function=} opt_initFunc Optional initialization function.  Used to
 *     define APIs.  When called it is passed the interpreter object and the
 *     global scope object.
 * @constructor
 */
var Interpreter = function Interpreter(code, opt_initFunc) {
  this.isBootstrapped_ = false;
  this.code_ = code;
  this.globalScope_ = {};
  this.initFunc_ = opt_initFunc;
  this.initGlobal(this.globalScope_);
};

/**
 * Create a new native asynchronous function.
 * @param {!Function} callbackFunc JavaScript function.
 * @returns {!Function} New function.
 */
Interpreter.prototype.createAsyncFunction = function (callbackFunc) {
  return function () {
    var args = new Array(arguments.length);
    for (var _key = 0; _key < arguments.length; _key++) {
      args[_key] = arguments[_key];
    }
    return new Promise(function (resolve) {
      callbackFunc.apply(void 0, args.concat([resolve]));
    });
  };
};

/**
 * Create a new native function.
 * @param {!Function} nativeFunc JavaScript function.
 * @returns {!Function} New function.
 */
Interpreter.prototype.createNativeFunction = function (nativeFunc) {
  return nativeFunc;
};

/**
 * Set a property value on a data object.
 * @param {Object} obj Data object.
 * @param {string} name Name of property.
 * @param {Function} value New property value.
 */
Interpreter.prototype.setProperty = function (obj, name, value) {
  if (name.match(/^\w+$/) === null) {
    throw new Error('Property name contains invalid characters: ' + name);
  }
  if (name in obj) {
    throw new Error('Property already exists: ' + name);
  }
  obj[name] = value;
};

/**
 * Initialize the global object with buitin properties and functions.
 * @param {!Object} globalObject Global object.
 */
Interpreter.prototype.initGlobal = function (globalObject) {
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
Interpreter.prototype.run = function () {
  this.bootstrapAndRun_();
  return !this.finished_;
};

/**
 * Execute one step of the interpreter.
 * @returns {boolean} True if a step was executed, false if no more instructions.
 */
Interpreter.prototype.step = function () {
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
Interpreter.prototype.abort = function () {
  if (this.paused_ && this.abort_) {
    this.paused_ = false;
    this.finished_ = true;
    this.abort_();
  }
};
Interpreter.prototype.bootstrapAndRun_ = function () {
  var _this = this;
  if (!this.isBootstrapped_) {
    this.isBootstrapped_ = true;
    this.finished_ = false;
    this.paused_ = false;
    if (typeof Worker !== "undefined") {
      if (!worker) {
        worker = new Worker("./interpreter-worker.js");
      }
      worker.onmessage = function (event) {
        if (event.data.name === "interpreter$done_") {
          _this.done_();
        } else if (_this.globalScope_[event.data.name]) {
          Promise.resolve(_this.globalScope_[event.data.name].apply(void 0, event.data.args)).then(function (result) {
            event.ports[0].postMessage({ result });
          });
        }
      };
      worker.postMessage({
        code: this.code_,
        ffi: Object.keys(_this.globalScope_)
      });
    } else {
      globalThis["interpreter$ffiImpl"] = function () {
        return _this.globalScope_;
      };
      globalThis["interpreter$ffi"] = function () {
        return Object.keys(_this.globalScope_);
      };
      var pythonCode = [
        'import js',
        'for name in list(getattr(js, "interpreter$ffi")()):',
        '  globals()[name] = getattr(getattr(js, "interpreter$ffiImpl")(), name)',
        this.code_
      ];
      if (!micropythonPromise) {
        micropythonPromise = loadMicropython_();
      }
      micropythonPromise.then(function (interpreter) {
        Promise.resolve(interpreter.runPythonAsync(pythonCode.join('\n'))).then(_this.done_.bind(_this));
      });
    }
  }
};
Interpreter.prototype.breakpoint_ = function () {
  var _this = this;
  if (this.isBootstrapped_ && !this.finished_ && !this.paused_) {
    this.paused_ = true;
    return new Promise(function (resolve, reject) {
      _this.resume_ = resolve;
      _this.abort_ = reject;
    });
  }
};
Interpreter.prototype.done_ = function () {
  this.finished_ = true;
  this.paused_ = false;
  this.resume_ = null;
  this.abort_ = null;
};
var worker;
var micropythonPromise;
function loadMicropython_() {
  var INTERPRETER_BASE_PATH = "./node_modules/@micropython/micropython-webassembly-pyscript";
  return new Promise(function (resolve) {
    import(INTERPRETER_BASE_PATH + "/micropython.mjs").then(function (module) {
      module.loadMicroPython({
        url: INTERPRETER_BASE_PATH + "/micropython.wasm"
      }).then(function (interpreter) {
        resolve(interpreter);
      });
    });
  });
}