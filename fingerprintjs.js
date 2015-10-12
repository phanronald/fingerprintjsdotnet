/// <reference path="frontend-detection.ts" />
var FingerPrints;
(function (FingerPrints) {
    var FingerPrinting = (function () {
        function FingerPrinting(supportScreenResolution, supportCanvas, supportActiveX, supportScreenOrientation, support64Hash) {
            this.nativeForEach = Array.prototype.forEach;
            this.nativeMap = Array.prototype.map;
            this.useScreenResolution = supportScreenResolution || false;
            this.useCanvas = supportCanvas || false;
            this.useIEActiveX = supportActiveX || false;
            this.useScreenOrientation = supportScreenOrientation || false;
            this.use64bitHash = support64Hash || false;
        }
        FingerPrinting.prototype.each = function (obj, iterator, context) {
            if (obj === null) {
                return;
            }
            if (this.nativeForEach && obj.forEach === this.nativeForEach) {
                obj.forEach(iterator, context);
            }
            else if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    if (iterator.call(context, obj[i], i, obj) === {})
                        return;
                }
            }
            else {
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
            return (navigator.appName === "Microsoft Internet Explorer" ||
                (navigator.appName === "Netscape" && /Trident/.test(navigator.userAgent)));
        };
        FingerPrinting.prototype.getPluginsString = function () {
            if (this.isIE() && this.useIEActiveX) {
                var allPluginExceptJava = this.getIEPluginsString();
                var javaVersionPlugin = this.determineJavaVersion();
                return allPluginExceptJava.concat(";" + javaVersionPlugin);
            }
            else {
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
                    //real player 5 of them
                    'rmocx.RealPlayer G2 Control',
                    'rmocx.RealPlayer G2 Control.1',
                    'RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)',
                    'RealVideo.RealVideo(tm) ActiveX Control (32-bit)',
                    'RealPlayer',
                ];
                // starting to detect plugins in IE
                return this.map(names, function (name) {
                    try {
                        new ActiveXObject(name);
                        return name;
                    }
                    catch (e) {
                        return null;
                    }
                }, this).join(';');
            }
            else {
                return "";
            }
        };
        FingerPrinting.prototype.getAvailableScreenResolution = function () {
            var resolution;
            var available;
            if (this.useScreenOrientation) {
                resolution = (screen.height > screen.width) ? [screen.height, screen.width] : [screen.width, screen.height];
            }
            else {
                resolution = [screen.height, screen.width];
            }
            return resolution;
        };
        FingerPrinting.prototype.getScreenResolution = function () {
            var available;
            if (screen.availWidth && screen.availHeight) {
                if (this.useScreenOrientation) {
                    available = (screen.availHeight > screen.availWidth) ? [screen.availHeight, screen.availWidth] : [screen.availWidth, screen.availHeight];
                }
                else {
                    available = [screen.availHeight, screen.availWidth];
                }
            }
            return available;
        };
        FingerPrinting.prototype.hasSessionStorage = function () {
            try {
                return !!window.sessionStorage;
            }
            catch (e) {
                return true; // SecurityError when referencing it means it exists
            }
        };
        FingerPrinting.prototype.hasLocalStorage = function () {
            try {
                return !!window.localStorage;
            }
            catch (e) {
                return true; // SecurityError when referencing it means it exists
            }
        };
        FingerPrinting.prototype.hasIndexedDB = function () {
            return !!window.indexedDB;
        };
        FingerPrinting.prototype.getAdBlock = function () {
            var ads = document.createElement("div");
            ads.setAttribute("id", "ads");
            document.body.appendChild(ads);
            return document.getElementById("ads") ? false : true;
        };
        FingerPrinting.prototype.getCanvasFingerprintFeature = function () {
            var result = [];
            var canvas = document.createElement("canvas");
            canvas.width = 2000;
            canvas.height = 200;
            var ctx = canvas.getContext("2d");
            try {
                ctx.globalCompositeOperation = "screen";
            }
            catch (e) { }
            result.push("canvas blending:" + ((ctx.globalCompositeOperation === "screen") ? "yes" : "no"));
            ctx.rect(0, 0, 10, 10);
            ctx.rect(2, 2, 6, 6);
            result.push("canvas winding:" + ((ctx.isPointInPath(5, 5, "evenodd") === false) ? "yes" : "no"));
            return result.join("~");
        };
        FingerPrinting.prototype.getCanvasFingerprint = function () {
            var result = [];
            var canvas = document.createElement("canvas");
            canvas.width = 2000;
            canvas.height = 200;
            var ctx = canvas.getContext("2d");
            try {
                ctx.globalCompositeOperation = "screen";
            }
            catch (e) { }
            var txt = "https://kawasaki.com/valve for a better software process";
            ctx.textBaseline = "top";
            ctx.font = "72px 'DamascusLight'";
            ctx.fillStyle = "#f60";
            ctx.fillRect(2, 0, 1000, 70);
            ctx.fillStyle = "#069";
            ctx.fillText(txt, 2, 0);
            ctx.font = "72px 'Roboto Condensed'";
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText(txt, 4, 2);
            ctx.strokeStyle = "rgba(202, 104, 0, 0.9)";
            ctx.font = "72px 'Menlo'";
            ctx.strokeText(txt, 8, 4);
            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = "rgb(255,0,255)";
            ctx.beginPath();
            ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "rgb(0,255,255)";
            ctx.beginPath();
            ctx.arc(100, 50, 50, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "rgb(255,255,0)";
            ctx.beginPath();
            ctx.arc(75, 100, 50, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "rgb(255,0,255)";
            ctx.arc(75, 75, 75, 0, Math.PI * 2, true);
            ctx.arc(75, 75, 25, 0, Math.PI * 2, true);
            ctx.fill("evenodd");
            canvas.toDataURL().replace("data:image/png;base64,", "");
            var base64string = canvas.toDataURL().replace("data:image/png;base64,", "");
            return base64string;
        };
        FingerPrinting.prototype.getWebglCanvas = function () {
            var canvas = document.createElement("canvas");
            var gl = null;
            try {
                gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            }
            catch (e) { }
            return gl;
        };
        FingerPrinting.prototype.getWebGlFeatures = function () {
            var gl;
            var fa2s = function (fa) {
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                return "[" + fa[0] + ", " + fa[1] + "]";
            };
            var maxAnisotropy = function (gl) {
                var anisotropy, ext = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || gl.getExtension("MOZ_EXT_texture_filter_anisotropic");
                return ext ? (anisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT), 0 === anisotropy && (anisotropy = 2), anisotropy) : null;
            };
            gl = this.getWebglCanvas();
            if (!gl) {
                return null;
            }
            var result = [];
            var vShaderTemplate = "attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}";
            var fShaderTemplate = "precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}";
            var vertexPosBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
            var vertices = new Float32Array([-.2, -.9, 0, .4, -.26, 0, 0, .732134444, 0]);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            vertexPosBuffer.itemSize = 3;
            vertexPosBuffer.numItems = 3;
            var program = gl.createProgram(), vshader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vshader, vShaderTemplate);
            gl.compileShader(vshader);
            var fshader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fshader, fShaderTemplate);
            gl.compileShader(fshader);
            gl.attachShader(program, vshader);
            gl.attachShader(program, fshader);
            gl.linkProgram(program);
            gl.useProgram(program);
            program.vertexPosAttrib = gl.getAttribLocation(program, "attrVertex");
            program.offsetUniform = gl.getUniformLocation(program, "uniformOffset");
            gl.enableVertexAttribArray(program.vertexPosArray);
            gl.vertexAttribPointer(program.vertexPosAttrib, vertexPosBuffer.itemSize, gl.FLOAT, !1, 0, 0);
            gl.uniform2f(program.offsetUniform, 1, 1);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPosBuffer.numItems);
            if (gl.canvas != null) {
                result.push(gl.canvas.toDataURL());
            }
            result.push("extensions:" + gl.getSupportedExtensions().join(";"));
            result.push("webgl aliased line width range:" + fa2s(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)));
            result.push("webgl aliased point size range:" + fa2s(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)));
            result.push("webgl alpha bits:" + gl.getParameter(gl.ALPHA_BITS));
            result.push("webgl antialiasing:" + (gl.getContextAttributes().antialias ? "yes" : "no"));
            result.push("webgl blue bits:" + gl.getParameter(gl.BLUE_BITS));
            result.push("webgl depth bits:" + gl.getParameter(gl.DEPTH_BITS));
            result.push("webgl green bits:" + gl.getParameter(gl.GREEN_BITS));
            result.push("webgl max anisotropy:" + maxAnisotropy(gl));
            result.push("webgl max combined texture image units:" + gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
            result.push("webgl max cube map texture size:" + gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE));
            result.push("webgl max fragment uniform vectors:" + gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS));
            result.push("webgl max render buffer size:" + gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
            result.push("webgl max texture image units:" + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
            result.push("webgl max texture size:" + gl.getParameter(gl.MAX_TEXTURE_SIZE));
            result.push("webgl max varying vectors:" + gl.getParameter(gl.MAX_VARYING_VECTORS));
            result.push("webgl max vertex attribs:" + gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
            result.push("webgl max vertex texture image units:" + gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
            result.push("webgl max vertex uniform vectors:" + gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS));
            result.push("webgl max viewport dims:" + fa2s(gl.getParameter(gl.MAX_VIEWPORT_DIMS)));
            result.push("webgl red bits:" + gl.getParameter(gl.RED_BITS));
            result.push("webgl renderer:" + gl.getParameter(gl.RENDERER));
            result.push("webgl shading language version:" + gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
            result.push("webgl stencil bits:" + gl.getParameter(gl.STENCIL_BITS));
            result.push("webgl vendor:" + gl.getParameter(gl.VENDOR));
            result.push("webgl version:" + gl.getParameter(gl.VERSION));
            result.push("webgl vertex shader high float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision);
            result.push("webgl vertex shader high float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).rangeMin);
            result.push("webgl vertex shader high float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).rangeMax);
            result.push("webgl vertex shader medium float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision);
            result.push("webgl vertex shader medium float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).rangeMin);
            result.push("webgl vertex shader medium float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).rangeMax);
            result.push("webgl vertex shader low float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT).precision);
            result.push("webgl vertex shader low float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT).rangeMin);
            result.push("webgl vertex shader low float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT).rangeMax);
            result.push("webgl fragment shader high float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision);
            result.push("webgl fragment shader high float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).rangeMin);
            result.push("webgl fragment shader high float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).rangeMax);
            result.push("webgl fragment shader medium float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision);
            result.push("webgl fragment shader medium float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).rangeMin);
            result.push("webgl fragment shader medium float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).rangeMax);
            result.push("webgl fragment shader low float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT).precision);
            result.push("webgl fragment shader low float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT).rangeMin);
            result.push("webgl fragment shader low float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT).rangeMax);
            result.push("webgl vertex shader high int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT).precision);
            result.push("webgl vertex shader high int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT).rangeMin);
            result.push("webgl vertex shader high int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT).rangeMax);
            result.push("webgl vertex shader medium int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT).precision);
            result.push("webgl vertex shader medium int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT).rangeMin);
            result.push("webgl vertex shader medium int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT).rangeMax);
            result.push("webgl vertex shader low int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT).precision);
            result.push("webgl vertex shader low int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT).rangeMin);
            result.push("webgl vertex shader low int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT).rangeMax);
            result.push("webgl fragment shader high int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT).precision);
            result.push("webgl fragment shader high int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT).rangeMin);
            result.push("webgl fragment shader high int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT).rangeMax);
            result.push("webgl fragment shader medium int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT).precision);
            result.push("webgl fragment shader medium int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT).rangeMin);
            result.push("webgl fragment shader medium int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT).rangeMax);
            result.push("webgl fragment shader low int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT).precision);
            result.push("webgl fragment shader low int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT).rangeMin);
            result.push("webgl fragment shader low int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT).rangeMax);
            return result.join("~");
        };
        FingerPrinting.prototype.getFontsInstalled = function () {
            var fonts = ["algerian", "Andalus", "Angsana New", "AngsanaUPC",
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
                k1 =
                    ((key.charCodeAt(i) & 0xff)) |
                        ((key.charCodeAt(++i) & 0xff) << 8) |
                        ((key.charCodeAt(++i) & 0xff) << 16) |
                        ((key.charCodeAt(++i) & 0xff) << 24);
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
                case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
                case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
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
        /**/
        FingerPrinting.prototype.x64Add = function (m, n) {
            m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
            n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
            var o = [0, 0, 0, 0];
            o[3] += m[3] + n[3];
            o[2] += o[3] >>> 16;
            o[3] &= 0xffff;
            o[2] += m[2] + n[2];
            o[1] += o[2] >>> 16;
            o[2] &= 0xffff;
            o[1] += m[1] + n[1];
            o[0] += o[1] >>> 16;
            o[1] &= 0xffff;
            o[0] += m[0] + n[0];
            o[0] &= 0xffff;
            return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
        };
        FingerPrinting.prototype.x64Multiply = function (m, n) {
            m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
            n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
            var o = [0, 0, 0, 0];
            o[3] += m[3] * n[3];
            o[2] += o[3] >>> 16;
            o[3] &= 0xffff;
            o[2] += m[2] * n[3];
            o[1] += o[2] >>> 16;
            o[2] &= 0xffff;
            o[2] += m[3] * n[2];
            o[1] += o[2] >>> 16;
            o[2] &= 0xffff;
            o[1] += m[1] * n[3];
            o[0] += o[1] >>> 16;
            o[1] &= 0xffff;
            o[1] += m[2] * n[2];
            o[0] += o[1] >>> 16;
            o[1] &= 0xffff;
            o[1] += m[3] * n[1];
            o[0] += o[1] >>> 16;
            o[1] &= 0xffff;
            o[0] += (m[0] * n[3]) + (m[1] * n[2]) + (m[2] * n[1]) + (m[3] * n[0]);
            o[0] &= 0xffff;
            return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
        };
        FingerPrinting.prototype.x64Rotl = function (m, n) {
            n %= 64;
            if (n === 32) {
                return [m[1], m[0]];
            }
            else if (n < 32) {
                return [(m[0] << n) | (m[1] >>> (32 - n)), (m[1] << n) | (m[0] >>> (32 - n))];
            }
            else {
                n -= 32;
                return [(m[1] << n) | (m[0] >>> (32 - n)), (m[0] << n) | (m[1] >>> (32 - n))];
            }
        };
        FingerPrinting.prototype.x64LeftShift = function (m, n) {
            n %= 64;
            if (n === 0) {
                return m;
            }
            else if (n < 32) {
                return [(m[0] << n) | (m[1] >>> (32 - n)), m[1] << n];
            }
            else {
                return [m[1] << (n - 32), 0];
            }
        };
        FingerPrinting.prototype.x64Xor = function (m, n) {
            return [m[0] ^ n[0], m[1] ^ n[1]];
        };
        FingerPrinting.prototype.x64Fmix = function (h) {
            h = this.x64Xor(h, [0, h[0] >>> 1]);
            h = this.x64Multiply(h, [0xff51afd7, 0xed558ccd]);
            h = this.x64Xor(h, [0, h[0] >>> 1]);
            h = this.x64Multiply(h, [0xc4ceb9fe, 0x1a85ec53]);
            h = this.x64Xor(h, [0, h[0] >>> 1]);
            return h;
        };
        FingerPrinting.prototype.murmurhash3_64_gc = function (key, seed) {
            key = key || "";
            seed = seed || 0;
            var remainder = key.length % 16;
            var bytes = key.length - remainder;
            var h1 = [0, seed];
            var h2 = [0, seed];
            var k1 = [0, 0];
            var k2 = [0, 0];
            var c1 = [0x87c37b91, 0x114253d5];
            var c2 = [0x4cf5ad43, 0x2745937f];
            for (var i = 0; i < bytes; i = i + 16) {
                k1 = [((key.charCodeAt(i + 4) & 0xff)) | ((key.charCodeAt(i + 5) & 0xff) << 8) | ((key.charCodeAt(i + 6) & 0xff) << 16) | ((key.charCodeAt(i + 7) & 0xff) << 24), ((key.charCodeAt(i) & 0xff)) | ((key.charCodeAt(i + 1) & 0xff) << 8) | ((key.charCodeAt(i + 2) & 0xff) << 16) | ((key.charCodeAt(i + 3) & 0xff) << 24)];
                k2 = [((key.charCodeAt(i + 12) & 0xff)) | ((key.charCodeAt(i + 13) & 0xff) << 8) | ((key.charCodeAt(i + 14) & 0xff) << 16) | ((key.charCodeAt(i + 15) & 0xff) << 24), ((key.charCodeAt(i + 8) & 0xff)) | ((key.charCodeAt(i + 9) & 0xff) << 8) | ((key.charCodeAt(i + 10) & 0xff) << 16) | ((key.charCodeAt(i + 11) & 0xff) << 24)];
                k1 = this.x64Multiply(k1, c1);
                k1 = this.x64Rotl(k1, 31);
                k1 = this.x64Multiply(k1, c2);
                h1 = this.x64Xor(h1, k1);
                h1 = this.x64Rotl(h1, 27);
                h1 = this.x64Add(h1, h2);
                h1 = this.x64Add(this.x64Multiply(h1, [0, 5]), [0, 0x52dce729]);
                k2 = this.x64Multiply(k2, c2);
                k2 = this.x64Rotl(k2, 33);
                k2 = this.x64Multiply(k2, c1);
                h2 = this.x64Xor(h2, k2);
                h2 = this.x64Rotl(h2, 31);
                h2 = this.x64Add(h2, h1);
                h2 = this.x64Add(this.x64Multiply(h2, [0, 5]), [0, 0x38495ab5]);
            }
            k1 = [0, 0];
            k2 = [0, 0];
            switch (remainder) {
                case 15:
                    k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 14)], 48));
                case 14:
                    k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 13)], 40));
                case 13:
                    k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 12)], 32));
                case 12:
                    k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 11)], 24));
                case 11:
                    k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 10)], 16));
                case 10:
                    k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 9)], 8));
                case 9:
                    k2 = this.x64Xor(k2, [0, key.charCodeAt(i + 8)]);
                    k2 = this.x64Multiply(k2, c2);
                    k2 = this.x64Rotl(k2, 33);
                    k2 = this.x64Multiply(k2, c1);
                    h2 = this.x64Xor(h2, k2);
                case 8:
                    k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 7)], 56));
                case 7:
                    k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 6)], 48));
                case 6:
                    k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 5)], 40));
                case 5:
                    k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 4)], 32));
                case 4:
                    k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 3)], 24));
                case 3:
                    k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 2)], 16));
                case 2:
                    k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 1)], 8));
                case 1:
                    k1 = this.x64Xor(k1, [0, key.charCodeAt(i)]);
                    k1 = this.x64Multiply(k1, c1);
                    k1 = this.x64Rotl(k1, 31);
                    k1 = this.x64Multiply(k1, c2);
                    h1 = this.x64Xor(h1, k1);
            }
            h1 = this.x64Xor(h1, [0, key.length]);
            h2 = this.x64Xor(h2, [0, key.length]);
            h1 = this.x64Add(h1, h2);
            h2 = this.x64Add(h2, h1);
            h1 = this.x64Fmix(h1);
            h2 = this.x64Fmix(h2);
            h1 = this.x64Add(h1, h2);
            h2 = this.x64Add(h2, h1);
            return ("00000000" + (h1[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h1[1] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[1] >>> 0).toString(16)).slice(-8);
        };
        /**/
        FingerPrinting.prototype.getFingerPrintHash = function () {
            var keys = [];
            keys.push(navigator.userAgent);
            keys.push(navigator.language);
            keys.push(screen.colorDepth);
            if (this.useScreenResolution) {
                var resolution = this.getScreenResolution();
                if (typeof resolution !== 'undefined') {
                    keys.push(resolution.join('x'));
                }
                var availableResolution = this.getAvailableScreenResolution();
                if (typeof availableResolution !== 'undefined') {
                    keys.push(availableResolution.join('x'));
                }
            }
            keys.push(new Date().getTimezoneOffset());
            if (document.body) {
                keys.push(typeof (document.body.addBehavior));
            }
            else {
                keys.push(typeof undefined);
            }
            if (this.useCanvas && this.isCanvasSupported()) {
                keys.push(this.getCanvasFingerprint());
                keys.push(this.getCanvasFingerprintFeature());
                keys.push(this.getWebGlFeatures());
            }
            if (this.hasIndexedDB() || !!window.msIndexedDB) {
                keys.push("hasIndexDB");
            }
            if (this.hasLocalStorage()) {
                keys.push("hasLocalStorage");
            }
            if (this.hasSessionStorage()) {
                keys.push("hasSessionStorage");
            }
            if (!!window.openDatabase) {
                keys.push("hasOpenDatabase");
            }
            keys.push(navigator.cpuClass || "not supported");
            keys.push(navigator.doNotTrack || "nope");
            keys.push(navigator.platform);
            keys.push(this.getPluginsString());
            keys.push(navigator.mimeTypes);
            keys.push(this.getAdBlock());
            keys.push(this.specialDetermineIEFunction());
            if (this.use64bitHash) {
                return this.murmurhash3_64_gc(keys.join("###"), 31);
            }
            return this.murmurhash3_32_gc(keys.join('###'), 31);
        };
        return FingerPrinting;
    })();
    FingerPrints.FingerPrinting = FingerPrinting;
})(FingerPrints || (FingerPrints = {}));
//# sourceMappingURL=fingerprintjs.js.map