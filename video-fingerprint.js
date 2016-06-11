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
                _this.testVideoNode();
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
                _this.videoCtx.duration = 12;
                console.log(_this.videoCtx.duration);
            };
            this.videoCtx = new VideoContext(this.canvas, this.callbackFunc);
            this.videoModels = new FingerPrints.VideoDefinitionContent();
        }
        return Video;
    }());
    FingerPrints.Video = Video;
})(FingerPrints || (FingerPrints = {}));
//# sourceMappingURL=video-fingerprint.js.map