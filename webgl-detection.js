/// <reference path="js/enumerable.ts" />
var WebGLDetection;
(function (WebGLDetection_1) {
    var WebGLDetection = (function () {
        function WebGLDetection(webglVersionToDetect) {
            var _this = this;
            this.webGLVersion = 0;
            this.IsWebGLSupported = false;
            this.WebGLIsSupported = function () {
                if (_this.webGLVersion < 1 || _this.webGLVersion > 2) {
                    return false;
                }
                if ((_this.webGLVersion === 2 && !window.WebGL2RenderingContext) ||
                    (_this.webGLVersion === 1 && !window.WebGLRenderingContext)) {
                    return false;
                }
                return true;
            };
            this.CreateCanvasFindContext = function () {
                var canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                document.body.appendChild(canvas);
                var possibleNames = (_this.webGLVersion === 2) ? ['webgl2', 'experimental-webgl2'] :
                    ['webgl', 'experimental-webgl'];
                var possibleNamesCollection = new Enumberable(possibleNames);
                var gl;
                possibleNamesCollection.ForEach(function (val, index) {
                    gl = canvas.getContext(val, {
                        stencil: true
                    });
                    if (gl !== null) {
                        return;
                    }
                });
                canvas.remove();
            };
            this.GetWebGL2Status = function (gl, contextName) {
                var webgl2Names = [
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
                var webgl2 = (contextName.indexOf('webgl2') !== -1);
                var functions = [];
                var totalImplemented = 0;
                var length = webgl2Names.length;
                if (webgl2) {
                    for (var i = 0; i < length; ++i) {
                        var name_1 = webgl2Names[i];
                        var nameSupported = true;
                        if (webgl2 && gl[name_1]) {
                            ++totalImplemented;
                        }
                        else {
                            nameSupported = false;
                        }
                        functions.push({
                            name: name_1,
                            isSupported: nameSupported
                        });
                    }
                }
                return {
                    status: webgl2 ? (totalImplemented + ' of ' + length + ' new functions implemented.') : 'webgl2 and experimental-webgl2 contexts not available.',
                    webgl2functionInfo: functions
                };
            };
            this.webGLVersion = webglVersionToDetect;
            this.IsWebGLSupported = this.WebGLIsSupported();
            this.webglReport = {
                platform: navigator.platform,
                userAgent: navigator.userAgent,
                webglversion: webglVersionToDetect.toString()
            };
        }
        return WebGLDetection;
    }());
    WebGLDetection_1.WebGLDetection = WebGLDetection;
})(WebGLDetection || (WebGLDetection = {}));
