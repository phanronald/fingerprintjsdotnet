/// <reference path="js/interfaces/iblockadblockoptions.ts" />
var Block;
(function (Block) {
    class Adblock {
        constructor(options) {
            this.setOption = (options) => {
                for (var option in options) {
                    let currentOption = options[option];
                    this.options[option] = currentOption;
                    if (this.options.DebugMode) {
                        this.logEvent('setOption', 'The option "' + option + '" was assigned to "' + currentOption + '"');
                    }
                }
            };
            this.addEvent = (detected, fn) => {
                let currentEvent = detected ? this.settings.Event.Detected : this.settings.Event.NotDetected;
                currentEvent.push(fn);
                if (this.options.DebugMode) {
                    this.logEvent('addEvent', 'A type of event "' + (detected ? 'detected' : 'notDetected') + '" was added');
                }
            };
            this.onDetected = (fn) => {
                this.addEvent(true, fn);
            };
            this.onNotDetected = (fn) => {
                this.addEvent(false, fn);
            };
            this.init = () => {
                this.options = {
                    CheckOnLoad: false,
                    ResetOnEnd: false,
                    LoopCheckTime: 50,
                    LoopMaxNumber: 5,
                    BaitClass: '',
                    BaitStyle: '',
                    DebugMode: false
                };
                let eventSettings = { Detected: [], NotDetected: [] };
                this.settings = {
                    Version: '3.2.0',
                    Bait: null,
                    Checking: false,
                    Loop: null,
                    LoopNumber: 0,
                    Event: eventSettings
                };
            };
            this.createBait = () => {
                let bait = document.createElement('div');
                bait.setAttribute('class', this.options.BaitClass);
                bait.setAttribute('style', this.options.BaitStyle);
                this.settings.Bait = {
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
            this.destroyBait = () => {
                window.document.body.removeChild(this.settings.Bait.BaitNode);
                this.settings.Bait = null;
                if (this.options.DebugMode) {
                    this.logEvent('destroyBait', 'Bait has been removed');
                }
            };
            this.check = (loop) => {
                if (loop === undefined) {
                    loop = true;
                }
                if (this.options.DebugMode) {
                    this.logEvent('check', 'An audit was requested ' + (loop ? ' with a ' : 'without') + ' loop');
                }
                if (this.settings.Checking && this.options.DebugMode) {
                    this.logEvent('check', 'A check was cancelled because there is already an ongoing one');
                    return false;
                }
                this.settings.Checking = true;
                if (this.settings.Bait === null) {
                    this.createBait();
                }
                this.settings.LoopNumber = 0;
                if (loop) {
                    this.settings.Loop = setInterval(() => {
                        this.checkBait(loop);
                    }, this.options.LoopCheckTime);
                }
                setTimeout(() => {
                    this.checkBait(loop);
                }, 1);
                if (this.options.DebugMode) {
                    this.logEvent('check', 'A check is in progress ... ');
                }
                return true;
            };
            this.checkBait = (loop) => {
                let detected = false;
                if (this.settings.Bait === null) {
                    this.createBait();
                }
                let detectedAdp = window.document.body.getAttribute('adp') != null ||
                    this.settings.Bait.OffsetParent === null || this.settings.Bait.OffsetHeight == 0 ||
                    this.settings.Bait.OffsetLeft == 0 || this.settings.Bait.OffsetTop == 0 ||
                    this.settings.Bait.OffsetWidth == 0 || this.settings.Bait.ClientHeight == 0 ||
                    this.settings.Bait.ClientWidth == 0;
                detected = detectedAdp;
                //if (window.getComputedStyle !== undefined) {
                //	let baitTemp = window.getComputedStyle(this.settings.Bait.BaitNode, null);
                //	detected = baitTemp.getPropertyValue('display') == 'none' || baitTemp.getPropertyValue('visibility') == 'hidden');
                //}
                if (this.options.DebugMode) {
                    this.logEvent('checkBait', 'A check (' + (this.settings.LoopNumber + 1) + '/' +
                        this.options.LoopMaxNumber + ' ~' + (1 + this.settings.LoopNumber * this.options.LoopCheckTime) +
                        'ms) was conducted and detection is ' + (detected ? 'positive' : 'negative'));
                }
                if (loop) {
                    this.settings.LoopNumber++;
                    if (this.settings.LoopNumber >= this.options.LoopMaxNumber) {
                        this.stopLoop();
                    }
                }
                if (detected) {
                    this.stopLoop();
                    this.destroyBait();
                    //emitEvent(true)
                    if (loop) {
                        this.settings.Checking = false;
                    }
                }
                else if (!loop) {
                    this.destroyBait();
                    //emitEvent(false);
                    if (loop) {
                        this.settings.Checking = false;
                    }
                }
                /*
            
            if(window.getComputedStyle !== undefined) {
                var baitTemp = window.getComputedStyle(this._var.bait, null);
                if(baitTemp.getPropertyValue('display') == 'none'
                || baitTemp.getPropertyValue('visibility') == 'hidden') {
                    detected = true;
                }
            }}*/
            };
            this.stopLoop = () => {
                clearInterval(this.settings.Loop);
                this.settings.Loop = null;
                this.settings.LoopNumber = 0;
                if (this.options.DebugMode) {
                    this.logEvent('stopLoop', 'A loop has been stopped');
                }
            };
            this.emitEvent = (detected) => {
                if (this.options.DebugMode) {
                    this.logEvent('emitEvent', 'An event with a ' + (detected ? 'positive' : 'negative') + ' detection was called');
                }
                var fns = detected ? this.settings.Event.Detected : this.settings.Event.NotDetected;
                for (var i in fns) {
                    if (this.options.DebugMode) {
                        this.logEvent('emitEvent', 'Call function ' + (parseInt(i) + 1) + '/' + fns.length);
                    }
                    if (fns.hasOwnProperty(i)) {
                        fns[i]();
                    }
                }
                if (this.options.ResetOnEnd) {
                    this.clearEvent();
                }
            };
            this.clearEvent = () => {
                this.settings.Event.Detected = [];
                this.settings.Event.NotDetected = [];
                if (this.options.DebugMode) {
                    this.logEvent('clearEvent', 'This event list has been cleared');
                }
            };
            this.logEvent = (method, message) => {
                console.log('[BlockAdblock][' + method + '] ' + message);
            };
            this.init();
            if (options !== undefined) {
                this.setOption(options);
            }
        }
    }
    Block.Adblock = Adblock;
})(Block || (Block = {}));
//# sourceMappingURL=block-adblock.js.map