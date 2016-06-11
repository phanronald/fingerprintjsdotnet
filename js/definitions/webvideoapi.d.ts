// all the gets and sets must be the same

interface VideoContext extends EventTarget {
	canvas: HTMLCanvasElement;
	gl: WebGLRenderingContext;
	renderGraph: RenderGraph;
	sourceNodes: SourceNode;
	processingNodes: ProcessingNode;

	timeline: number[];
	currentTime: number;
	state: VideoState;
	playbackRate: number;
	destinationNode: DestinationNode;
	//callbacks: Map<string, Function>;
	timelineCallbacks: ITimelineCallback[];

	registerTimelineCallback(time: number, func: Function, ordering?: number): void;
	unregisterTimelineCallback(func: Function): void;
	registerCallback(type: string, func: Function): void;
	unregisterCallback(func: Function): boolean;
	callCallbacks(type: string): any; //
	getCanvas(): HTMLCanvasElement;
	getState(): VideoState;
	setCurrentTime(currentTime: number): void;
	getCurrentTime(): number;
	getDuration(): number;
	getDestination(): DestinationNode;
	setPlaybackRate(rate: number): void;
	getPlaybackRate(): number;

	play(): boolean;
	pause(): boolean;

	createVideoSourceNode(src: Element | string, sourceOffset?: number, preloadTime?: number, loop?: boolean): VideoNode;
	createImageSourceNode(src: Element | string, sourceOffset?: number, preloadTime?: number): ImageNode;
	createCanvasSourceNode(canvas: HTMLCanvasElement, sourceOffset?: number, preloadTime?: number): CanvasNode;

	createEffectNode(definition: INodeWebGLDefinition): EffectNode;
	createCompositingNode(definition: INodeWebGLDefinition): CompositingNode;
	createTransitionNode(definition: INodeWebGLDefinition): TransitionNode;

	isStalled(): boolean;
	update(dt:number): void;
}

declare var VideoContext: {
	prototype: VideoContext;
	new (canvas: HTMLCanvasElement, initErrorCallback?: Function): VideoContext;
}

interface RenderGraph extends EventTarget {
	connections: IConnection[];
	getOutputsForNode(node: GraphNode): GraphNode[];
	getNamedInputsForNode(node: GraphNode): IConnection[];
	getZIndexInputsForNode(node: GraphNode): IConnection[];
	getInputsForNode(node: GraphNode): GraphNode[];
	isInputAvailable(node: GraphNode, inputName: string): boolean;
	registerConnection(sourceNode: GraphNode, destinationNode: GraphNode, target: string | number): boolean;
	unregisterConnection(sourceNode: GraphNode, destinationNode: GraphNode): boolean;
}

declare var RenderGraph: {
	prototype: RenderGraph;
	new (): RenderGraph;
}

interface GraphNode extends EventTarget {
	gl: WebGLRenderingContext;
	renderGraph: RenderGraph;
	limitConnections: boolean;
	inputNames(): string[];
	maximumConnections(): number;
	inputs(): GraphNode[];
	outputs(): GraphNode[];
	connect(targetNode: GraphNode, targetPort: string | number): boolean;
	disconnect(targetNode: GraphNode): boolean;
}

declare var GraphNode: {
	prototype: GraphNode;
	new (gl: WebGLRenderingContext, renderGraph: RenderGraph, inputNames: string[], limitConnections: boolean): GraphNode;
}

interface SourceNode extends GraphNode {
	element: Element;
	elementUrl: string;
	isResponsibleForElementLifeCycle: boolean;
	state: VideoState;
	currentTime: number;
	startTime: number;
	stopTime: number;
	ready: boolean;
	texture: WebGLTexture;
	callbacks: Function[];

	load(): void;
	destroy(): void;
	seek(): void;
	pause(): void;
	play(): void;
	isReady(): void;
	update(): void;
	clearTimelineState(): void;

	getState(): VideoState;
	getElement(): Element;
	getDuration(): number;
	registerCallback(type: string, func: Function): void;
	unregisterCallback(func: Function): void;
	start(time: number): boolean;
	startAt(time: number): boolean;
	stop(time: number): boolean;
	stopAt(time: number): boolean;
}

