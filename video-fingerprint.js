/// <reference path="js/interfaces/interfaces.d.ts" />
/// <reference path="js/definitions/webvideoapi.d.ts" />
/// <reference path="js/models/video-definitions-content.ts" />
var FingerPrints;
(function (FingerPrints) {
    var Video = (function () {
        function Video(canvas, callbackFunc) {
            var _this = this;
            this.canvas = canvas;
            this.callbackFunc = callbackFunc;
            this.init = function () {
                var that = _this;
                window.onload = function () {
                    var videoNode1 = that.videoCtx.createVideoSourceNode("video1.mp4", 0, 4, false, true);
                    videoNode1.start(0);
                    videoNode1.stop(4);
                    var videoNode2 = that.videoCtx.createVideoSourceNode("video2.mp4", 0, 4, false, true);
                    videoNode2.start(2);
                    videoNode2.stop(6);
                    var crossFade = that.videoCtx.createTransitionNode(that.videoModels.crossfade);
                    crossFade.transition(2, 4, 0.0, 1.0, "mix");
                    videoNode2.connect(crossFade);
                    videoNode1.connect(crossFade);
                    crossFade.connect(that.videoCtx.destination);
                    _this.videoCtx.play();
                };
                //this.testVideoNode();
            };
            this.testEffectNode = function () {
                var effectNode = _this.videoCtx.createEffectNode(_this.videoModels.monochrome);
                var transitionNode = _this.videoCtx.createTransitionNode(_this.videoModels.crossfade);
                var compositingNode = _this.videoCtx.createCompositingNode(_this.videoModels.monochrome);
            };
            this.testVideoNode = function () {
                var videoElement = document.createElement("video");
                var videoNode1 = _this.videoCtx.createVideoSourceNode(videoElement);
                var videoNode2 = _this.videoCtx.createVideoSourceNode(videoElement);
                videoNode1.start(10);
                videoNode1.stop(20.245);
                videoNode2.start(0);
                videoNode2.stop(10);
                console.log(_this.videoCtx.duration == 20.245);
            };
            this.videoCtx = new VideoContext(this.canvas, this.callbackFunc);
            this.canvas.style.display = '';
            this.videoModels = new FingerPrints.VideoDefinitionContent();
        }
        return Video;
    }());
    FingerPrints.Video = Video;
})(FingerPrints || (FingerPrints = {}));
//# sourceMappingURL=video-fingerprint.js.map