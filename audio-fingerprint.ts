/// <reference path="js/definitions/cryptojs.d.ts" />
/// <reference path="js/interfaces/interfaces.d.ts" />

namespace FingerPrints {
	export class Audio {

		//private pxi_context: OfflineAudioContext;
		//private pxi_oscillator: OscillatorNode;
		//private pxi_compressor: DynamicsCompressorNode;

		/*results*/
		private fingerprint_properties: string;
		private fingerprint_dyanmic_compression_sum_buffer: number;
		private fingerprint_dynamic_compression_full_buffer_hash: string;
		private fingerprint_oscillator_node_output: Array<number>;
		private fingerprint_hybrid_oscillator_dymaic_compression: Array<number>;

		constructor() {

		}

		init = (): void => {
			this.initFingerprintProperties();
			this.initFingerprintDynamicCompression();
			this.initFingerprintOscillatorCompression();
			this.initFingerprintHybridOscillatorDynamicCompression();
		}

		private initFingerprintProperties = (): void => {
			try {
				let currentAudioCtx = AudioContext || webkitAudioContext;
				if (typeof currentAudioCtx !== "function") {
					this.fingerprint_properties = "Not Available";
				}
				else {
					let currentAudioCtxInstance: AudioContext = new currentAudioCtx();
					let audioAnalyzer:AnalyserNode = currentAudioCtxInstance.createAnalyser();
					this.fingerprint_properties = this.metricFingerprint({}, currentAudioCtxInstance, "ac-");
					this.fingerprint_properties = this.metricFingerprint(this.fingerprint_properties, currentAudioCtxInstance.destination, "ac-");
					this.fingerprint_properties = this.metricFingerprint(this.fingerprint_properties, currentAudioCtxInstance.listener, "ac-");

					this.fingerprint_properties = this.metricFingerprint(this.fingerprint_properties, audioAnalyzer, "an-");
					this.fingerprint_properties = JSON.stringify(this.fingerprint_properties, undefined, 2);

				}
			}
			catch (e) {
				this.fingerprint_properties = "";
			}

			//display results
		}

		private initFingerprintDynamicCompression = (): void => {
			try {

				let pxi_context = new (OfflineAudioContext || webkitOfflineAudioContext)(1, 44100, 44100);
				if (!pxi_context) {
					//display results
					this.fingerprint_dyanmic_compression_sum_buffer = 0;
				}

				let pxi_oscillator = pxi_context.createOscillator();
				pxi_oscillator.type = "triangle";
				pxi_oscillator.frequency.value = 1e4;

				let pxi_compressor = pxi_context.createDynamicsCompressor();
				pxi_compressor.threshold && (pxi_compressor.threshold.value = -50);
				pxi_compressor.knee && (pxi_compressor.knee.value = 40);
				pxi_compressor.ratio && (pxi_compressor.ratio.value = 12);
				pxi_compressor.reduction && (pxi_compressor.reduction.value = -20);
				pxi_compressor.attack && (pxi_compressor.attack.value = 0);
				pxi_compressor.release && (pxi_compressor.release.value = 0.25);

				pxi_oscillator.connect(pxi_compressor);
				pxi_compressor.connect(pxi_context.destination);

				pxi_oscillator.start(0);
				pxi_context.startRendering();
				pxi_context.oncomplete = (event): void => {
					this.fingerprint_dyanmic_compression_sum_buffer = 0;
					var sha1 = CryptoJS.algo.SHA1.create();
					for (var i: number = 0; i < (<any>event).renderedBuffer.length; i++) {
						sha1.update((<any>event).renderedBuffer.getChannelData(0)[i].toString());
					}

					var hash = sha1.finalize();
					this.fingerprint_dynamic_compression_full_buffer_hash = hash.toString(CryptoJS.enc.Hex);
					//display results
					for (var i: number = 4500; 5e3 > i; i++) {
						this.fingerprint_dyanmic_compression_sum_buffer += Math.abs((<any>event).renderedBuffer.getChannelData(0)[i]);
					}
					//display results
					pxi_compressor.disconnect();
				};
			}
			catch (e) {
				//display results
				this.fingerprint_dyanmic_compression_sum_buffer = 0;
			}
		}

		private initFingerprintOscillatorCompression = (): void => {
			let necessaryAudioProps: INecessaryAudioContextProperties = this.createNecessaryAudioFingerprinting();
			necessaryAudioProps.Gain.gain.value = 0;
			necessaryAudioProps.Oscillator.type = "triangle";
			necessaryAudioProps.Oscillator.connect(necessaryAudioProps.Analyzer);
			necessaryAudioProps.Analyzer.connect(necessaryAudioProps.ScriptProcessor);
			necessaryAudioProps.ScriptProcessor.connect(necessaryAudioProps.Gain);
			necessaryAudioProps.Gain.connect(necessaryAudioProps.AudioCtx.destination);

			necessaryAudioProps.ScriptProcessor.onaudioprocess = (evnt): void => {
				let bins = new Float32Array(necessaryAudioProps.Analyzer.frequencyBinCount);
				necessaryAudioProps.Analyzer.getFloatFrequencyData(bins);
				for (var i: number = 0; i < bins.length; i++) {
					this.fingerprint_oscillator_node_output.push(bins[i]);
				}

				necessaryAudioProps.Analyzer.disconnect();
				necessaryAudioProps.ScriptProcessor.disconnect();
				necessaryAudioProps.Gain.disconnect();
				//display results
			};

			necessaryAudioProps.Oscillator.start(0);
		}

		private initFingerprintHybridOscillatorDynamicCompression = (): void => {
			let necessaryAudioProps: INecessaryAudioContextProperties = this.createNecessaryAudioFingerprinting();
			let compressor = necessaryAudioProps.AudioCtx.createDynamicsCompressor();
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

			necessaryAudioProps.ScriptProcessor.onaudioprocess = (evnt): void => {
				let bins = new Float32Array(necessaryAudioProps.Analyzer.frequencyBinCount);
				necessaryAudioProps.Analyzer.getFloatFrequencyData(bins);
				for (var i: number = 0; i < bins.length; i++) {
					this.fingerprint_hybrid_oscillator_dymaic_compression.push(bins[i]);
				}

				necessaryAudioProps.Analyzer.disconnect();
				necessaryAudioProps.ScriptProcessor.disconnect();
				necessaryAudioProps.Gain.disconnect();
				//display results
			};

			necessaryAudioProps.Oscillator.start(0);
		}


		private metricFingerprint = (a, b, c): any => {
			for (var d in b) {
				"dopplerFactor" === d || "speedOfSound" === d || "currentTime" === d ||
					"number" !== typeof b[d] && "string" !== typeof b[d] || (a[(c ? c : "") + d] = b[d]);
			}
			return a;
		}

		private createNecessaryAudioFingerprinting = (): INecessaryAudioContextProperties => {
			let AudioCtx: AudioContext = new (AudioContext || webkitAudioContext)();
			let Oscillator: OscillatorNode = AudioCtx.createOscillator();
			let Analyzer: AnalyserNode = AudioCtx.createAnalyser();
			let Gain: GainNode = AudioCtx.createGain();
			let ScriptProcessor: ScriptProcessorNode = AudioCtx.createScriptProcessor(4096, 1, 1);

			return { AudioCtx, Oscillator, Analyzer, Gain, ScriptProcessor};
		}

		private createAudioParam = (val:number): AudioParam => {
			let tempAudioParam: AudioParam = new AudioParam();
			tempAudioParam.value = val;
			return tempAudioParam;
		}
	};
}