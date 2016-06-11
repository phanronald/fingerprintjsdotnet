/// <reference path="../interfaces/interfaces.d.ts" />

namespace FingerPrints {
	export class VideoDefinitionContent {

		constructor() {
		}

		get aaf_video_scale(): INodeWebGLDefinition {
			return {
				title: "AAF Video Scale Effect",
				description: "A scale effect based on the AAF spec.",
				vertexShader: "\
					attribute vec2 a_position;\
					attribute vec2 a_texCoord;\
					varying vec2 v_texCoord;\
					void main() {\
						gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
						v_texCoord = a_texCoord;\
					}",
				fragmentShader: "\
					precision mediump float;\
					uniform sampler2D u_image;\
					uniform float scaleX;\
					uniform float scaleY;\
					varying vec2 v_texCoord;\
					varying float v_progress;\
					void main(){\
						vec2 pos = vec2(v_texCoord[0]*1.0/scaleX - (1.0/scaleX/2.0 -0.5), v_texCoord[1]*1.0/scaleY - (1.0/scaleY/2.0 -0.5));\
						vec4 color = texture2D(u_image, pos);\
						if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){\
						    color = vec4(0.0,0.0,0.0,0.0);\
						}\
						gl_FragColor = color;\
					}",
				properties: {
					"scaleX": { type: "uniform", value: 1.0 },
					"scaleY": { type: "uniform", value: 1.0 },
				},
				inputs: ["u_image"]
			};
		}

