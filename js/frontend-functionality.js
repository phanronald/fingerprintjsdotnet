$(function () {
	"use strict";
	var webglVersion = window.location.search.indexOf('v=2') > 0 ? 2 : 1;
	var template = _.template($('#reportTemplate').html());
	var report = {
		platform: navigator.platform,
		userAgent: navigator.userAgent,
		webglVersion: webglVersion
	};
	if (webglVersion === 2) {
		$('body').addClass('webgl2');
	}
	if ((webglVersion === 2 && !window.WebGL2RenderingContext) || (webglVersion === 1 && !window.WebGLRenderingContext)) {
		$('#output').addClass('warn');
		renderReport($('#webglNotSupportedTemplate').html());
		return;
	}
	var canvas = $('<canvas />', {
		width: '1',
		height: '1'
	}).appendTo('body');
	var gl;
	var possibleNames = (webglVersion === 2) ? ['webgl2', 'experimental-webgl2'] : ['webgl', 'experimental-webgl'];
	var contextName = _.find(possibleNames, function (name) {
		gl = canvas[0].getContext(name, {
			stencil: true
		});
		return !!gl;
	});
	canvas.remove();
	if (!gl) {
		$('#output').addClass('warn');
		renderReport($('#webglNotEnabledTemplate').html());
		return;
	}
	function getExtensionUrl(extension) {
		if (extension === 'WEBKIT_lose_context') {
			extension = 'WEBGL_lose_context';
		} else if (extension === 'WEBKIT_WEBGL_compressed_textures') {
			extension = '';
		}
		extension = extension.replace(/^WEBKIT_/, '');
		extension = extension.replace(/^MOZ_/, '');
		extension = extension.replace(/_EXT_/, '_');
		return 'https://www.khronos.org/registry/webgl/extensions/' + extension;
	}
	function renderReport(header) {
		var tabsTemplate = _.template($('#webglVersionTabs').html());
		var headerTemplate = _.template(header);
		$('#output').html(tabsTemplate({
			report: report,
		}) + headerTemplate({
			report: report,
		}) + template({
			report: report,
			getExtensionUrl: getExtensionUrl,
			getWebGL2ExtensionUrl: getWebGL2ExtensionUrl
		}));
	}
	function describeRange(value) {
		return '[' + value[0] + ', ' + value[1] + ']';
	}
	function getMaxAnisotropy() {
		var e = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') || gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
		if (e) {
			var max = gl.getParameter(e.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
			if (max === 0) {
				max = 2;
			}
			return max;
		}
		return 'n/a';
	}
	function formatPower(exponent, verbose) {
		if (verbose) {
			return '' + Math.pow(2, exponent);
		} else {
			return '2<sup>' + exponent + '</sup>';
		}
	}
	function getPrecisionDescription(precision, verbose) {
		var verbosePart = verbose ? ' bit mantissa' : '';
		return '[-' + formatPower(precision.rangeMin, verbose) + ', ' + formatPower(precision.rangeMax, verbose) + '] (' + precision.precision + verbosePart + ')'
	}
	function getBestFloatPrecision(shaderType) {
		var high = gl.getShaderPrecisionFormat(shaderType, gl.HIGH_FLOAT);
		var medium = gl.getShaderPrecisionFormat(shaderType, gl.MEDIUM_FLOAT);
		var low = gl.getShaderPrecisionFormat(shaderType, gl.LOW_FLOAT);
		var best = high;
		if (high.precision === 0) {
			best = medium;
		}
		return '<span title="High: ' + getPrecisionDescription(high, true) + '\n\nMedium: ' + getPrecisionDescription(medium, true) + '\n\nLow: ' + getPrecisionDescription(low, true) + '">' + getPrecisionDescription(best, false) + '</span>';
	}
	function getFloatIntPrecision(gl) {
		var high = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
		var s = (high.precision !== 0) ? 'highp/' : 'mediump/';
		high = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT);
		s += (high.rangeMax !== 0) ? 'highp' : 'lowp';
		return s;
	}
	function isPowerOfTwo(n) {
		return (n !== 0) && ((n & (n - 1)) === 0);
	}
	function getAngle(gl) {
		var lineWidthRange = describeRange(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE));
		var angle = ((navigator.platform === 'Win32') || (navigator.platform === 'Win64')) && (gl.getParameter(gl.RENDERER) !== 'Internet Explorer') && (gl.getParameter(gl.RENDERER) !== 'Microsoft Edge') && (lineWidthRange === describeRange([1, 1]));
		if (angle) {
			if (isPowerOfTwo(gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)) && isPowerOfTwo(gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS))) {
				return 'Yes, D3D11';
			} else {
				return 'Yes, D3D9';
			}
		}
		return 'No';
	}
	function getMajorPerformanceCaveat(contextName) {
		var canvas = $('<canvas />', {
			width: '1',
			height: '1'
		}).appendTo('body');
		var gl = canvas[0].getContext(contextName, {
			failIfMajorPerformanceCaveat: true
		});
		canvas.remove();
		if (!gl) {
			return 'Yes';
		}
		if (typeof gl.getContextAttributes().failIfMajorPerformanceCaveat === 'undefined') {
			return 'Not implemented';
		}
		return 'No';
	}
	function getDraftExtensionsInstructions() {
		if (navigator.userAgent.indexOf('Chrome') !== -1) {
			return 'To see draft extensions in Chrome, browse to about:flags, enable the "Enable WebGL Draft Extensions" option, and relaunch.';
		} else if (navigator.userAgent.indexOf('Firefox') !== -1) {
			return 'To see draft extensions in Firefox, browse to about:config and set webgl.enable-draft-extensions to true.';
		}
		return '';
	}
	function getMaxColorBuffers(gl) {
		var maxColorBuffers = 1;
		var ext = gl.getExtension("WEBGL_draw_buffers");
		if (ext != null) maxColorBuffers = gl.getParameter(ext.MAX_DRAW_BUFFERS_WEBGL);
		return maxColorBuffers;
	}
	function getUnmaskedInfo(gl) {
		var unMaskedInfo = {
			renderer: '',
			vendor: ''
		};
		var dbgRenderInfo = gl.getExtension("WEBGL_debug_renderer_info");
		if (dbgRenderInfo != null) {
			unMaskedInfo.renderer = gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL);
			unMaskedInfo.vendor = gl.getParameter(dbgRenderInfo.UNMASKED_VENDOR_WEBGL);
		}
		return unMaskedInfo;
	}
	function showNull(v) {
		return (v === null) ? 'n/a' : v;
	}
	var webglToEsNames = {
		'getInternalformatParameter': 'getInternalformativ',
		'uniform1ui': 'uniform',
		'uniform2ui': 'uniform',
		'uniform3ui': 'uniform',
		'uniform4ui': 'uniform',
		'uniform1uiv': 'uniform',
		'uniform2uiv': 'uniform',
		'uniform3uiv': 'uniform',
		'uniform4uiv': 'uniform',
		'uniformMatrix2x3fv': 'uniform',
		'uniformMatrix3x2fv': 'uniform',
		'uniformMatrix2x4fv': 'uniform',
		'uniformMatrix4x2fv': 'uniform',
		'uniformMatrix3x4fv': 'uniform',
		'uniformMatrix4x3fv': 'uniform',
		'vertexAttribI4i': 'vertexAttrib',
		'vertexAttribI4iv': 'vertexAttrib',
		'vertexAttribI4ui': 'vertexAttrib',
		'vertexAttribI4uiv': 'vertexAttrib',
		'vertexAttribIPointer': 'vertexAttribPointer',
		'vertexAttribDivisor': 'vertexAttribDivisor',
		'createQuery': 'genQueries',
		'deleteQuery': 'deleteQueries',
		'endQuery': 'beginQuery',
		'getQuery': 'getQueryiv',
		'getQueryParameter': 'getQueryObjectuiv',
		'samplerParameteri': 'samplerParameter',
		'samplerParameterf': 'samplerParameter',
		'clearBufferiv': 'clearBuffer',
		'clearBufferuiv': 'clearBuffer',
		'clearBufferfv': 'clearBuffer',
		'clearBufferfi': 'clearBuffer',
		'createSampler': 'genSamplers',
		'deleteSampler': 'deleteSamplers',
		'getSyncParameter': 'getSynciv',
		'createTransformFeedback': 'genTransformFeedbacks',
		'deleteTransformFeedback': 'deleteTransformFeedbacks',
		'endTransformFeedback': 'beginTransformFeedback',
		'getIndexedParameter': 'get',
		'getActiveUniforms': 'getActiveUniformsiv',
		'getActiveUniformBlockParameter': 'getActiveUniformBlockiv',
		'createVertexArray': 'genVertexArrays',
		'deleteVertexArray': 'deleteVertexArrays'
	};
	function getWebGL2ExtensionUrl(name) {
		if (name === 'getBufferSubData') {
			return 'http://www.opengl.org/sdk/docs/man/docbook4/xhtml/glGetBufferSubData.xml';
		}
		if (webglToEsNames[name]) {
			name = webglToEsNames[name];
		}
		var filename = 'gl' + name[0].toUpperCase() + name.substring(1) + '.xhtml';
		return 'http://www.khronos.org/opengles/sdk/docs/man3/html/' + filename;
	}
	function getWebGL2Status(gl, contextName) {
		var webgl2Names = ['copyBufferSubData', 'getBufferSubData', 'blitFramebuffer', 'framebufferTextureLayer', 'getInternalformatParameter', 'invalidateFramebuffer', 'invalidateSubFramebuffer', 'readBuffer', 'renderbufferStorageMultisample', 'texStorage2D', 'texStorage3D', 'texImage3D', 'texSubImage3D', 'copyTexSubImage3D', 'compressedTexImage3D', 'compressedTexSubImage3D', 'getFragDataLocation', 'uniform1ui', 'uniform2ui', 'uniform3ui', 'uniform4ui', 'uniform1uiv', 'uniform2uiv', 'uniform3uiv', 'uniform4uiv', 'uniformMatrix2x3fv', 'uniformMatrix3x2fv', 'uniformMatrix2x4fv', 'uniformMatrix4x2fv', 'uniformMatrix3x4fv', 'uniformMatrix4x3fv', 'vertexAttribI4i', 'vertexAttribI4iv', 'vertexAttribI4ui', 'vertexAttribI4uiv', 'vertexAttribIPointer', 'vertexAttribDivisor', 'drawArraysInstanced', 'drawElementsInstanced', 'drawRangeElements', 'drawBuffers', 'clearBufferiv', 'clearBufferuiv', 'clearBufferfv', 'clearBufferfi', 'createQuery', 'deleteQuery', 'isQuery', 'beginQuery', 'endQuery', 'getQuery', 'getQueryParameter', 'createSampler', 'deleteSampler', 'isSampler', 'bindSampler', 'samplerParameteri', 'samplerParameterf', 'getSamplerParameter', 'fenceSync', 'isSync', 'deleteSync', 'clientWaitSync', 'waitSync', 'getSyncParameter', 'createTransformFeedback', 'deleteTransformFeedback', 'isTransformFeedback', 'bindTransformFeedback', 'beginTransformFeedback', 'endTransformFeedback', 'transformFeedbackVaryings', 'getTransformFeedbackVarying', 'pauseTransformFeedback', 'resumeTransformFeedback', 'bindBufferBase', 'bindBufferRange', 'getIndexedParameter', 'getUniformIndices', 'getActiveUniforms', 'getUniformBlockIndex', 'getActiveUniformBlockParameter', 'getActiveUniformBlockName', 'uniformBlockBinding', 'createVertexArray', 'deleteVertexArray', 'isVertexArray', 'bindVertexArray'];
		var webgl2 = (contextName.indexOf('webgl2') !== -1);
		var functions = [];
		var totalImplemented = 0;
		var length = webgl2Names.length;
		if (webgl2) {
			for (var i = 0; i < length; ++i) {
				var name = webgl2Names[i];
				var className = 'extension';
				if (webgl2 && gl[name]) {
					++totalImplemented;
				} else {
					className += ' unsupported';
				}
				functions.push({
					name: name,
					className: className
				});
			}
		}
		return {
			status: webgl2 ? (totalImplemented + ' of ' + length + ' new functions implemented.') : 'webgl2 and experimental-webgl2 contexts not available.',
			functions: functions
		};
	}
	var webgl2Status = getWebGL2Status(gl, contextName);
	report = _.extend(report, {
		contextName: contextName,
		glVersion: gl.getParameter(gl.VERSION),
		shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
		vendor: gl.getParameter(gl.VENDOR),
		renderer: gl.getParameter(gl.RENDERER),
		unMaskedVendor: getUnmaskedInfo(gl).vendor,
		unMaskedRenderer: getUnmaskedInfo(gl).renderer,
		antialias: gl.getContextAttributes().antialias ? 'Available' : 'Not available',
		angle: getAngle(gl),
		majorPerformanceCaveat: getMajorPerformanceCaveat(contextName),
		maxColorBuffers: getMaxColorBuffers(gl),
		redBits: gl.getParameter(gl.RED_BITS),
		greenBits: gl.getParameter(gl.GREEN_BITS),
		blueBits: gl.getParameter(gl.BLUE_BITS),
		alphaBits: gl.getParameter(gl.ALPHA_BITS),
		depthBits: gl.getParameter(gl.DEPTH_BITS),
		stencilBits: gl.getParameter(gl.STENCIL_BITS),
		maxRenderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
		maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
		maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
		maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
		maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
		maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
		maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
		maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
		maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
		maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
		aliasedLineWidthRange: describeRange(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)),
		aliasedPointSizeRange: describeRange(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)),
		maxViewportDimensions: describeRange(gl.getParameter(gl.MAX_VIEWPORT_DIMS)),
		maxAnisotropy: getMaxAnisotropy(),
		vertexShaderBestPrecision: getBestFloatPrecision(gl.VERTEX_SHADER),
		fragmentShaderBestPrecision: getBestFloatPrecision(gl.FRAGMENT_SHADER),
		fragmentShaderFloatIntPrecision: getFloatIntPrecision(gl),
		extensions: gl.getSupportedExtensions(),
		draftExtensionsInstructions: getDraftExtensionsInstructions(),
		webgl2Status: webgl2Status.status,
		webgl2Functions: webgl2Status.functions
	});
	if (webglVersion > 1) {
		report = _.extend(report, {
			maxVertexUniformComponents: showNull(gl.getParameter(gl.MAX_VERTEX_UNIFORM_COMPONENTS)),
			maxVertexUniformBlocks: showNull(gl.getParameter(gl.MAX_VERTEX_UNIFORM_BLOCKS)),
			maxVertexOutputComponents: showNull(gl.getParameter(gl.MAX_VERTEX_OUTPUT_COMPONENTS)),
			maxVaryingComponents: showNull(gl.getParameter(gl.MAX_VARYING_COMPONENTS)),
			maxFragmentUniformComponents: showNull(gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_COMPONENTS)),
			maxFragmentUniformBlocks: showNull(gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_BLOCKS)),
			maxFragmentInputComponents: showNull(gl.getParameter(gl.MAX_FRAGMENT_INPUT_COMPONENTS)),
			minProgramTexelOffset: showNull(gl.getParameter(gl.MIN_PROGRAM_TEXEL_OFFSET)),
			maxProgramTexelOffset: showNull(gl.getParameter(gl.MAX_PROGRAM_TEXEL_OFFSET)),
			maxDrawBuffers: showNull(gl.getParameter(gl.MAX_DRAW_BUFFERS)),
			maxColorAttachments: showNull(gl.getParameter(gl.MAX_COLOR_ATTACHMENTS)),
			maxSamples: showNull(gl.getParameter(gl.MAX_SAMPLES)),
			max3dTextureSize: showNull(gl.getParameter(gl.MAX_3D_TEXTURE_SIZE)),
			maxArrayTextureLayers: showNull(gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS)),
			maxTextureLodBias: showNull(gl.getParameter(gl.MAX_TEXTURE_LOD_BIAS)),
			maxUniformBufferBindings: showNull(gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS)),
			maxUniformBlockSize: showNull(gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE)),
			uniformBufferOffsetAlignment: showNull(gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT)),
			maxCombinedUniformBlocks: showNull(gl.getParameter(gl.MAX_COMBINED_UNIFORM_BLOCKS)),
			maxCombinedVertexUniformComponents: showNull(gl.getParameter(gl.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS)),
			maxCombinedFragmentUniformComponents: showNull(gl.getParameter(gl.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS)),
			maxTransformFeedbackInterleavedComponents: showNull(gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS)),
			maxTransformFeedbackSeparateAttribs: showNull(gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS)),
			maxTransformFeedbackSeparateComponents: showNull(gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS)),
			maxElementIndex: showNull(gl.getParameter(gl.MAX_ELEMENT_INDEX)),
			maxServerWaitTimeout: showNull(gl.getParameter(gl.MAX_SERVER_WAIT_TIMEOUT))
		});
	}
	if (window.externalHost) {
		renderReport($('#webglSupportedChromeFrameTemplate').html());
	} else {
		renderReport($('#webglSupportedTemplate').html());
	}
	var pipeline = $('.pipeline')
	var background = $('.background')[0];
	background.width = pipeline.width();
	background.height = pipeline.height();
	var hasVertexTextureUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) > 0;
	var context = background.getContext('2d');
	context.shadowOffsetX = 3;
	context.shadowOffsetY = 3;
	context.shadowBlur = 7;
	context.shadowColor = 'rgba(0, 0, 0, 0.5)';
	context.strokeStyle = 'black';
	var boxPadding = 4;
	function drawBox(element, fill) {
		var pos = element.position();
		var x = pos.left - boxPadding;
		var y = pos.top - boxPadding;
		var width = element.outerWidth() + (boxPadding * 2);
		var height = element.outerHeight() + (boxPadding * 2);
		var radius = 10;
		context.fillStyle = fill;
		context.lineWidth = 2;
		context.beginPath();
		context.moveTo(x + radius, y);
		context.lineTo(x + width - radius, y);
		context.quadraticCurveTo(x + width, y, x + width, y + radius);
		context.lineTo(x + width, y + height - radius);
		context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		context.lineTo(x + radius, y + height);
		context.quadraticCurveTo(x, y + height, x, y + height - radius);
		context.lineTo(x, y + radius);
		context.quadraticCurveTo(x, y, x + radius, y);
		context.closePath();
		context.stroke();
		context.fill();
		return {
			x: x,
			y: y,
			width: width,
			height: height
		};
	}
	function drawLeftHead(x, y) {
		context.beginPath();
		context.moveTo(x + 5, y + 15);
		context.lineTo(x - 10, y);
		context.lineTo(x + 5, y - 15);
		context.quadraticCurveTo(x, y, x + 5, y + 15);
		context.fill();
	}
	function drawRightHead(x, y) {
		context.beginPath();
		context.moveTo(x - 5, y + 15);
		context.lineTo(x + 10, y);
		context.lineTo(x - 5, y - 15);
		context.quadraticCurveTo(x, y, x - 5, y + 15);
		context.fill();
	}
	function drawDownHead(x, y) {
		context.beginPath();
		context.moveTo(x + 15, y - 5);
		context.lineTo(x, y + 10);
		context.lineTo(x - 15, y - 5);
		context.quadraticCurveTo(x, y, x + 15, y - 5);
		context.fill();
	}
	function drawDownArrow(topBox, bottomBox) {
		context.beginPath();
		var arrowTopX = topBox.x + topBox.width / 2;
		var arrowTopY = topBox.y + topBox.height;
		var arrowBottomX = bottomBox.x + bottomBox.width / 2;
		var arrowBottomY = bottomBox.y - 15;
		context.moveTo(arrowTopX, arrowTopY);
		context.lineTo(arrowBottomX, arrowBottomY);
		context.stroke();
		drawDownHead(arrowBottomX, arrowBottomY);
	}
	function drawRightArrow(leftBox, rightBox, factor) {
		context.beginPath();
		var arrowLeftX = leftBox.x + leftBox.width;
		var arrowRightX = rightBox.x - 15;
		var arrowRightY = rightBox.y + rightBox.height * factor;
		context.moveTo(arrowLeftX, arrowRightY);
		context.lineTo(arrowRightX, arrowRightY);
		context.stroke();
		drawRightHead(arrowRightX, arrowRightY);
	}
	var webgl2color = (webglVersion > 1) ? '#02AFCF' : '#aaa';
	var vertexShaderBox = drawBox($('.vertexShader'), '#ff6700');
	var transformFeedbackBox = drawBox($('.transformFeedback'), webgl2color);
	var rasterizerBox = drawBox($('.rasterizer'), '#3130cb');
	var fragmentShaderBox = drawBox($('.fragmentShader'), '#ff6700');
	var framebufferBox = drawBox($('.framebuffer'), '#7c177e');
	var texturesBox = drawBox($('.textures'), '#3130cb');
	var uniformBuffersBox = drawBox($('.uniformBuffers'), webgl2color);
	var arrowRightX = texturesBox.x;
	var arrowRightY = texturesBox.y + (texturesBox.height / 2);
	var arrowMidX = (texturesBox.x + vertexShaderBox.x + vertexShaderBox.width) / 2;
	var arrowMidY = arrowRightY;
	var arrowTopMidY = texturesBox.y - 15;
	var arrowBottomMidY = fragmentShaderBox.y + (fragmentShaderBox.height * 0.55);
	var arrowTopLeftX = vertexShaderBox.x + vertexShaderBox.width + 15;
	var arrowTopLeftY = arrowTopMidY;
	var arrowBottomLeftX = fragmentShaderBox.x + fragmentShaderBox.width + 15;
	var arrowBottomLeftY = arrowBottomMidY;
	if (hasVertexTextureUnits) {
		context.fillStyle = context.strokeStyle = 'black';
		context.lineWidth = 10;
	} else {
		context.fillStyle = context.strokeStyle = '#FFF';
		context.shadowColor = '#000';
		context.shadowOffsetX = context.shadowOffsetY = 0;
		context.lineWidth = 8;
	}
	context.beginPath();
	context.moveTo(arrowMidX, arrowMidY);
	context.lineTo(arrowMidX, arrowTopMidY);
	if (hasVertexTextureUnits) {
		context.lineTo(arrowTopLeftX, arrowTopMidY);
		context.stroke();
		drawLeftHead(arrowTopLeftX, arrowTopLeftY);
	} else {
		context.stroke();
		context.shadowColor = '#000';
		context.font = 'bold 14pt arial, Sans-Serif';
		context.fillText('No vertex textures available.', arrowMidX - 8, arrowTopMidY - 8);
	}
	context.lineWidth = 10;
	context.fillStyle = context.strokeStyle = 'black';
	context.shadowColor = 'rgba(0, 0, 0, 0.5)';
	context.shadowOffsetX = context.shadowOffsetY = 3;
	context.beginPath();
	context.moveTo(arrowRightX, arrowRightY);
	context.lineTo(arrowMidX - context.lineWidth * 0.5, arrowMidY);
	context.moveTo(arrowMidX, arrowMidY);
	context.lineTo(arrowMidX, arrowBottomMidY);
	context.lineTo(arrowBottomLeftX, arrowBottomLeftY);
	var uniformBuffersMidY = uniformBuffersBox.y + uniformBuffersBox.height / 2;
	context.moveTo(arrowMidX, uniformBuffersMidY);
	context.lineTo(arrowRightX, uniformBuffersMidY);
	context.stroke();
	drawLeftHead(arrowBottomLeftX, arrowBottomLeftY);
	drawRightArrow(vertexShaderBox, transformFeedbackBox, 0.5);
	drawDownArrow(vertexShaderBox, rasterizerBox);
	drawDownArrow(rasterizerBox, fragmentShaderBox);
	if (webglVersion === 1) {
		drawDownArrow(fragmentShaderBox, framebufferBox);
	} else {
		drawRightArrow(fragmentShaderBox, framebufferBox, 0.7);
	}
	window.gl = gl;
});



