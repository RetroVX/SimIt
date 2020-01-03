// A type of promise-like that resolves synchronously and supports only one observer
const _Pact = /*#__PURE__*/(function() {
	function _Pact() {}
	_Pact.prototype.then = function(onFulfilled, onRejected) {
		const result = new _Pact();
		const state = this.s;
		if (state) {
			const callback = state & 1 ? onFulfilled : onRejected;
			if (callback) {
				try {
					_settle(result, 1, callback(this.v));
				} catch (e) {
					_settle(result, 2, e);
				}
				return result;
			} else {
				return this;
			}
		}
		this.o = function(_this) {
			try {
				const value = _this.v;
				if (_this.s & 1) {
					_settle(result, 1, onFulfilled ? onFulfilled(value) : value);
				} else if (onRejected) {
					_settle(result, 1, onRejected(value));
				} else {
					_settle(result, 2, value);
				}
			} catch (e) {
				_settle(result, 2, e);
			}
		};
		return result;
	};
	return _Pact;
})();

// Settles a pact synchronously
function _settle(pact, state, value) {
	if (!pact.s) {
		if (value instanceof _Pact) {
			if (value.s) {
				if (state & 1) {
					state = value.s;
				}
				value = value.v;
			} else {
				value.o = _settle.bind(null, pact, state);
				return;
			}
		}
		if (value && value.then) {
			value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
			return;
		}
		pact.s = state;
		pact.v = value;
		const observer = pact.o;
		if (observer) {
			observer(pact);
		}
	}
}

function _isSettledPact(thenable) {
	return thenable instanceof _Pact && thenable.s & 1;
}

// Asynchronously iterate through an object that has a length property, passing the index as the first argument to the callback (even as the length property changes)
function _forTo(array, body, check) {
	var i = -1, pact, reject;
	function _cycle(result) {
		try {
			while (++i < array.length && (!check || !check())) {
				result = body(i);
				if (result && result.then) {
					if (_isSettledPact(result)) {
						result = result.v;
					} else {
						result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
						return;
					}
				}
			}
			if (pact) {
				_settle(pact, 1, result);
			} else {
				pact = result;
			}
		} catch (e) {
			_settle(pact || (pact = new _Pact()), 2, e);
		}
	}
	_cycle();
	return pact;
}

const _iteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator"))) : "@@iterator";

// Asynchronously iterate through an object's values
// Uses for...of if the runtime supports it, otherwise iterates until length on a copy
function _forOf(target, body, check) {
	if (typeof target[_iteratorSymbol] === "function") {
		var iterator = target[_iteratorSymbol](), step, pact, reject;
		function _cycle(result) {
			try {
				while (!(step = iterator.next()).done && (!check || !check())) {
					result = body(step.value);
					if (result && result.then) {
						if (_isSettledPact(result)) {
							result = result.v;
						} else {
							result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
							return;
						}
					}
				}
				if (pact) {
					_settle(pact, 1, result);
				} else {
					pact = result;
				}
			} catch (e) {
				_settle(pact || (pact = new _Pact()), 2, e);
			}
		}
		_cycle();
		if (iterator.return) {
			var _fixup = function(value) {
				try {
					if (!step.done) {
						iterator.return();
					}
				} catch(e) {
				}
				return value;
			};
			if (pact && pact.then) {
				return pact.then(_fixup, function(e) {
					throw _fixup(e);
				});
			}
			_fixup();
		}
		return pact;
	}
	// No support for Symbol.iterator
	if (!("length" in target)) {
		throw new TypeError("Object is not iterable");
	}
	// Handle live collections properly
	var values = [];
	for (var i = 0; i < target.length; i++) {
		values.push(target[i]);
	}
	return _forTo(values, function(i) { return body(values[i]); }, check);
}

const _asyncIteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator"))) : "@@asyncIterator";

