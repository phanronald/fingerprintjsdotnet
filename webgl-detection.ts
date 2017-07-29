/// <reference path="js/enumerable.ts" />

namespace WebGLDetection {

	interface IReport {
		platform: string;
		userAgent: string;
		webglversion: string;
	}

	interface IWebGL2FunctionNameSupport {
		name: string;
		isSupported: boolean;
	}

	interface IWebGL2Status {
		status: string;
		webgl2functionInfo: IWebGL2FunctionNameSupport[]
	}

	export class WebGLDetection {
		private webglReport: IReport;
		private webGLVersion: number = 0;

		public IsWebGLSupported: boolean = false;

		constructor(webglVersionToDetect: number) {

			this.webGLVersion = webglVersionToDetect;

			this.IsWebGLSupported = this.WebGLIsSupported();

			this.webglReport = {
				platform: navigator.platform,
				userAgent: navigator.userAgent,
				webglversion: webglVersionToDetect.toString()
			}

		}

		private WebGLIsSupported = (): boolean => {


			if (this.webGLVersion < 1 || this.webGLVersion > 2) {
				return false;
			}

			if ((this.webGLVersion === 2 && !(<any>window).WebGL2RenderingContext) ||
				(this.webGLVersion === 1 && !(<any>window).WebGLRenderingContext)) {

				return false;

			}

			return true;
		}

		private CreateCanvasFindContext = (): void => {

			var canvas: HTMLCanvasElement = document.createElement('canvas');
			canvas.width = 1;
			canvas.height = 1;
			document.body.appendChild(canvas);

			var possibleNames: Array<string> = (this.webGLVersion === 2) ? ['webgl2', 'experimental-webgl2'] :
				['webgl', 'experimental-webgl'];

			var possibleNamesCollection: Enumberable<string> = new Enumberable(possibleNames);

			var gl: WebGLRenderingContext | CanvasRenderingContext2D;

			possibleNamesCollection.ForEach((val: string, index: number) => {
				gl = canvas.getContext(val, {
					stencil: true
				});

				if (gl !== null) {
					return;
				}
			});

			canvas.remove();
		}

		private GetWebGL2Status = (gl: WebGLRenderingContext | CanvasRenderingContext2D, contextName: string): IWebGL2Status => {

			let webgl2Names: string[] = [
				'copyBufferSubData',
				'getBufferSubData',
				'blitFramebuffer',
				'framebufferTextureLayer',
				'getInternalformatParameter',
				'invalidateFramebuffer',
				'invalidateSubFramebuffer',
				'readBuffer',
				'renderbufferStorageMultisample',
				'texStorage2D',
				'texStorage3D',
				'texImage3D',
				'texSubImage3D',
				'copyTexSubImage3D',
				'compressedTexImage3D',
				'compressedTexSubImage3D',
				'getFragDataLocation',
				'uniform1ui',
				'uniform2ui',
				'uniform3ui',
				'uniform4ui',
				'uniform1uiv',
				'uniform2uiv',
				'uniform3uiv',
				'uniform4uiv',
				'uniformMatrix2x3fv',
				'uniformMatrix3x2fv',
				'uniformMatrix2x4fv',
				'uniformMatrix4x2fv',
				'uniformMatrix3x4fv',
				'uniformMatrix4x3fv',
				'vertexAttribI4i',
				'vertexAttribI4iv',
				'vertexAttribI4ui',
				'vertexAttribI4uiv',
				'vertexAttribIPointer',
				'vertexAttribDivisor',
				'drawArraysInstanced',
				'drawElementsInstanced',
				'drawRangeElements',
				'drawBuffers',
				'clearBufferiv',
				'clearBufferuiv',
				'clearBufferfv',
				'clearBufferfi',
				'createQuery',
				'deleteQuery',
				'isQuery',
				'beginQuery',
				'endQuery',
				'getQuery',
				'getQueryParameter',
				'createSampler',
				'deleteSampler',
				'isSampler',
				'bindSampler',
				'samplerParameteri',
				'samplerParameterf',
				'getSamplerParameter',
				'fenceSync',
				'isSync',
				'deleteSync',
				'clientWaitSync',
				'waitSync',
				'getSyncParameter',
				'createTransformFeedback',
				'deleteTransformFeedback',
				'isTransformFeedback',
				'bindTransformFeedback',
				'beginTransformFeedback',
				'endTransformFeedback',
				'transformFeedbackVaryings',
				'getTransformFeedbackVarying',
				'pauseTransformFeedback',
				'resumeTransformFeedback',
				'bindBufferBase',
				'bindBufferRange',
				'getIndexedParameter',
				'getUniformIndices',
				'getActiveUniforms',
				'getUniformBlockIndex',
				'getActiveUniformBlockParameter',
				'getActiveUniformBlockName',
				'uniformBlockBinding',
				'createVertexArray',
				'deleteVertexArray',
				'isVertexArray',
				'bindVertexArray'
			];

			let webgl2: boolean = (contextName.indexOf('webgl2') !== -1);
			let functions: Array<IWebGL2FunctionNameSupport> = [];
			let totalImplemented: number = 0;
			let length: number = webgl2Names.length;

			if (webgl2) {
				for (var i:number = 0; i < length; ++i) {
					let name:string = webgl2Names[i];
					let nameSupported: boolean = true;

					if (webgl2 && gl[name]) {
						++totalImplemented;
					}
					else {
						nameSupported = false;
					}

					functions.push({
						name: name,
						isSupported: nameSupported
					});
				}
			}

			return {
				status: webgl2 ? (totalImplemented + ' of ' + length + ' new functions implemented.') : 'webgl2 and experimental-webgl2 contexts not available.',
				webgl2functionInfo: functions
			};

		}

	}

}