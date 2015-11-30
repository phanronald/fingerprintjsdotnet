var MediaQuery;
(function (MediaQuery) {
    class MatchMedia {
        constructor() {
            this.styleMedia = window.styleMedia || window.media;
            this.styleDOM = document.createElement('style');
            this.scriptDOM = document.getElementsByTagName('script')[0];
            this.init();
        }
        matches(media) {
            if (this.styleMedia) {
                return this.styleMedia.matchMedium(media || 'all');
            }
            return this.matchMedium(media || 'all');
        }
        ;
        init() {
            if (!this.styleMedia) {
                this.styleDOM.type = 'text/css';
                this.styleDOM.id == 'matchmediajs-test';
                this.scriptDOM.parentNode.insertBefore(this.styleDOM, this.scriptDOM);
                this.cssStyleDeclaration = ('getComputedStyle' in window) &&
                    window.getComputedStyle(this.styleDOM, null) ||
                    this.styleDOM.currentStyle;
            }
        }
        ;
        matchMedium(media) {
            let text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';
            if (this.styleDOM.styleSheet) {
                this.styleDOM.styleSheet.cssText = text;
            }
            else {
                this.styleDOM.textContent = text;
            }
            return this.cssStyleDeclaration.width === '1px';
        }
        ;
    }
    MediaQuery.MatchMedia = MatchMedia;
    ;
})(MediaQuery || (MediaQuery = {}));
;
//# sourceMappingURL=media-query.js.map