// Asynchronously implement a generic for loop
function _for(test, update, body) {
	var stage;
	for (;;) {
		var shouldContinue = test();
		if (_isSettledPact(shouldContinue)) {
			shouldContinue = shouldContinue.v;
		}
		if (!shouldContinue) {
			return result;
		}
		if (shouldContinue.then) {
			stage = 0;
			break;
		}
		var result = body();
		if (result && result.then) {
			if (_isSettledPact(result)) {
				result = result.s;
			} else {
				stage = 1;
				break;
			}
		}
		if (update) {
			var updateValue = update();
			if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
				stage = 2;
				break;
			}
		}
	}
	var pact = new _Pact();
	var reject = _settle.bind(null, pact, 2);
	(stage === 0 ? shouldContinue.then(_resumeAfterTest) : stage === 1 ? result.then(_resumeAfterBody) : updateValue.then(_resumeAfterUpdate)).then(void 0, reject);
	return pact;
	function _resumeAfterBody(value) {
		result = value;
		do {
			if (update) {
				updateValue = update();
				if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
					updateValue.then(_resumeAfterUpdate).then(void 0, reject);
					return;
				}
			}
			shouldContinue = test();
			if (!shouldContinue || (_isSettledPact(shouldContinue) && !shouldContinue.v)) {
				_settle(pact, 1, result);
				return;
			}
			if (shouldContinue.then) {
				shouldContinue.then(_resumeAfterTest).then(void 0, reject);
				return;
			}
			result = body();
			if (_isSettledPact(result)) {
				result = result.v;
			}
		} while (!result || !result.then);
		result.then(_resumeAfterBody).then(void 0, reject);
	}
	function _resumeAfterTest(shouldContinue) {
		if (shouldContinue) {
			result = body();
			if (result && result.then) {
				result.then(_resumeAfterBody).then(void 0, reject);
			} else {
				_resumeAfterBody(result);
			}
		} else {
			_settle(pact, 1, result);
		}
	}
	function _resumeAfterUpdate() {
		if (shouldContinue = test()) {
			if (shouldContinue.then) {
				shouldContinue.then(_resumeAfterTest).then(void 0, reject);
			} else {
				_resumeAfterTest(shouldContinue);
			}
		} else {
			_settle(pact, 1, result);
		}
	}
}

/**
 * @author Conor Irwin <https://github.com/RetroVX> 
 * @license {@link http://opensource.org/licenses/MIT|MIT License}
 * @classdesc
 * Simulate keyboard and mouse events in the browser
 * @class SimIt
 * @version 1.0.0
 * @example
 * const simit = new SimIt();
 * 
 * simit.click(150, 150);
 */
var SimIt = function SimIt(element) {
  /**
   * Set the element to simulate keyboard/mouse events on. Defaults to window
   * @name SimIt.element
   */
  this.element = element || window || document;
};
/**
 * Runs through a sequence of steps in an asynchronous manner.
 * This can be a sequence of any supported keyboard/mouse events and callbacks.
 * @method SimIt.all
 * @async
 * @param {array} sequence - an array of objects containing the steps needed to simulate
 * @param {function} [onStart] - callback function that runs once the sequence is starting
 * @param {function} [onComplete] - callback function that runs once the sequence has completed
 * @example
 * simit.all([
 *   { keydown: 's' },
 *   { keyup: 'i' },
 *   { keypress: 'm' },
 *   { sleep: 1000 },
 *   { keydown: 'i' },
 *   { keydown: 't' }
 * ], onStart, onComplete);
 */


SimIt.prototype.all = function all (sequence, onStart, onComplete) {
  try {
    var _this = this;

    if (onStart === undefined || onStart === null) {
      onStart = function () {};
    }

    if (onComplete === undefined || onComplete === null) {
      onComplete = function () {};
    }

    onStart(sequence);
    var length = sequence.length;
    var stepCounter = 0;

    var _temp = _forOf(sequence, function (step) {
      stepCounter++;
      return Promise.resolve(_this._checkEvent(step)).then(function () {
        if (stepCounter === length) {
          onComplete(sequence);
        }
      }); // sequence has finished
    });

    return Promise.resolve(_temp && _temp.then ? _temp.then(function () {}) : void 0);
  } catch (e) {
    return Promise.reject(e);
  }
};
/**
 * Repeats a simulated event
 * @method SimIt.repeat
 * @async
 * @param {object} step - the step to simulate and repeat
 * @param {number} [amount=1] - how many times should the event be repeated?
 * @param {number} [delay=0] - how big the delay should be inbetween each repeated event
 * @example
 * // click at x 150, y 250, 10 times with a 500ms delay between each click
 * simit.repeat({ click: { x: 150, y: 250 } }, 10, 500);
 */


SimIt.prototype.repeat = function repeat (step, amount, delay) {
  try {
    var _this2 = this;

    if (amount === undefined || amount === null) {
      amount = 1;
    }

    if (delay === undefined || delay === null) {
      delay = 0;
    }

    var i = 0;

    var _temp2 = _for(function () {
      return i < amount;
    }, function () {
      return i++;
    }, function () {
      return Promise.resolve(_this2.sleep(delay)).then(function () {
        return Promise.resolve(_this2._checkEvent(step)).then(function () {});
      });
    });

    return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
  } catch (e) {
    return Promise.reject(e);
  }
};
/**
 * Delays the next step in a sequence by x ms
 * @method SimIt.sleep
 * @param {number} ms - milliseconds to delay by (1000 = 1 second)
 * @example
 * async function Hello() {
 *   await simit.sleep(1000);
 *   console.log('I will run after 1 second');
 * }
 * Hello();
 */


