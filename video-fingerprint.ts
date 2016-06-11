/// <reference path="js/interfaces/interfaces.d.ts" />
/// <reference path="js/definitions/webvideoapi.d.ts" />
/// <reference path="js/models/video-definitions-content.ts" />

namespace FingerPrints {
	export class Video {

		private videoCtx: VideoContext;
		private videoModels: VideoDefinitionContent;

		constructor(public canvas: HTMLCanvasElement, public callbackFunc?: Function) {
			this.videoCtx = new VideoContext(this.canvas, this.callbackFunc);
			this.videoModels = new VideoDefinitionContent();
		}

		init = (): void => {

			this.testVideoNode();
		}

		private testEffectNode = (): void => {
			var effectNode = this.videoCtx.createEffectNode(this.videoModels.monochrome);
			var transitionNode = this.videoCtx.createTransitionNode(this.videoModels.crossfade);
			var compositingNode = this.videoCtx.createCompositingNode(this.videoModels.monochrome);
		}

		private testVideoNode = (): void => {
			var videoElement = document.createElement("video");
            var videoNode1 = this.videoCtx.createVideoSourceNode(videoElement);
            var videoNode2 = this.videoCtx.createVideoSourceNode(videoElement);
            videoNode1.start(10);
            videoNode1.stop(20.245);
            videoNode2.start(0);
            videoNode2.stop(10);
			//console.log(this.videoCtx == 20.245);
		}
	}
}