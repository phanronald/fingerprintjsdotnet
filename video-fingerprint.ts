/// <reference path="js/interfaces/interfaces.d.ts" />
/// <reference path="js/definitions/webvideoapi.d.ts" />
/// <reference path="js/models/video-definitions-content.ts" />

namespace FingerPrints {
	export class Video {

		private videoCtx: VideoContext;
		private videoModels: VideoDefinitionContent;

		constructor(public canvas: HTMLCanvasElement, public callbackFunc?: Function) {
			this.videoCtx = new VideoContext(this.canvas, this.callbackFunc);
			this.canvas.style.display = '';
			this.videoModels = new VideoDefinitionContent();
		}

		init = (): void => {

			var that = this;
			window.onload = () => {

				let videoNode1 = that.videoCtx.createVideoSourceNode("video1.mp4", 0, 4, false, true);
				videoNode1.start(0);
				videoNode1.stop(4);

				let videoNode2 = that.videoCtx.createVideoSourceNode("video2.mp4", 0, 4, false, true);
				videoNode2.start(2);
				videoNode2.stop(6);

				let crossFade = that.videoCtx.createTransitionNode(that.videoModels.crossfade);
				crossFade.transition(2, 4, 0.0, 1.0, "mix");

				videoNode2.connect(crossFade);
				videoNode1.connect(crossFade);
				crossFade.connect(that.videoCtx.destination);

				this.videoCtx.play();
			};

			//this.testVideoNode();
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
			console.log(this.videoCtx.duration == 20.245);
		}
	}
}