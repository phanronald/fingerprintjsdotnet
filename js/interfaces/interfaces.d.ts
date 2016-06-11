/* Audio Interfaces */
interface INecessaryAudioContextProperties {
	AudioCtx: AudioContext;
	Oscillator:OscillatorNode;
	Analyzer: AnalyserNode;
	Gain: GainNode;
	ScriptProcessor: ScriptProcessorNode;
}

/* Video Interfaces */
interface IConnection {
	Source: GraphNode,
	Destination: GraphNode,
	Type: string,
	Target: string | number
}
interface IVideoException {
	message: string;
	name: string;
}

interface INodeWebGLDefinition {
	title: string;
	description: string;
	fragmentShader: string;
	vertexShader: string;
	inputs: string[];
	properties: any;
}

interface IWebGLTextureUnitMapping {
	name: string;
	textureUnit: number;
}

interface ITimelineCallback {
	time: number;
	func: Function;
	ordering: number;
}

interface ITransition {
	start: number;
	end: number;
	current: number;
	target: number;
	property: string;
}