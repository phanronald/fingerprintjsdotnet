 module FrontEndDetection {
	export class DectectFont {
		private baseFonts: Array<string> = ['sans-serif', 'serif'];
		private fontTextToTest: string = "wmliilmw";
		private fontSizeToTest: string = "72px";
		private bodyTag: HTMLElement = document.getElementsByTagName("body")[0];
		private testElement: HTMLElement;
		private defaultWidth: Object = {};
		private defaultHeight: Object = {};
		detected: boolean = false;
		constructor() {
			this.testElement = document.createElement("span");
			this.testElement.style.fontSize = this.fontSizeToTest;
			this.testElement.innerHTML = this.fontTextToTest;

			for (var index in this.baseFonts) {
				this.testElement.style.fontFamily = this.baseFonts[index];
				this.bodyTag.appendChild(this.testElement);
				this.defaultWidth[this.baseFonts[index]] = this.testElement.offsetWidth;
				this.defaultHeight[this.baseFonts[index]] = this.testElement.offsetHeight;
				this.bodyTag.removeChild(this.testElement);
			}
		}

		detect(font) : boolean {
			for (var index in this.baseFonts) {
				this.testElement.style.fontFamily = font + ',' + this.baseFonts[index]; // name of the font along with the base font for fallback.
				this.bodyTag.appendChild(this.testElement);
				var matched: boolean = (this.testElement.offsetWidth != this.defaultWidth[this.baseFonts[index]] || this.testElement.offsetHeight != this.defaultHeight[this.baseFonts[index]]);
				this.bodyTag.removeChild(this.testElement);
				this.detected = this.detected || matched;
			}
			return this.detected;
		}
	};

	export class DetermineIEBrowser {
		private customDiv: any;
		private x: number = 0;
		private classid: Array<string> = ["{45EA75A0-A269-11D1-B5BF-0000F8051515}", "{3AF36230-A269-11D1-B5BF-0000F8051515}", "{89820200-ECBD-11CF-8B85-00AA005B4383}"];
		private verIEtrue: any;
		constructor() {
			this.customDiv = document.getElementById("div");
		}

		trueIEVersion(): string {
			try {
				this.customDiv.style.behavior = "url(#default#clientcaps)";
			}
			catch (e) {
			}

			for (this.x = 0; this.x < this.classid.length; this.x++) {
				try { this.verIEtrue = this.customDiv.getComponentVersion(this.classid[this.x], "componentid").replace(/,/g, ".") }
				catch (e) { };
				if (this.verIEtrue) break;
			};

			if (!!this.verIEtrue) return this.verIEtrue;

			return "99";  /* edge */
		}

		trueIEVersionNumber():string {
			return this.trueIEVersion().split(".")[0];
		}

		getInternetExplorerVersion(): number {
			var rv = -1;
			if (navigator.appName == 'Microsoft Internet Explorer') {
				var ua: string = navigator.userAgent;
				var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
				if (re.exec(ua) != null)
					rv = parseFloat(RegExp.$1);
			} else if (navigator.appName == 'Netscape') {
				var ua: string = navigator.userAgent;
				var re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
				if (re.exec(ua) != null)
					rv = parseFloat(RegExp.$1);
			}
			return rv;
		}
	};
};