declare var SourceNode: {
	prototype: SourceNode;
	new (src: Element | string, gl: WebGLRenderingContext, renderGraph: RenderGraph, currentTime: number): SourceNode;
}

interface ProcessingNode extends GraphNode {
	vertexShader: string;
	fragmentShader: string;
	properties: any;

	inputTextureUnitMapping: IWebGLTextureUnitMapping[];
	maxTextureUnits: any;
	boundTextureUnits: number;
	parameterTextureCount: number;
	inputTextureCount: number;
	texture: WebGLTexture;
	program: WebGLProgram;
	framebuffer: WebGLBuffer;
	currentTimeLocation: WebGLUniformLocation;
	currentTime: number;
	rendered: boolean;

	update(currentTime: number): void;
	render(): void;
}

declare var ProcessingNode: {
	prototype: ProcessingNode;
	new (gl: WebGLRenderingContext, renderGraph: RenderGraph, definition: INodeWebGLDefinition, inputNames: string[], limitConnections: boolean): ProcessingNode;

}

interface DestinationNode extends ProcessingNode {
	render(): void;
}

declare var DestinationNode: {
	prototype: DestinationNode;
	new (gl: WebGLRenderingContext, renderGraph: RenderGraph): DestinationNode;

}

interface VideoNode extends SourceNode {
	preloadTime: number;
	sourceOffset: number;
	globalPlaybackRate: number;
	playbackRate: number;
	playbackRateUpdated: boolean;
	loopElement: boolean;

	setPlaybackRate(playbackRate: number): void;
	getPlaybackRate(): number;
}

declare var VideoNode: {
	prototype: VideoNode;
	new (src: Element | string, gl: WebGLRenderingContext, renderGraph: RenderGraph, currentTime: number,
		globalPlaybackRate: number, sourceOffset: number, preloadTime: number, loop: boolean): VideoNode;
}

interface ImageNode extends SourceNode {

}

declare var ImageNode: {
	prototype: ImageNode;
	new (src: Element | string, gl: WebGLRenderingContext, renderGraph: RenderGraph, currentTime: number, preloadTime: number): ImageNode;
}

interface CanvasNode extends SourceNode {

}

declare var CanvasNode: {
	prototype: CanvasNode;
	new (canvas: HTMLCanvasElement | string, gl: WebGLRenderingContext, renderGraph: RenderGraph, currentTime: number, preloadTime: number): CanvasNode;

}

interface EffectNode extends ProcessingNode {
	placeholderTexture: WebGLTexture;
	render(): void;
}

declare var EffectNode : {
	prototype: EffectNode;
	new (gl: WebGLRenderingContext, renderGraph: RenderGraph, definition: INodeWebGLDefinition): EffectNode;

}

interface CompositingNode extends ProcessingNode {
	placeholderTexture: WebGLTexture;
	render(): void;
}

declare var CompositingNode: {
	prototype: CompositingNode;
	new (gl: WebGLRenderingContext, renderGraph: RenderGraph, definition: INodeWebGLDefinition): CompositingNode;

}

interface TransitionNode extends ProcessingNode {
	transitions: ITransition;
	initialPropertyValues: any;
	transition(startTime: number, endTime: number, currentValue: number, targetValue: number, propertyName: string): void;

	doesTransitionFitOnTimeline(transition: ITransition): void;
	insertTransitionInTimeline(transition: ITransition): void;
	clearTransitions(propertyName: string):void;
	update(currentTime: number): void;
}

declare var TransitionNode: {
	prototype: TransitionNode;
	new (gl: WebGLRenderingContext, renderGraph: RenderGraph, definition: INodeWebGLDefinition): TransitionNode;
}

interface ConnectException extends IVideoException {
}

declare var ConnectException: {
	prototype: ConnectException;
	new (message: string): ConnectException;
}

interface RenderException extends IVideoException {
}

declare var RenderException: {
	prototype: RenderException;
	new (message: string): RenderException;
}

declare enum VideoState {
	'PLAYING' = 0,
	'PAUSED' = 1,
	'STALLED' = 2,
	'ENDED' = 3,
	'BROKEN' = 4,
	'SEQUENCED' = 5,
	'WAITING' = 6
}