		get aaf_video_crop(): INodeWebGLDefinition {
			return {
				title: "AAF Video Crop Effect",
				description: "A crop effect based on the AAF spec.",
				vertexShader: "\
					attribute vec2 a_position;\
					attribute vec2 a_texCoord;\
					varying vec2 v_texCoord;\
					void main() {\
						gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
						v_texCoord = a_texCoord;\
					}",
				fragmentShader: "\
					precision mediump float;\
					uniform sampler2D u_image;\
					uniform float cropLeft;\
					uniform float cropRight;\
					uniform float cropTop;\
					uniform float cropBottom;\
					varying vec2 v_texCoord;\
					void main(){\
						vec4 color = texture2D(u_image, v_texCoord);\
						if (v_texCoord[0] < (cropLeft+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\
						if (v_texCoord[0] > (cropRight+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\
						if (v_texCoord[1] < (-cropBottom+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\
						if (v_texCoord[1] > (-cropTop+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\
						gl_FragColor = color;\
					}",
				properties: {
					"cropLeft": { type: "uniform", value: -1.0 },
					"cropRight": { type: "uniform", value: 1.0 },
					"cropTop": { type: "uniform", value: -1.0 },
					"cropBottom": { type: "uniform", value: 1.0 }
				},
				inputs: ["u_image"]
			};
		}

		get aaf_video_flip(): INodeWebGLDefinition {
			return {
				title: "AAF Video Scale Effect",
				description: "A flip effect based on the AAF spec. Mirrors the image in the x-axis",
				vertexShader: "\
					attribute vec2 a_position;\
					attribute vec2 a_texCoord;\
					varying vec2 v_texCoord;\
					void main() {\
					    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
					    v_texCoord = a_texCoord;\
					}",
				fragmentShader: "\
					precision mediump float;\
					uniform sampler2D u_image;\
					varying vec2 v_texCoord;\
					void main(){\
						vec2 coord = vec2(v_texCoord[0] ,1.0 - v_texCoord[1]);\
						vec4 color = texture2D(u_image, coord);\
						gl_FragColor = color;\
					}",
				properties: {
				},
				inputs: ["u_image"]
			};
		}

		get aaf_video_flop(): INodeWebGLDefinition {
			return {
				title: "AAF Video Scale Effect",
				description: "A flop effect based on the AAF spec. Mirrors the image in the y-axis",
				vertexShader: "\
					attribute vec2 a_position;\
					attribute vec2 a_texCoord;\
					varying vec2 v_texCoord;\
					void main() {\
						gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
						v_texCoord = a_texCoord;\
					}",
				fragmentShader: "\
					precision mediump float;\
					uniform sampler2D u_image;\
					varying vec2 v_texCoord;\
					void main(){\
						vec2 coord = vec2(1.0 - v_texCoord[0] ,v_texCoord[1]);\
						vec4 color = texture2D(u_image, coord);\
						gl_FragColor = color;\
					}",
				properties: {
				},
				inputs: ["u_image"]
			};
		}

		get crossfade(): INodeWebGLDefinition {
			return {
				title: "Cross-Fade",
				description: "A cross-fade effect. Typically used as a transistion.",
				vertexShader: "\
                    attribute vec2 a_position;\
                    attribute vec2 a_texCoord;\
                    varying vec2 v_texCoord;\
                    void main() {\
                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                        v_texCoord = a_texCoord;\
                    }",
                fragmentShader: "\
                    precision mediump float;\
                    uniform sampler2D u_image_a;\
                    uniform sampler2D u_image_b;\
                    uniform float mix;\
                    varying vec2 v_texCoord;\
                    varying float v_mix;\
                    void main(){\
                        vec4 color_a = texture2D(u_image_a, v_texCoord);\
                        vec4 color_b = texture2D(u_image_b, v_texCoord);\
                        color_a[0] *= mix;\
                        color_a[1] *= mix;\
                        color_a[2] *= mix;\
                        color_a[3] *= mix;\
                        color_b[0] *= (1.0 - mix);\
                        color_b[1] *= (1.0 - mix);\
                        color_b[2] *= (1.0 - mix);\
                        color_b[3] *= (1.0 - mix);\
                        gl_FragColor = color_a + color_b;\
                    }",
                properties: {
                    "mix": { type: "uniform", value: 0.0 }
                },
                inputs: ["u_image_a", "u_image_b"]
			};
		}

		get combine(): INodeWebGLDefinition {
			return {
                title: "Combine",
                description: "A basic effect which renders the input to the output, Typically used as a combine node for layering up media with alpha transparency.",
                vertexShader: "\
                    attribute vec2 a_position;\
                    attribute vec2 a_texCoord;\
                    varying vec2 v_texCoord;\
                    void main() {\
                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                        v_texCoord = a_texCoord;\
                    }",
                fragmentShader: "\
                    precision mediump float;\
                    uniform sampler2D u_image;\
                    uniform float a;\
                    varying vec2 v_texCoord;\
                    varying float v_mix;\
                    void main(){\
                        vec4 color = texture2D(u_image, v_texCoord);\
                        gl_FragColor = color;\
                    }",
                properties: {
                    "a": { type: "uniform", value: 0.0 },
                },
                inputs: ["u_image"]
			};
		}

		get colorThreshold(): INodeWebGLDefinition {
			return {
                title: "Color Threshold",
                description: "Turns all pixels with a greater value than the specified threshold transparent.",
                vertexShader: "\
                    attribute vec2 a_position;\
                    attribute vec2 a_texCoord;\
                    varying vec2 v_texCoord;\
                    void main() {\
                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                        v_texCoord = a_texCoord;\
                    }",
                fragmentShader: "\
                    precision mediump float;\
                    uniform sampler2D u_image;\
                    uniform float a;\
                    uniform vec3 colorAlphaThreshold;\
                    varying vec2 v_texCoord;\
                    varying float v_mix;\
                    void main(){\
                        vec4 color = texture2D(u_image, v_texCoord);\
                        if (color[0] > colorAlphaThreshold[0] && color[1]> colorAlphaThreshold[1] && color[2]> colorAlphaThreshold[2]){\
                            color = vec4(0.0,0.0,0.0,0.0);\
                        }\
                        gl_FragColor = color;\
                    }",
                properties: {
                    "a": { type: "uniform", value: 0.0 },
                    "colorAlphaThreshold": { type: "uniform", value: [0.0, 0.55, 0.0] }
                },
                inputs: ["u_image"]
            };
		}

		get monochrome(): INodeWebGLDefinition {
			return {
                title: "Monochrome",
                description: "Change images to a single chroma (e.g can be used to make a black & white filter). Input color mix and output color mix can be adjusted.",
                vertexShader: "\
                    attribute vec2 a_position;\
                    attribute vec2 a_texCoord;\
                    varying vec2 v_texCoord;\
                    void main() {\
                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                        v_texCoord = a_texCoord;\
                    }",
                fragmentShader: "\
                    precision mediump float;\
                    uniform sampler2D u_image;\
                    uniform vec3 inputMix;\
                    uniform vec3 outputMix;\
                    varying vec2 v_texCoord;\
                    varying float v_mix;\
                    void main(){\
                        vec4 color = texture2D(u_image, v_texCoord);\
                        float mono = color[0]*inputMix[0] + color[1]*inputMix[1] + color[2]*inputMix[2];\
                        color[0] = mono * outputMix[0];\
                        color[1] = mono * outputMix[1];\
                        color[2] = mono * outputMix[2];\
                        gl_FragColor = color;\
                    }",
                properties: {
                    "inputMix": { type: "uniform", value: [0.4, 0.6, 0.2] },
                    "outputMix": { type: "uniform", value: [1.0, 1.0, 1.0] }
                },
                inputs: ["u_image"]
            };
		}

		get hoizontalBlur(): INodeWebGLDefinition {
			return {
				title: "Horizontal Blur",
				description: "A horizontal blur effect. Adpated from http://xissburg.com/faster-gaussian-blur-in-glsl/",
				vertexShader: "\
                attribute vec2 a_position;\
                attribute vec2 a_texCoord;\
                uniform float blurAmount;\
                varying vec2 v_texCoord;\
                varying vec2 v_blurTexCoords[14];\
                void main() {\
                    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                    v_texCoord = a_texCoord;\
                    v_blurTexCoords[ 0] = v_texCoord + vec2(-0.028 * blurAmount, 0.0);\
                    v_blurTexCoords[ 1] = v_texCoord + vec2(-0.024 * blurAmount, 0.0);\
                    v_blurTexCoords[ 2] = v_texCoord + vec2(-0.020 * blurAmount, 0.0);\
                    v_blurTexCoords[ 3] = v_texCoord + vec2(-0.016 * blurAmount, 0.0);\
                    v_blurTexCoords[ 4] = v_texCoord + vec2(-0.012 * blurAmount, 0.0);\
                    v_blurTexCoords[ 5] = v_texCoord + vec2(-0.008 * blurAmount, 0.0);\
                    v_blurTexCoords[ 6] = v_texCoord + vec2(-0.004 * blurAmount, 0.0);\
                    v_blurTexCoords[ 7] = v_texCoord + vec2( 0.004 * blurAmount, 0.0);\
                    v_blurTexCoords[ 8] = v_texCoord + vec2( 0.008 * blurAmount, 0.0);\
                    v_blurTexCoords[ 9] = v_texCoord + vec2( 0.012 * blurAmount, 0.0);\
                    v_blurTexCoords[10] = v_texCoord + vec2( 0.016 * blurAmount, 0.0);\
                    v_blurTexCoords[11] = v_texCoord + vec2( 0.020 * blurAmount, 0.0);\
                    v_blurTexCoords[12] = v_texCoord + vec2( 0.024 * blurAmount, 0.0);\
                    v_blurTexCoords[13] = v_texCoord + vec2( 0.028 * blurAmount, 0.0);\
                }",
				fragmentShader: "\
                precision mediump float;\
                uniform sampler2D u_image;\
                varying vec2 v_texCoord;\
                varying vec2 v_blurTexCoords[14];\
                void main(){\
                    gl_FragColor = vec4(0.0);\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 0])*0.0044299121055113265;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 1])*0.00895781211794;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 2])*0.0215963866053;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 3])*0.0443683338718;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 4])*0.0776744219933;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 5])*0.115876621105;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 6])*0.147308056121;\
                    gl_FragColor += texture2D(u_image, v_texCoord         )*0.159576912161;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 7])*0.147308056121;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 8])*0.115876621105;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 9])*0.0776744219933;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[10])*0.0443683338718;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[11])*0.0215963866053;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[12])*0.00895781211794;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[13])*0.0044299121055113265;\
                }",
				properties: {
					"blurAmount": { type: "uniform", value: 1.0 },
				},
				inputs: ["u_image"]
			};
		}

		get verticalBlur(): INodeWebGLDefinition {
			return {
				title: "Vertical Blur",
				description: "A vertical blur effect. Adpated from http://xissburg.com/faster-gaussian-blur-in-glsl/",
				vertexShader: "\
                attribute vec2 a_position;\
                attribute vec2 a_texCoord;\
                varying vec2 v_texCoord;\
                uniform float blurAmount;\
                varying vec2 v_blurTexCoords[14];\
                void main() {\
                    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                    v_texCoord = a_texCoord;\
                    v_blurTexCoords[ 0] = v_texCoord + vec2(0.0,-0.028 * blurAmount);\
                    v_blurTexCoords[ 1] = v_texCoord + vec2(0.0,-0.024 * blurAmount);\
                    v_blurTexCoords[ 2] = v_texCoord + vec2(0.0,-0.020 * blurAmount);\
                    v_blurTexCoords[ 3] = v_texCoord + vec2(0.0,-0.016 * blurAmount);\
                    v_blurTexCoords[ 4] = v_texCoord + vec2(0.0,-0.012 * blurAmount);\
                    v_blurTexCoords[ 5] = v_texCoord + vec2(0.0,-0.008 * blurAmount);\
                    v_blurTexCoords[ 6] = v_texCoord + vec2(0.0,-0.004 * blurAmount);\
                    v_blurTexCoords[ 7] = v_texCoord + vec2(0.0, 0.004 * blurAmount);\
                    v_blurTexCoords[ 8] = v_texCoord + vec2(0.0, 0.008 * blurAmount);\
                    v_blurTexCoords[ 9] = v_texCoord + vec2(0.0, 0.012 * blurAmount);\
                    v_blurTexCoords[10] = v_texCoord + vec2(0.0, 0.016 * blurAmount);\
                    v_blurTexCoords[11] = v_texCoord + vec2(0.0, 0.020 * blurAmount);\
                    v_blurTexCoords[12] = v_texCoord + vec2(0.0, 0.024 * blurAmount);\
                    v_blurTexCoords[13] = v_texCoord + vec2(0.0, 0.028 * blurAmount);\
                }",
				fragmentShader: "\
                precision mediump float;\
                uniform sampler2D u_image;\
                varying vec2 v_texCoord;\
                varying vec2 v_blurTexCoords[14];\
                void main(){\
                    gl_FragColor = vec4(0.0);\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 0])*0.0044299121055113265;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 1])*0.00895781211794;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 2])*0.0215963866053;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 3])*0.0443683338718;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 4])*0.0776744219933;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 5])*0.115876621105;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 6])*0.147308056121;\
                    gl_FragColor += texture2D(u_image, v_texCoord         )*0.159576912161;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 7])*0.147308056121;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 8])*0.115876621105;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 9])*0.0776744219933;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[10])*0.0443683338718;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[11])*0.0215963866053;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[12])*0.00895781211794;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[13])*0.0044299121055113265;\
                }",
				properties: {
					"blurAmount": { type: "uniform", value: 1.0 },
				},
				inputs: ["u_image"]
			};
		}
	}
}