SimIt.prototype.sleep = function sleep (ms) {
  return new Promise(function (resolve) { return setTimeout(resolve, ms); });
};
/**
 * Simulates a click event on the selected element or window
 * @method SimIt.click
 * @param {number} x - the clientX position to click
 * @param {number} y - the clientY position to click
 * @example
 * simit.click(150, 250);
 */


SimIt.prototype.click = function click (x, y) {
  return this.element.dispatchEvent(new MouseEvent('click', {
    'clientX': x || 0,
    'clientY': y || 0
  }));
};
/**
 * Simulates the keydown event on the selected element or window
 * @method SimIt.keydown
 * @param {string} key - the key string to simulate
 * @example
 * simit.keydown('a');
 */


SimIt.prototype.keydown = function keydown (key) {
  return this.element.dispatchEvent(new KeyboardEvent('keydown', {
    'key': key || undefined
  }));
};
/**
 * Simulates the keyup event on the selected element or window
 * @method SimIt.keyup
 * @param {string} key - the key string to simulate
 * @example
 * simit.keyup('b');
 */


SimIt.prototype.keyup = function keyup (key) {
  return this.element.dispatchEvent(new KeyboardEvent('keyup', {
    'key': key || undefined
  }));
};
/**
 * Simulates the keypress event on the selected element or window
 * @method SimIt.keypress
 * @param {string} key - the key string to simulate
 * @example
 * simit.keypress('c');
 */


SimIt.prototype.keypress = function keypress (key) {
  return this.element.dispatchEvent(new KeyboardEvent('keypress', {
    'key': key || undefined
  }));
};
/**
 * Set the element to simulate with.
 * This method is chainable with every other method.
 * @method SimIt.setElement
 * @param {HTMLElement} element - the element to simulate with
 * @example
 * const element = document.querySelector('myElement');
 * simit.setElement(element);
 * 
 * simit.setElement(element).repeat({ keydown: 't' }, 5);
 */


SimIt.prototype.setElement = function setElement (element) {
  this.element = element;
  return this;
};
/**
 * Internal method used during SimIt.all and SimIt.repeat.
 * Checks which type of event is needed and dispatches it.
 * @method SimIt._checkEvent
 * @async
 * @param {object} obj - the step object to check
 */


SimIt.prototype._checkEvent = function _checkEvent (obj) {
  try {
    var _this3 = this;

    var _temp9 = function () {
      if (obj.keydown) {
        _this3.keydown(obj.keydown);
      } else {
        var _temp8 = function () {
          if (obj.keyup) {
            _this3.keyup(obj.keyup);
          } else {
            var _temp7 = function () {
              if (obj.keypress) {
                _this3.keypress(obj.keypress);
              } else {
                var _temp6 = function () {
                  if (obj.click) {
                    _this3.click(obj.click.x, obj.click.y);
                  } else {
                    var _temp5 = function () {
                      if (obj.sleep) {
                        return Promise.resolve(_this3.sleep(obj.sleep)).then(function () {});
                      } else {
                        var _temp4 = function () {
                          if (obj.callback) {
                            return Promise.resolve(obj.callback()).then(function () {});
                          } else {
                            var _temp3 = function () {
                              if (obj.repeat) {
                                return Promise.resolve(_this3.repeat(obj.repeat.event, obj.repeat.amount, obj.repeat.delay)).then(function () {});
                              }
                            }();

                            if (_temp3 && _temp3.then) { return _temp3.then(function () {}); }
                          }
                        }();

                        if (_temp4 && _temp4.then) { return _temp4.then(function () {}); }
                      }
                    }();

                    if (_temp5 && _temp5.then) { return _temp5.then(function () {}); }
                  }
                }();

                if (_temp6 && _temp6.then) { return _temp6.then(function () {}); }
              }
            }();

            if (_temp7 && _temp7.then) { return _temp7.then(function () {}); }
          }
        }();

        if (_temp8 && _temp8.then) { return _temp8.then(function () {}); }
      }
    }();

    return Promise.resolve(_temp9 && _temp9.then ? _temp9.then(function () {}) : void 0);
  } catch (e) {
    return Promise.reject(e);
  }
};

module.exports = SimIt;
//# sourceMappingURL=simit.js.map
