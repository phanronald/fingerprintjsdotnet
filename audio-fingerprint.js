/// <reference path="js/definitions/webaudioapi.d.ts" />
/// <reference path="js/definitions/cryptojs.d.ts" />
/// <reference path="js/interfaces/interfaces.d.ts" />
var FingerPrints;
(function (FingerPrints) {
    var Audio = (function () {
        function Audio() {
            var _this = this;
            this.init = function () {
                _this.initFingerprintProperties();
                _this.initFingerprintDynamicCompression();
                _this.initFingerprintOscillatorCompression();
                _this.initFingerprintHybridOscillatorDynamicCompression();
            };
            this.initFingerprintProperties = function () {
                try {
                    var currentAudioCtx = AudioContext || webkitAudioContext;
                    if (typeof currentAudioCtx !== "function") {
                        _this.fingerprint_properties = "Not Available";
                    }
                    else {
                        var currentAudioCtxInstance = new currentAudioCtx();
                        var audioAnalyzer = currentAudioCtxInstance.createAnalyser();
                        _this.fingerprint_properties = _this.metricFingerprint({}, currentAudioCtxInstance, "ac-");
                        _this.fingerprint_properties = _this.metricFingerprint(_this.fingerprint_properties, currentAudioCtxInstance.destination, "ac-");
                        _this.fingerprint_properties = _this.metricFingerprint(_this.fingerprint_properties, currentAudioCtxInstance.listener, "ac-");
                        _this.fingerprint_properties = _this.metricFingerprint(_this.fingerprint_properties, audioAnalyzer, "an-");
                        _this.fingerprint_properties = JSON.stringify(_this.fingerprint_properties, undefined, 2);
                    }
                }
                catch (e) {
                    _this.fingerprint_properties = "";
                }
                //display results
            };
            this.initFingerprintDynamicCompression = function () {
                try {
                    var pxi_context = new (OfflineAudioContext || webkitOfflineAudioContext)(1, 44100, 44100);
                    if (!pxi_context) {
                        //display results
                        _this.fingerprint_dyanmic_compression_sum_buffer = 0;
                    }
                    var pxi_oscillator = pxi_context.createOscillator();
                    pxi_oscillator.type = "triangle";
                    pxi_oscillator.frequency.value = 1e4;
                    var pxi_compressor_1 = pxi_context.createDynamicsCompressor();
                    pxi_compressor_1.threshold && (pxi_compressor_1.threshold.value = -50);
                    pxi_compressor_1.knee && (pxi_compressor_1.knee.value = 40);
                    pxi_compressor_1.ratio && (pxi_compressor_1.ratio.value = 12);
                    pxi_compressor_1.reduction && (pxi_compressor_1.reduction.value = -20);
                    pxi_compressor_1.attack && (pxi_compressor_1.attack.value = 0);
                    pxi_compressor_1.release && (pxi_compressor_1.release.value = 0.25);
                    pxi_oscillator.connect(pxi_compressor_1);
                    pxi_compressor_1.connect(pxi_context.destination);
                    pxi_oscillator.start(0);
                    pxi_context.startRendering();
                    pxi_context.oncomplete = function (event) {
                        _this.fingerprint_dyanmic_compression_sum_buffer = 0;
                        var sha1 = CryptoJS.algo.SHA1.create();
                        for (var i = 0; i < event.renderedBuffer.length; i++) {
                            sha1.update(event.renderedBuffer.getChannelData(0)[i].toString());
                        }
                        var hash = sha1.finalize();
                        _this.fingerprint_dynamic_compression_full_buffer_hash = hash.toString(CryptoJS.enc.Hex);
                        //display results
                        for (var i = 4500; 5e3 > i; i++) {
                            _this.fingerprint_dyanmic_compression_sum_buffer += Math.abs(event.renderedBuffer.getChannelData(0)[i]);
                        }
                        //display results
                        pxi_compressor_1.disconnect();
                    };
                }
                catch (e) {
                    //display results
                    _this.fingerprint_dyanmic_compression_sum_buffer = 0;
                }
            };
            this.initFingerprintOscillatorCompression = function () {
                var necessaryAudioProps = _this.createNecessaryAudioFingerprinting();
                necessaryAudioProps.Gain.gain.value = 0;
                necessaryAudioProps.Oscillator.type = "triangle";
                necessaryAudioProps.Oscillator.connect(necessaryAudioProps.Analyzer);
                necessaryAudioProps.Analyzer.connect(necessaryAudioProps.ScriptProcessor);
                necessaryAudioProps.ScriptProcessor.connect(necessaryAudioProps.Gain);
                necessaryAudioProps.Gain.connect(necessaryAudioProps.AudioCtx.destination);
                necessaryAudioProps.ScriptProcessor.onaudioprocess = function (evnt) {
                    var bins = new Float32Array(necessaryAudioProps.Analyzer.frequencyBinCount);
                    necessaryAudioProps.Analyzer.getFloatFrequencyData(bins);
                    for (var i = 0; i < bins.length; i++) {
                        _this.fingerprint_oscillator_node_output.push(bins[i]);
                    }
                    necessaryAudioProps.Analyzer.disconnect();
                    necessaryAudioProps.ScriptProcessor.disconnect();
                    necessaryAudioProps.Gain.disconnect();
                    //display results
                };
                necessaryAudioProps.Oscillator.start(0);
            };
            this.initFingerprintHybridOscillatorDynamicCompression = function () {
                var necessaryAudioProps = _this.createNecessaryAudioFingerprinting();
                var compressor = necessaryAudioProps.AudioCtx.createDynamicsCompressor();
                compressor.threshold && (compressor.threshold.value = -50);
                compressor.knee && (compressor.knee.value = 40);
                compressor.ratio && (compressor.ratio.value = 12);
                compressor.reduction && (compressor.reduction.value = -20);
                compressor.attack && (compressor.attack.value = 0);
                compressor.release && (compressor.release.value = 0.25);
                necessaryAudioProps.Gain.gain.value = 0;
                necessaryAudioProps.Oscillator.type = "triangle";
                necessaryAudioProps.Oscillator.connect(compressor);
                compressor.connect(necessaryAudioProps.Analyzer);
                necessaryAudioProps.Analyzer.connect(necessaryAudioProps.ScriptProcessor);
                necessaryAudioProps.ScriptProcessor.connect(necessaryAudioProps.Gain);
                necessaryAudioProps.Gain.connect(necessaryAudioProps.AudioCtx.destination);
                necessaryAudioProps.ScriptProcessor.onaudioprocess = function (evnt) {
                    var bins = new Float32Array(necessaryAudioProps.Analyzer.frequencyBinCount);
                    necessaryAudioProps.Analyzer.getFloatFrequencyData(bins);
                    for (var i = 0; i < bins.length; i++) {
                        _this.fingerprint_hybrid_oscillator_dymaic_compression.push(bins[i]);
                    }
                    necessaryAudioProps.Analyzer.disconnect();
                    necessaryAudioProps.ScriptProcessor.disconnect();
                    necessaryAudioProps.Gain.disconnect();
                    //display results
                };
                necessaryAudioProps.Oscillator.start(0);
            };
            this.metricFingerprint = function (a, b, c) {
                for (var d in b) {
                    "dopplerFactor" === d || "speedOfSound" === d || "currentTime" === d ||
                        "number" !== typeof b[d] && "string" !== typeof b[d] || (a[(c ? c : "") + d] = b[d]);
                }
                return a;
            };
            this.createNecessaryAudioFingerprinting = function () {
                var AudioCtx = new (AudioContext || webkitAudioContext)();
                var Oscillator = AudioCtx.createOscillator();
                var Analyzer = AudioCtx.createAnalyser();
                var Gain = AudioCtx.createGain();
                var ScriptProcessor = AudioCtx.createScriptProcessor(4096, 1, 1);
                return { AudioCtx: AudioCtx, Oscillator: Oscillator, Analyzer: Analyzer, Gain: Gain, ScriptProcessor: ScriptProcessor };
            };
            this.createAudioParam = function (val) {
                var tempAudioParam = new AudioParam();
                tempAudioParam.value = val;
                return tempAudioParam;
            };
        }
        return Audio;
    }());
    FingerPrints.Audio = Audio;
    ;
})(FingerPrints || (FingerPrints = {}));
//# sourceMappingURL=audio-fingerprint.js.map