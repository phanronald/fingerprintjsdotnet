var MediaQuery;
(function (MediaQuery) {
    var MatchMedia = (function () {
        function MatchMedia() {
            this.styleMedia = window.styleMedia || window.media;
            this.styleDOM = document.createElement('style');
            this.scriptDOM = document.getElementsByTagName('script')[0];
            this.init();
        }
        MatchMedia.prototype.matches = function (media) {
            if (this.styleMedia) {
                return this.styleMedia.matchMedium(media || 'all');
            }
            return this.matchMedium(media || 'all');
        };
        ;
        MatchMedia.prototype.init = function () {
            if (!this.styleMedia) {
                this.styleDOM.type = 'text/css';
                this.styleDOM.id == 'matchmediajs-test';
                this.scriptDOM.parentNode.insertBefore(this.styleDOM, this.scriptDOM);
                this.cssStyleDeclaration = ('getComputedStyle' in window) &&
                    window.getComputedStyle(this.styleDOM, null) ||
                    this.styleDOM.currentStyle;
            }
        };
        ;
        MatchMedia.prototype.matchMedium = function (media) {
            var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';
            if (this.styleDOM.styleSheet) {
                this.styleDOM.styleSheet.cssText = text;
            }
            else {
                this.styleDOM.textContent = text;
            }
            return this.cssStyleDeclaration.width === '1px';
        };
        ;
        return MatchMedia;
    })();
    MediaQuery.MatchMedia = MatchMedia;
    ;
})(MediaQuery || (MediaQuery = {}));
;
//# sourceMappingURL=media-query.js.map