"use strict";


/*
 * Fetch the script for Googletag service.
 */
var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];
(function() {
    var gads = document.createElement( "script" );
    gads.async = true;
    gads.type = "text/javascript";
    var useSSL = "https:" == document.location.protocol;
    gads.src = ( useSSL ? "https:" : "http:" ) + "//www.googletagservices.com/tag/js/gpt.js";
    var node =document.getElementsByTagName( "script" )[0];
    node.parentNode.insertBefore( gads, node );
})();



/*
 * Handle the jQuery functionality.
 */
( function( $ ) {

    /*
     * Define the offset in pixels from the viewport,
     * at which an ad load must be triggered.
     */
    var AD_LOAD_OFFSET = 1000;

    /*
     * Declare the variable which holds the screen width.
     */
    var screen_width;



    /*
     * Initialize a counter for assigning
     * unique IDs to ad units containers.
     */
    var ad_unit_counter = 0;



    /*
     * Keep in one place all screen widths at
     * which ads must be reloaded.
     */
    var screen_widths = [];



    /* 
     * Keep a record of the last screen width
     * for which ads were requested.
     */
    var current_mapping = fetch_current_mapping();



    /*
     * Store information regarding the ad unit containers
     * that are in the DOM structure at any given moment.
     */
    var ad_unit_containers = [];



    /*
     * Get the current mapping, based on the current screen width.
     */
    function fetch_current_mapping() {
        var new_mapping_width = screen_width;
        for ( var cursor = 0; cursor < screen_widths.length; cursor ++ ) {
            if ( new_mapping_width <= screen_widths[ cursor ] ) {
                return screen_widths[ cursor ];
            }
        }
    }



    /*
     * Add new ad unit containers to the list of
     * containers present in the DOM structure.
     */
    function add_containers_to_list() {
        $( '.widget-ad[data-ad-complete!="yes"]' ).each( function() {
            var $unit = $( this );
            if ( typeof $unit.attr( "id" ) == "undefined" ) {
                // Add the ID attribute on container element.
                var ad_unit_id = "ad-unit-" + ad_unit_counter;
                // Increment the counter;
                ad_unit_counter ++;
                $unit.attr( "id", ad_unit_id );
                // Add the unit to the list.
                ad_unit_containers.push( ad_unit_id );
            }
        });
    }



    /*
     * Remove ad unit containers from the list of
     * containers present in the DOM structure. Called
     * when pages are removed from the DOM structure.
     */
    function remove_containers_from_list() {
        var index = ad_unit_containers.length;
        while ( -- index ) {
            var ad_unit_id = ad_unit_containers[ index ];
            if ( $( "#" + ad_unit_id ).length == 0 ) {
                ad_unit_containers.splice( index, 1 );
            }
        }
    }



    /*
     * Remove ad unit containers from the list of
     * containers present in the DOM structure. Called
     * when pages are removed from DOM structure.
     */
    function container_close_to_viewport( unit_element ) {
        /* Get the information regarding the offset
         * of the container in relation to the viewport. */
        var unit_offset = unit_element.getBoundingClientRect();
        var top_offset = unit_offset.top;
        var bottom_offset = unit_offset.bottom;
        var screen_height = $( window ).height();

        return (
                // Ad unit container is about to enter viewport from above.
                ( bottom_offset < - AD_LOAD_OFFSET ) ||
                // Ad unit container is about to enter viewport from below.
                ( ( top_offset > 0 ) && ( top_offset < screen_height + AD_LOAD_OFFSET ) )
            );
    }



    /*
     * Create the ad units for the ad slots
     * that are close to entering the viewport.
     */
    function maybe_create_ad_units( trigger ) {
        $.each( ad_unit_containers, function( index, ad_unit_id ) {
            var $unit = $( "#" + ad_unit_id );
            /* Make sure that the ad unit has not been
             * loaded and that it is approaching the viewport. */
            if ( ( $unit.attr( "data-ad-complete" ) != "yes" ) &&
                    ( ( trigger == "timeout-trigger" ) ||
                    ( ( trigger == "scroll-trigger" ) && container_close_to_viewport( $unit[0] ) ) ) ) {
                // Retrieve the ad unit tag.
                var ad_unit_tag = $unit.data( "adunit" );
                // Fetch the size pairs.
                var sizes = com_ad_config.ad_units_config[ ad_unit_tag ];
                // Begin the mapping.
                var unit_mapping = googletag.sizeMapping();
                // Also store ad sizes separately.
                var unit_sizes = [];

                $.each( sizes, function( sizes_index, size ) {
                    // Turn all sizes to integers.
                    var screen_width = parseInt( size.screen_width );
                    var screen_height = parseInt( size.screen_height );
                    var unit_width = parseInt( size.unit_width );
                    var unit_height = parseInt( size.unit_height );

                    var screen_size = [ screen_width, screen_height ];
                    var unit_size = [ unit_width, unit_height ];

                    //Push the sizes pair to the array of mappings.
                    unit_mapping = unit_mapping.addSize( screen_size, unit_size );
                    unit_sizes.push( unit_size );

                    // Maybe push a new width to the array of screen widths.
                    if ( screen_widths.indexOf( screen_width ) == -1 ) {
                        screen_widths.push( screen_width );
                    }
                });

                // Sort the screen widths, with greatest first.
                screen_widths = screen_widths.reverse();
                
                // Now build the mapping.
                unit_mapping = unit_mapping.build();

                // Finally, define and load the ad slot.
                googletag.cmd.push(function() {
                    var advert = googletag.defineSlot( ad_unit_tag, unit_sizes, ad_unit_id ).
                                    defineSizeMapping( unit_mapping ).
                                    setCollapseEmptyDiv( true ).
                                    addService( googletag.pubads() );
                    googletag.display( ad_unit_id );
                    googletag.pubads().refresh([ advert ]);
                });

                $unit.attr( 'data-ad-complete', 'yes' );
            }
        });
    }



    /*
     * Test if the Googletag service has been loaded
     * and only then prepare the ad units.
     */
    function init_when_ready() {
        // Verify Googletag service is ready.
        if ( window.googletag && googletag.apiReady ) {
            // Now load the ads.
            googletag.cmd.push(function() {
                googletag.pubads().enableAsyncRendering();
                googletag.pubads().collapseEmptyDivs( true );
                googletag.enableServices();
                // Create the ad units for ad containers loaded at page init.
                add_containers_to_list();
                maybe_create_ad_units( "timeout-trigger" );
            });
        } else {
            // Pubads not ready, try again a bit later.
            setTimeout( function() {
                init_when_ready();
            }, 250 );
        }
    }



    /*
     * Check if AdBlock is enabled.
     */
    function look_for_ad_block() {
        if( typeof blockAdBlock === "undefined" ) {
            display_adblock_notification();
        } else {
            blockAdBlock.onDetected( display_adblock_notification );
        }
    }



    /*
     * Test if cookies are enabled in the browser.
     */
    function check_if_cookies_are_enabled() {
        var cookies_enabled = ( navigator.cookieEnabled ) ? true : false;

        if ( ( typeof navigator.cookieEnabled == "undefined" ) && ! cookies_enabled ) { 
            document.cookie = "com_test_cookie";
            cookies_enabled = ( document.cookie.indexOf( "com_test_cookie" ) != -1 ) ? true : false;
        }

        return cookies_enabled;
    }



    /*
     * Display notification if AdBlock is enabled and the notification
     * box has not already been dismissed in the last 24 hours.
     */
    function display_adblock_notification() {
        if ( ( ! ad_block_notification_cookie_is_set() ) && ( com_ad_config.ad_blocker_message != "" ) ) {
            $( "body" ).append( '<div class="adblock-notification-wrapper"><div class="adblock-notification"><div class="text">' + com_ad_config.ad_blocker_message + '</div><div class="js-dismiss">x</div></div></div>' );
        }
    }



    /*
     * Check if the AdBlock notification cookie is set.
     */
    function ad_block_notification_cookie_is_set() {
        var cookie_name = "com_ad_block_notification=";
        var all_cookies = document.cookie.split( ';' );
        for ( var index=0; index < all_cookies.length; index ++ ) {
            var current_cookie = all_cookies[ index ];
            while ( current_cookie.charAt( 0 ) == " " ) {
                current_cookie = current_cookie.substring( 1 );
            }
            if ( current_cookie.indexOf( cookie_name ) == 0 ) {
                return true;
            }
        }

        return false;
    }



    /*
     * Set the cookie to avoid displaying the notification
     * box after dismissal for the next 24 hours.
     */
    function set_ad_block_notification_cookie() {
        var expiry_date = new Date();
        // Set the expiry date to 24 hours from now.
        expiry_date.setTime( expiry_date.getTime() + (  24 * 60 * 60 * 1000 ) );
        var expires = "expires=" + expiry_date.toUTCString();
        document.cookie = "com_ad_block_notification=1;" + expires;
    }



    /*
     * Run actions on document ready.
     */
    $( document ).ready( function() {

        /*
         * Check if AdBlock is enabled only if cookies are enabled.
         */
        if ( check_if_cookies_are_enabled() ) {
            look_for_ad_block();
        }



        /*
         * Initialize ad handling as soon as Googletag service is loaded.
         */
        init_when_ready();



        /*
         * Check at every scroll if new ad units need to be loaded.
         */
        $( window ).scroll( function() {
            if ( window.googletag && googletag.apiReady ) {
                maybe_create_ad_units( "scroll-trigger" );
            }
        });



        /*
         * Prepare new ad unit containers on new page load via infinite scroll.
         */
        $( window ).on( "com2014_infscr_new_page_load", function() {
            add_containers_to_list();
            setTimeout( function() {
                maybe_create_ad_units( "timeout-trigger" );
            }, 2500 );
        });



        /*
         * Remove ad unit container IDs from list
         * on page removal via infinite scroll.
         */
        $( window ).on( "com2014_infscr_page_removed", function() {
            remove_containers_from_list();
        });



        /*
         * Remove the AdBlock notification when
         * the dismiss button is pressed.
         */
        $( "body" ).on( "click", ".adblock-notification .js-dismiss", function() {
            // Set the cookie to avoid displaying the notification for 24 hours.
            set_ad_block_notification_cookie();
            // Now remove the notification box.
            $( ".adblock-notification-wrapper" ).remove();
        });



        /* 
         * Register an event for reloading ad units on screen resize.
         */
        $( window ).resize( function() {
            // Fetch the current screen width.
            screen_width = $( window ).width();
            /* Only trigger reload of the ad units if window size
             * fits into different screen mapping. */
            var new_mapping = fetch_current_mapping();
            if ( new_mapping != current_mapping ) {
                // Store the new mapping width.
                current_mapping = new_mapping;

                /*
                 * Trigger the refresh of the ad units.
                 * At page load: ensure Googletag service is ready
                 * prior to loading the first round of ads.
                 */
                if ( window.googletag && googletag.apiReady ) {
                    googletag.pubads().refresh();
                } else {
                    // Delay the ads refresh to a later time, when the Googletag service is ready.
                    setTimeout( function() {
                        // Try to refresh the ad units once more.
                        if ( window.googletag && googletag.apiReady ) {
                            googletag.pubads().refresh();
                        }
                    }, 1000 );
                }
            }
        });
    });
})( jQuery );



