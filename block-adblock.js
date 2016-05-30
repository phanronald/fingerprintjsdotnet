/// <reference path="js/interfaces/iblockadblockoptions.ts" />
var Block;
(function (Block) {
    var Adblock = (function () {
        function Adblock(options) {
            var _this = this;
            this.setOption = function (options) {
                for (var option in options) {
                    var currentOption = options[option];
                    _this.options[option] = currentOption;
                    if (_this.options.DebugMode) {
                        _this.logEvent('setOption', 'The option "' + option + '" was assigned to "' + currentOption + '"');
                    }
                }
            };
            this.addEvent = function (detected, fn) {
                var currentEvent = detected ? _this.settings.Event.Detected : _this.settings.Event.NotDetected;
                currentEvent.push(fn);
                if (_this.options.DebugMode) {
                    _this.logEvent('addEvent', 'A type of event "' + (detected ? 'detected' : 'notDetected') + '" was added');
                }
            };
            this.onDetected = function (fn) {
                _this.addEvent(true, fn);
            };
            this.onNotDetected = function (fn) {
                _this.addEvent(false, fn);
            };
            this.init = function () {
                _this.options = {
                    CheckOnLoad: false,
                    ResetOnEnd: false,
                    LoopCheckTime: 50,
                    LoopMaxNumber: 5,
                    BaitClass: '',
                    BaitStyle: '',
                    DebugMode: false
                };
                var eventSettings = { Detected: [], NotDetected: [] };
                _this.settings = {
                    Version: '3.2.0',
                    Bait: null,
                    Checking: false,
                    Loop: null,
                    LoopNumber: 0,
                    Event: eventSettings
                };
            };
            this.createBait = function () {
                var bait = document.createElement('div');
                bait.setAttribute('class', _this.options.BaitClass);
                bait.setAttribute('style', _this.options.BaitStyle);
                _this.settings.Bait = {
                    BaitNode: window.document.body.appendChild(bait),
                    OffsetHeight: 0,
                    OffsetWidth: 0,
                    OffsetLeft: 0,
                    OffsetTop: 0,
                    ClientHeight: 0,
                    ClientWidth: 0,
                    OffsetParent: null
                };
            };
            this.destroyBait = function () {
                window.document.body.removeChild(_this.settings.Bait.BaitNode);
                _this.settings.Bait = null;
                if (_this.options.DebugMode) {
                    _this.logEvent('destroyBait', 'Bait has been removed');
                }
            };
            this.check = function (loop) {
                if (loop === undefined) {
                    loop = true;
                }
                if (_this.options.DebugMode) {
                    _this.logEvent('check', 'An audit was requested ' + (loop ? ' with a ' : 'without') + ' loop');
                }
                if (_this.settings.Checking && _this.options.DebugMode) {
                    _this.logEvent('check', 'A check was cancelled because there is already an ongoing one');
                    return false;
                }
                _this.settings.Checking = true;
                if (_this.settings.Bait === null) {
                    _this.createBait();
                }
                _this.settings.LoopNumber = 0;
                if (loop) {
                    _this.settings.Loop = setInterval(function () {
                        _this.checkBait(loop);
                    }, _this.options.LoopCheckTime);
                }
                setTimeout(function () {
                    _this.checkBait(loop);
                }, 1);
                if (_this.options.DebugMode) {
                    _this.logEvent('check', 'A check is in progress ... ');
                }
                return true;
            };
            this.checkBait = function (loop) {
                var detected = false;
                if (_this.settings.Bait === null) {
                    _this.createBait();
                }
                var detectedAdp = window.document.body.getAttribute('adp') != null ||
                    _this.settings.Bait.OffsetParent === null || _this.settings.Bait.OffsetHeight == 0 ||
                    _this.settings.Bait.OffsetLeft == 0 || _this.settings.Bait.OffsetTop == 0 ||
                    _this.settings.Bait.OffsetWidth == 0 || _this.settings.Bait.ClientHeight == 0 ||
                    _this.settings.Bait.ClientWidth == 0;
                detected = detectedAdp;
                if (window.getComputedStyle !== undefined) {
                    var baitTemp = window.getComputedStyle(_this.settings.Bait.BaitNode, null);
                    detected = baitTemp.getPropertyValue('display') == 'none' || baitTemp.getPropertyValue('visibility') == 'hidden';
                }
                if (_this.options.DebugMode) {
                    _this.logEvent('checkBait', 'A check (' + (_this.settings.LoopNumber + 1) + '/' +
                        _this.options.LoopMaxNumber + ' ~' + (1 + _this.settings.LoopNumber * _this.options.LoopCheckTime) +
                        'ms) was conducted and detection is ' + (detected ? 'positive' : 'negative'));
                }
                if (loop) {
                    _this.settings.LoopNumber++;
                    if (_this.settings.LoopNumber >= _this.options.LoopMaxNumber) {
                        _this.stopLoop();
                    }
                }
                if (detected) {
                    _this.stopLoop();
                    _this.destroyBait();
                    _this.emitEvent(true);
                    if (loop) {
                        _this.settings.Checking = false;
                    }
                }
                else if (!loop) {
                    _this.destroyBait();
                    _this.emitEvent(false);
                    if (loop) {
                        _this.settings.Checking = false;
                    }
                }
                if (window.getComputedStyle !== undefined) {
                    var baitTemp = window.getComputedStyle(_this.settings.Bait.BaitNode, null);
                    if (baitTemp.getPropertyValue('display') == 'none' || baitTemp.getPropertyValue('visibility') == 'hidden') {
                        detected = true;
                    }
                }
            };
            this.stopLoop = function () {
                clearInterval(_this.settings.Loop);
                _this.settings.Loop = null;
                _this.settings.LoopNumber = 0;
                if (_this.options.DebugMode) {
                    _this.logEvent('stopLoop', 'A loop has been stopped');
                }
            };
            this.emitEvent = function (detected) {
                if (_this.options.DebugMode) {
                    _this.logEvent('emitEvent', 'An event with a ' + (detected ? 'positive' : 'negative') + ' detection was called');
                }
                var fns = detected ? _this.settings.Event.Detected : _this.settings.Event.NotDetected;
                for (var i in fns) {
                    if (_this.options.DebugMode) {
                        _this.logEvent('emitEvent', 'Call function ' + (parseInt(i) + 1) + '/' + fns.length);
                    }
                    if (fns.hasOwnProperty(i)) {
                        fns[i]();
                    }
                }
                if (_this.options.ResetOnEnd) {
                    _this.clearEvent();
                }
            };
            this.clearEvent = function () {
                _this.settings.Event.Detected = [];
                _this.settings.Event.NotDetected = [];
                if (_this.options.DebugMode) {
                    _this.logEvent('clearEvent', 'This event list has been cleared');
                }
            };
            this.logEvent = function (method, message) {
                console.log('[BlockAdblock][' + method + '] ' + message);
            };
            this.init();
            if (options !== undefined) {
                this.setOption(options);
            }
        }
        return Adblock;
    }());
    Block.Adblock = Adblock;
})(Block || (Block = {}));
//# sourceMappingURL=block-adblock.js.map