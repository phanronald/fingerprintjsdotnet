var FrontEndDetection;
(function (FrontEndDetection) {
    var DectectFont = (function () {
        function DectectFont() {
            this.baseFonts = ['sans-serif', 'serif'];
            this.fontTextToTest = "wmliilmw";
            this.fontSizeToTest = "72px";
            this.bodyTag = document.getElementsByTagName("body")[0];
            this.defaultWidth = {};
            this.defaultHeight = {};
            this.detected = false;
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
        DectectFont.prototype.detect = function (font) {
            for (var index in this.baseFonts) {
                this.testElement.style.fontFamily = font + ',' + this.baseFonts[index]; // name of the font along with the base font for fallback.
                this.bodyTag.appendChild(this.testElement);
                var matched = (this.testElement.offsetWidth != this.defaultWidth[this.baseFonts[index]] || this.testElement.offsetHeight != this.defaultHeight[this.baseFonts[index]]);
                this.bodyTag.removeChild(this.testElement);
                this.detected = this.detected || matched;
            }
            return this.detected;
        };
        return DectectFont;
    })();
    FrontEndDetection.DectectFont = DectectFont;
    ;
    var DetermineIEBrowser = (function () {
        function DetermineIEBrowser() {
            this.x = 0;
            this.classid = ["{45EA75A0-A269-11D1-B5BF-0000F8051515}", "{3AF36230-A269-11D1-B5BF-0000F8051515}", "{89820200-ECBD-11CF-8B85-00AA005B4383}"];
            this.customDiv = document.getElementById("div");
        }
        DetermineIEBrowser.prototype.trueIEVersion = function () {
            try {
                this.customDiv.style.behavior = "url(#default#clientcaps)";
            }
            catch (e) {
            }
            for (this.x = 0; this.x < this.classid.length; this.x++) {
                try {
                    this.verIEtrue = this.customDiv.getComponentVersion(this.classid[this.x], "componentid").replace(/,/g, ".");
                }
                catch (e) { }
                ;
                if (this.verIEtrue)
                    break;
            }
            ;
            if (!!this.verIEtrue)
                return this.verIEtrue;
            return "99"; /* edge */
        };
        DetermineIEBrowser.prototype.trueIEVersionNumber = function () {
            return this.trueIEVersion().split(".")[0];
        };
        DetermineIEBrowser.prototype.getInternetExplorerVersion = function () {
            var rv = -1;
            if (navigator.appName == 'Microsoft Internet Explorer') {
                var ua = navigator.userAgent;
                var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null)
                    rv = parseFloat(RegExp.$1);
            }
            else if (navigator.appName == 'Netscape') {
                var ua = navigator.userAgent;
                var re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null)
                    rv = parseFloat(RegExp.$1);
            }
            return rv;
        };
        return DetermineIEBrowser;
    })();
    FrontEndDetection.DetermineIEBrowser = DetermineIEBrowser;
    ;
    var HTML5Shims = (function () {
        function HTML5Shims() {
            this.alphaCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".split("");
            this.characterLength = this.alphaCharacters.length;
        }
        HTML5Shims.prototype.isAtobSupported = function (input) {
            if (input.length % 4)
                throw new Error("Invalid Character");
            var sretcarahc = {};
            var re = /=+$/;
            var inputArr = input.replace(re, "").split("");
            var a, b, b1, b2, b3, b4, c, i = 0, j = 0, result = [];
            this.characterLength = input.length;
            while (i < this.characterLength) {
                b1 = sretcarahc[input[i++]];
                b2 = sretcarahc[input[i++]];
                b3 = sretcarahc[input[i++]];
                b4 = sretcarahc[input[i++]];
                a = ((b1 & 0x3F) << 2) | ((b2 >> 4) & 0x3);
                b = ((b2 & 0xF) << 4) | ((b3 >> 2) & 0xF);
                c = ((b3 & 0x3) << 6) | (b4 & 0x3F);
                result[j++] = a;
                b && (result[j++] = b);
                c && (result[j++] = c);
            }
            return this.fromCharCode(result, String.fromCharCode, 0x7FFF);
        };
        HTML5Shims.prototype.btoaShim = function (input) {
            var a, b, b1, b2, b3, b4, c, i = 0, result = [];
            this.characterLength = input.length;
            while (i < this.characterLength) {
                a = input.charCodeAt(i++) || 0;
                b = input.charCodeAt(i++) || 0;
                c = input.charCodeAt(i++) || 0;
                if (0xFF < Math.max(a, b, c))
                    throw new Error("Invalid Character");
                b1 = (a >> 2) & 0x3F;
                b2 = ((a & 0x3) << 4) | ((b >> 4) & 0xF);
                b3 = ((b & 0xF) << 2) | ((c >> 6) & 0x3);
                b4 = c & 0x3F;
                b ? c ? 0 : b4 = 64 : b3 = b4 = 64;
                result.push(this.alphaCharacters[b1], this.alphaCharacters[b2], this.alphaCharacters[b3], this.alphaCharacters[b4]);
            }
            return result.join("");
        };
        HTML5Shims.prototype.fromCharCode = function (code, input, maxLength) {
            var result = [], slice = result.slice, length = code.length;
            for (var i = 0; i < length; i += maxLength) {
                result.push(input.apply(null, slice.call(code, i, i + maxLength)));
            }
            return result.join("");
        };
        return HTML5Shims;
    })();
    FrontEndDetection.HTML5Shims = HTML5Shims;
    ;
})(FrontEndDetection || (FrontEndDetection = {}));
;
//# sourceMappingURL=frontend-detection.js.map