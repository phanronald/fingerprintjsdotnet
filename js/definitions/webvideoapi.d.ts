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

interface VideoNode extends SourceNode {
	preloadTime: number;
	sourceOffset: number;
	globalPlaybackRate: number;
	playbackRate: number;
	playbackRateUpdated: boolean;
	loopElement: boolean;

	setPlaybackRate(playbackRate: number): void;
	getPlaybackRate(): number;

	load(): void;
	destroy(): void;
	seek(): void;
	update(): void;
	clearTimelineState(): void;
}

declare var VideoNode: {
	prototype: VideoNode;
	new (src: Element | string, gl: WebGLRenderingContext, renderGraph: RenderGraph, currentTime: number,
		globalPlaybackRate: number, sourceOffset: number, preloadTime: number, loop: boolean): VideoNode;
}

interface ImageNode extends SourceNode {
	load(): void;
	destroy(): void;
	seek(): void;
	update(): void;
}

declare var ImageNode: {
	prototype: ImageNode;
	new (src: Element | string, gl: WebGLRenderingContext, renderGraph: RenderGraph, currentTime: number, preloadTime: number): ImageNode;
}

interface CanvasNode extends SourceNode {
	load(): void;
	destroy(): void;
	seek(): void;
	update(): void;
}

declare var CanvasNode: {
	prototype: CanvasNode;
	new (canvas: HTMLCanvasElement | string, gl: WebGLRenderingContext, renderGraph: RenderGraph, currentTime: number, preloadTime: number): CanvasNode;
}

/*other for now*/
interface VideoContext extends EventTarget {

}

declare var VideoContext: {
	prototype: VideoContext;
	new (canvas: HTMLCanvasElement, initErrorCallback: Function): VideoContext;
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
	'PLAYING',
	'PAUSED',
	'STALLED',
	'ENDED',
	'BROKEN',
	'SEQUENCED',
	'WAITING'
}

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