/// <reference path="js/interfaces/iblockadblockoptions.ts" />

namespace Block {
	export class Adblock {

		private options: IBlockAdblockOptions;
		private settings: IBlockAdblockSettings;

		constructor(options?: IBlockAdblockOptions) {
			this.init();

			if (options !== undefined) {
				this.setOption(options);
			}
		}

		public setOption = (options: IBlockAdblockOptions): void => {
			for (var option in options) {
				let currentOption = options[option];
				this.options[option] = currentOption;
				if (this.options.DebugMode) {
					this.logEvent('setOption', 'The option "' + option + '" was assigned to "'+ currentOption + '"'); 
				}
			}
		}

		public addEvent = (detected: boolean, fn: Function): void => {
			let currentEvent: Function[] = detected ? this.settings.Event.Detected : this.settings.Event.NotDetected;
			currentEvent.push(fn);
			if (this.options.DebugMode) {
				this.logEvent('addEvent', 'A type of event "' + (detected ? 'detected' : 'notDetected') + '" was added');
			}
		}

		public onDetected = (fn: Function): void => {
			this.addEvent(true, fn);
		}

		public onNotDetected = (fn: Function): void => {
			this.addEvent(false, fn);
		}

		private init = (): void => {
			this.options = {
				CheckOnLoad: false,
				ResetOnEnd: false,
				LoopCheckTime: 50,
				LoopMaxNumber: 5,
				BaitClass: '',
				BaitStyle: '',
				DebugMode: false
			};

			let eventSettings: IBlockAdblockEventOption = { Detected: [], NotDetected: [] };

			this.settings = {
				Version: '3.2.0',
				Bait: null,
				Checking: false,
				Loop: null,
				LoopNumber: 0,
				Event: eventSettings
			};
		}

		private createBait = (): void => {
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
		}

		private destroyBait = (): void => {
			window.document.body.removeChild(this.settings.Bait.BaitNode);
			this.settings.Bait = null;
			if (this.options.DebugMode) {
				this.logEvent('destroyBait', 'Bait has been removed');
			}
		}

		private check = (loop: boolean): boolean => {
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
		}
		
		private checkBait = (loop: boolean): void => {
			let detected: boolean = false;
			if (this.settings.Bait === null) {
				this.createBait();
			}

			let detectedAdp = window.document.body.getAttribute('adp') != null ||
				this.settings.Bait.OffsetParent === null || this.settings.Bait.OffsetHeight == 0 ||
				this.settings.Bait.OffsetLeft == 0 || this.settings.Bait.OffsetTop == 0 ||
				this.settings.Bait.OffsetWidth == 0 || this.settings.Bait.ClientHeight == 0 ||
				this.settings.Bait.ClientWidth == 0;

			detected = detectedAdp;

			if (window.getComputedStyle !== undefined) {
				let baitTemp = window.getComputedStyle(<HTMLElement>this.settings.Bait.BaitNode, null);
				detected = baitTemp.getPropertyValue('display') == 'none' || baitTemp.getPropertyValue('visibility') == 'hidden';
			}

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
				this.emitEvent(true)
				if (loop) {
					this.settings.Checking = false;
				}
			}
			else if (!loop) {
				this.destroyBait();
				this.emitEvent(false);
				if (loop) {
					this.settings.Checking = false;
				}
			}

			if (window.getComputedStyle !== undefined) {
				let baitTemp = window.getComputedStyle(<HTMLElement>this.settings.Bait.BaitNode, null);
				if (baitTemp.getPropertyValue('display') == 'none' || baitTemp.getPropertyValue('visibility') == 'hidden') {
					detected = true;
				}
			}
		}

		private stopLoop = (): void => {
			clearInterval(this.settings.Loop);
			this.settings.Loop = null;
			this.settings.LoopNumber = 0;
			if (this.options.DebugMode) {
				this.logEvent('stopLoop', 'A loop has been stopped');
			}
		}

		private emitEvent = (detected: boolean): void => {
			if (this.options.DebugMode) {
				this.logEvent('emitEvent', 'An event with a ' + (detected ? 'positive' : 'negative') + ' detection was called');
			}

			var fns:Function[] = detected ? this.settings.Event.Detected : this.settings.Event.NotDetected;
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
		}

		private clearEvent = (): void => {
			this.settings.Event.Detected = [];
			this.settings.Event.NotDetected = [];
			if (this.options.DebugMode) {
				this.logEvent('clearEvent', 'This event list has been cleared');
			}
		}

		private logEvent = (method: string, message: string): void => {
			console.log('[BlockAdblock][' + method + '] ' + message);
		}
	}
}