module MediaQuery {
	export class MatchMedia {

		private styleMedia: StyleMedia;
		private styleDOM: HTMLStyleElement;
		private scriptDOM: HTMLScriptElement;
		private cssStyleDeclaration: CSSStyleDeclaration;

		constructor() {
			this.styleMedia = window.styleMedia || (<StyleMedia>(<any>window).media);
			this.styleDOM = document.createElement('style');
			this.scriptDOM = document.getElementsByTagName('script')[0];
			this.init();
		}

		matches(media: string): boolean {
			if (this.styleMedia) {
				return this.styleMedia.matchMedium(media || 'all');
			}

			return this.matchMedium(media || 'all');
		};

		private init(): void {
			if (!this.styleMedia) {
				this.styleDOM.type = 'text/css';
				this.styleDOM.id == 'matchmediajs-test';

				this.scriptDOM.parentNode.insertBefore(this.styleDOM, this.scriptDOM);
				this.cssStyleDeclaration = ('getComputedStyle' in window) &&
											window.getComputedStyle(this.styleDOM, null) ||
											(<any>this.styleDOM).currentStyle;
			}
		};

		private matchMedium(media: string): boolean {

			let text: string = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

			if ((<any>this.styleDOM).styleSheet) {
				(<any>this.styleDOM).styleSheet.cssText = text;
			}
			else {
				this.styleDOM.textContent = text;
			}

			return this.cssStyleDeclaration.width === '1px';
		};
	};
};