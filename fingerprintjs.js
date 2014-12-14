/// <reference path="frontend-detection.ts" />
var FingerPrints;
(function (FingerPrints) {
    var FingerPrinting = (function () {
        function FingerPrinting(supportScreenResolution, supportCanvas, supportActiveX) {
            this.nativeForEach = Array.prototype.forEach;
            this.nativeMap = Array.prototype.map;
            this.useScreenResolution = supportScreenResolution || false;
            this.useCanvas = supportCanvas || false;
            this.useIEActiveX = supportActiveX || false;
        }
        FingerPrinting.prototype.each = function (obj, iterator, context) {
            if (obj === null) {
                return;
            }
            if (this.nativeForEach && obj.forEach === this.nativeForEach) {
                obj.forEach(iterator, context);
            } else if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    if (iterator.call(context, obj[i], i, obj) === {})
                        return;
                }
            } else {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (iterator.call(context, obj[key], key, obj) === {})
                            return;
                    }
                }
            }
        };

        FingerPrinting.prototype.map = function (obj, iterator, context) {
            var results = [];
            if (obj == null)
                return results;
            if (this.nativeMap && obj.map === this.nativeMap)
                return obj.map(iterator, context);
            this.each(obj, function (value, index, list) {
                results[results.length] = iterator.call(context, value, index, list);
            }, context);
            return results;
        };

        FingerPrinting.prototype.isCanvasSupported = function () {
            var elem = document.createElement("canvas");
            return !!(elem.getContext && elem.getContext("2d"));
        };

        FingerPrinting.prototype.isIE = function () {
            return (navigator.appName === "Microsoft Internet Explorer" || (navigator.appName === "Netscape" && /Trident/.test(navigator.userAgent)));
        };

        FingerPrinting.prototype.getPluginsString = function () {
            if (this.isIE() && this.useIEActiveX) {
                var allPluginExceptJava = this.getIEPluginsString();
                var javaVersionPlugin = this.determineJavaVersion();
                return allPluginExceptJava.concat(";" + javaVersionPlugin);
            } else {
                return this.getRegularPluginsString();
            }
        };

        FingerPrinting.prototype.getRegularPluginsString = function () {
            return this.map(navigator.plugins, function (p) {
                var mimeTypes = this.map(p, function (mt) {
                    return [mt.type, mt.suffixes].join('~');
                }).join(',');
                return [p.name, p.description, mimeTypes].join('::');
            }, this).join(';');
        };

        FingerPrinting.prototype.getIEPluginsString = function () {
            if (window.ActiveXObject) {
                var names = [
                    'ShockwaveFlash.ShockwaveFlash',
                    'AcroPDF.PDF',
                    'PDF.PdfCtrl',
                    'AcroPDF.PDF.1',
                    'PDF.PdfCtrl.5',
                    'PDF.PdfCtrl.1',
                    'QuickTime.QuickTime',
                    'SWCtl.SWCtl',
                    'WMPlayer.OCX',
                    'AgControl.AgControl',
                    'Skype.Detection',
                    'VideoLAN.VLCPlugin',
                    'rmocx.RealPlayer G2 Control',
                    'rmocx.RealPlayer G2 Control.1',
                    'RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)',
                    'RealVideo.RealVideo(tm) ActiveX Control (32-bit)',
                    'RealPlayer'
                ];

                // starting to detect plugins in IE
                return this.map(names, function (name) {
                    try  {
                        new ActiveXObject(name);
                        return name;
                    } catch (e) {
                        return null;
                    }
                }, this).join(';');
            } else {
                return "";
            }
        };

        FingerPrinting.prototype.getScreenResolution = function () {
            return [screen.height, screen.width, screen.pixelDepth];
        };

        FingerPrinting.prototype.getCanvasFingerprint = function () {
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            var txt = "I am error";
            ctx.textBaseline = "top";
            ctx.font = "14px 'Arial'";
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = "#069";
            ctx.fillText(txt, 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText(txt, 4, 17);
            return canvas.toDataURL();
        };

        FingerPrinting.prototype.getFontsInstalled = function () {
            var fonts = [
                "algerian", "Andalus", "Angsana New", "AngsanaUPC",
                "Aparajita", "Apple Symbols", "Arabic Typesetting", "Arial", "Arial Black", "Arial Narrow",
                "Arial Rounded MT Bold", "Arial Unicode MS", "Baskerville Old Face", "Batang", "BatangChe",
                "Bauhaus 93", "Bell MT", "Berlin Sans FB", "Bitstream Charter", "Bitstream Vera Sans",
                "Bitstream Vera Serif", "Bookman Old Style", "Bradley Hand ITC", "Bookshelf Symbol 7",
                "Broadway", "Browallia New", "BrowalliaUPC", "brush script mt", "Calibri", "Californian FB",
                "Cambria", "Cambria Math", "Candara", "Century", "Century Gothic", "Charter", "Chiller",
                "colonna mt", "Comic Sans MS", "Consolas", "Constantia", "Corbel", "Cordia New", "CordiaUPC",
                "Courier", "Courier New", "cursive", "DaunPenh", "David", "default", "DFKai-SB", "DilleniaUPC",
                "Dingbats", "DokChampa", "Dotum", "DotumChe", "Ebrima", "Elephant", "Engravers MT",
                "Estrangelo Edessa", "EucrosiaUPC", "Euphemia", "FangSong", "fantasy", "FrankRuehl",
                "FreeSans", "FreeSerif", "FreesiaUPC", "Freestyle Script", "Garamond", "Garuda", "Gautami",
                "Gentium", "Georgia", "Gisha", "Gulim", "GulimChe", "Gungsuh", "GungsuhChe", "Haettenschweiler",
                "Harrington", "Heiti TC", "High Tower Text", "Impact", "Informal Roman", "IrisUPC", "Iskoola Pota",
                "JasmineUPC", "Jokerman", "Juice ITC", "KaiTi", "Kalinga", "Kartika", "King",
                "KodchiangUPC", "Kokonor", "Kristen ITC", "Lalit", "Latha", "Leelawadee", "Levenim MT",
                "Liberation Mono", "Liberation Mono", "Liberation Sans", "LilyUPC", "Loma", "Lucida Bright",
                "Lucida Calligraphy", "Lucida Console", "Lucida Fax", "Lucida Handwriting", "Lucida Sans Unicode",
                "Luxi Sans", "Magneto", "Malgun Gothic", "Mangal", "marlett", "matura mt script capitals",
                "Meiryo", "Meiryo UI", "Microsoft Himalaya", "Microsoft JhengHei", "Microsoft Sans Serif",
                "Microsoft Uighur", "Microsoft YaHei", "Microsoft Yi Baiti", "MingLiU", "MingLiU_HKSCS",
                "MingLiU_HKSCS-ExtB", "MingLiU-ExtB", "Miriam", "Miriam Fixed", "Mistral", "Modena",
                "Mongolian Baiti", "monospace", "Monotype Corsiva", "MoolBoran", "MS Gothic", "MS Mincho",
                "MS Outlook", "MS PGothic", "MS PMincho", "MS Reference Sans Serif", "MS Reference Specialty",
                "MS UI Gothic", "MT Extra", "MV Boli", "Myriad Pro", "Narkisim", "Niagara Solid", "Nimbus Mono L",
                "Nimbus Roman No 9 L", "Nimbus Sans L", "NSimSun", "Nyala", "OCR A Std", "Old English Text MT",
                "Onyx", "Optima", "palatino linotype", "Papyrus", "Parchment", "Plantagenet Cherokee", "playbill",
                "PMingLiU", "PMingLiU-ExtB", "Poor Richard", "Raavi", "Ravie", "Rod", "Saab", "sans-serif",
                "Segoe Print", "Segoe Script", "Segoe UI", "serif", "Showcard Gothic", "Shruti", "SimHei",
                "Simplified Arabic", "Simplified Arabic Fixed", "SimSun", "SimSun-ExtB", "Snap ITC", "Stencil",
                "Sylfaen", "symbol", "Tahoma", "Tempus Sans ITC", "TeX", "Times", "Times New Roman",
                "Traditional Arabic", "Trebuchet MS", "Tunga", "Ubuntu", "URW Antiqua T", "URW Gothic L",
                "URW Grotesk T", "URW Palladio L", "Utopia", "Verdana", "Verona", "Vijaya", "Viner Hand ITC",
                "Vrinda", "webdings", "wide latin", "Zapfino"];

            var fontDictionary = [];
            for (var i = 0; i < fonts.length; i++) {
                var result = new FrontEndDetection.DectectFont().detect(fonts[i]);
                fontDictionary.push(fonts[i] + " " + String(result));
            }

            return fontDictionary;
        };

        FingerPrinting.prototype.specialDetermineIEFunction = function () {
            var ieAbilities = [];
            ieAbilities.push("gteIE5-" + !document.all);
            ieAbilities.push("lteIE7-" + (!document.all && !document.querySelector));
            ieAbilities.push("lteIE8-" + (!document.all && !document.addEventListener));
            ieAbilities.push("lteIE9-" + (!document.all && !window.atob));
            ieAbilities.push("gteIE10-" + (!document.all && !!window.atob));
            return ieAbilities.join(";");
        };

        FingerPrinting.prototype.determineJavaVersion = function () {
            var finalVersion = "";
            var javaAppletElement = document.getElementById('customJavaId');
            var isJavaInstalled = (javaAppletElement && javaAppletElement.jvms) ? true : false;
            if (isJavaInstalled) {
                var javaVirtualMachine = javaAppletElement.jvms;
                var javaVersionArray = new Array();

                for (var i = 0; i < javaVirtualMachine.getLength(); i++) {
                    javaVersionArray[i] = javaVirtualMachine.get(i).version;
                }

                finalVersion = javaVersionArray.join('~');
            }
            return finalVersion;
        };

        FingerPrinting.prototype.murmurhash3_32_gc = function (key, seed) {
            var remainder, bytes, h1, h1b, c1, c2, k1, i;

            remainder = key.length & 3; // key.length % 4
            bytes = key.length - remainder;
            h1 = seed;
            c1 = 0xcc9e2d51;
            c2 = 0x1b873593;
            i = 0;

            while (i < bytes) {
                k1 = ((key.charCodeAt(i) & 0xff)) | ((key.charCodeAt(++i) & 0xff) << 8) | ((key.charCodeAt(++i) & 0xff) << 16) | ((key.charCodeAt(++i) & 0xff) << 24);
                ++i;

                k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
                k1 = (k1 << 15) | (k1 >>> 17);
                k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

                h1 ^= k1;
                h1 = (h1 << 13) | (h1 >>> 19);
                h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
                h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
            }

            k1 = 0;

            switch (remainder) {
                case 3:
                    k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
                case 2:
                    k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
                case 1:
                    k1 ^= (key.charCodeAt(i) & 0xff);

                    k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
                    k1 = (k1 << 15) | (k1 >>> 17);
                    k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
                    h1 ^= k1;
            }

            h1 ^= key.length;

            h1 ^= h1 >>> 16;
            h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
            h1 ^= h1 >>> 13;
            h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
            h1 ^= h1 >>> 16;

            return h1 >>> 0;
        };

        FingerPrinting.prototype.getFingerPrintHash = function () {
            var keys = [];
            keys.push(navigator.userAgent);
            keys.push(navigator.language);
            keys.push(screen.colorDepth);
            if (this.useScreenResolution) {
                var resolution = this.getScreenResolution();
                if (typeof resolution !== 'undefined') {
                    keys.push(this.getScreenResolution().join('x'));
                }
            }

            keys.push(new Date().getTimezoneOffset());
            if (document.body) {
                keys.push(typeof (document.body.addBehavior));
            } else {
                keys.push(typeof undefined);
            }

            keys.push(navigator.cpuClass || "not supported");
            keys.push(navigator.msDoNotTrack || navigator.doNotTrack || "nope");
            keys.push(navigator.platform);
            keys.push(this.getPluginsString());
            keys.push(navigator.mimeTypes);
            if (this.useCanvas && this.isCanvasSupported()) {
                keys.push(this.getCanvasFingerprint());
            }

            keys.push(this.specialDetermineIEFunction());
            return this.murmurhash3_32_gc(keys.join('###'), 31);
        };
        return FingerPrinting;
    })();
    FingerPrints.FingerPrinting = FingerPrinting;
})(FingerPrints || (FingerPrints = {}));
//# sourceMappingURL=fingerprintjs.js.map
