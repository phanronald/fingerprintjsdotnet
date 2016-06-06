interface Utils {
	compileShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number): WebGLShader;
	createShaderProgram(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram;
	createElementTexutre(gl: WebGLRenderingContext, type: Uint8Array, width: number, height: number): WebGLTexture;
	updateTexture(gl: WebGLRenderingContext, texture: WebGLTexture, element: Element): void;
	clearTexture(gl: WebGLRenderingContext, texture: WebGLTexture): void;
	//createControlFormForNode(node, nodeName);
	//calculateNodeDepthFromDestination(videoContext);
}