/*
 * BlockAdBlock 3.2.0
 * Copyright (c) 2015 Valentin Allaire <valentin.allaire@sitexw.fr>
 * Released under the MIT license
 * https://github.com/sitexw/BlockAdBlock
 */
!function(t){var e=function(e){this._options={checkOnLoad:!1,resetOnEnd:!1,loopCheckTime:50,loopMaxNumber:5,baitClass:"pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links",baitStyle:"width:1px !important;height:1px !important;position:absolute !important;left:-10000px !important;top:-1000px !important"},this._var={version:"3.2.0",bait:null,checking:!1,loop:null,loopNumber:0,event:{detected:[],notDetected:[]}},void 0!==e&&this.setOption(e);var i=this,o=function(){setTimeout(function(){i._options.checkOnLoad===!0&&(null===i._var.bait&&i._creatBait(),setTimeout(function(){i.check()},1))},1)};void 0!==t.addEventListener?t.addEventListener("load",o,!1):t.attachEvent("onload",o)};e.prototype._options=null,e.prototype._var=null,e.prototype._bait=null,e.prototype.setOption=function(t,e){if(void 0!==e){var i=t;t={},t[i]=e}for(var o in t)this._options[o]=t[o];return this},e.prototype._creatBait=function(){var e=document.createElement("div");e.setAttribute("class",this._options.baitClass),e.setAttribute("style",this._options.baitStyle),this._var.bait=t.document.body.appendChild(e),this._var.bait.offsetParent,this._var.bait.offsetHeight,this._var.bait.offsetLeft,this._var.bait.offsetTop,this._var.bait.offsetWidth,this._var.bait.clientHeight,this._var.bait.clientWidth},e.prototype._destroyBait=function(){t.document.body.removeChild(this._var.bait),this._var.bait=null},e.prototype.check=function(t){if(void 0===t&&(t=!0),this._var.checking===!0)return!1;this._var.checking=!0,null===this._var.bait&&this._creatBait();var e=this;return this._var.loopNumber=0,t===!0&&(this._var.loop=setInterval(function(){e._checkBait(t)},this._options.loopCheckTime)),setTimeout(function(){e._checkBait(t)},1),!0},e.prototype._checkBait=function(e){var i=!1;if(null===this._var.bait&&this._creatBait(),(null!==t.document.body.getAttribute("abp")||null===this._var.bait.offsetParent||0==this._var.bait.offsetHeight||0==this._var.bait.offsetLeft||0==this._var.bait.offsetTop||0==this._var.bait.offsetWidth||0==this._var.bait.clientHeight||0==this._var.bait.clientWidth)&&(i=!0),void 0!==t.getComputedStyle){var o=t.getComputedStyle(this._var.bait,null);("none"==o.getPropertyValue("display")||"hidden"==o.getPropertyValue("visibility"))&&(i=!0)}e===!0&&(this._var.loopNumber++,this._var.loopNumber>=this._options.loopMaxNumber&&this._stopLoop()),i===!0?(this._stopLoop(),this._destroyBait(),this.emitEvent(!0),e===!0&&(this._var.checking=!1)):(null===this._var.loop||e===!1)&&(this._destroyBait(),this.emitEvent(!1),e===!0&&(this._var.checking=!1))},e.prototype._stopLoop=function(){clearInterval(this._var.loop),this._var.loop=null,this._var.loopNumber=0},e.prototype.emitEvent=function(t){var e=this._var.event[t===!0?"detected":"notDetected"];for(var i in e)e.hasOwnProperty(i)&&e[i]();return this._options.resetOnEnd===!0&&this.clearEvent(),this},e.prototype.clearEvent=function(){this._var.event.detected=[],this._var.event.notDetected=[]},e.prototype.on=function(t,e){return this._var.event[t===!0?"detected":"notDetected"].push(e),this},e.prototype.onDetected=function(t){return this.on(!0,t)},e.prototype.onNotDetected=function(t){return this.on(!1,t)},t.BlockAdBlock=e,void 0===t.blockAdBlock&&(t.blockAdBlock=new e({checkOnLoad:!0,resetOnEnd:!0}))}(window);