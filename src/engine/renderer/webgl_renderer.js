import { EventEmitter } from 'fbemitter';

import { utils as textureUtils } from '../texture';
import {
  INT_1,
  FLOAT_1,
  FLOAT_2,
  FLOAT_3,
  FLOAT_4,
  FLOAT_ARRAY_1,
  FLOAT_ARRAY_2,
  FLOAT_ARRAY_3,
  FLOAT_ARRAY_4,
  MAT_2,
  MAT_3
} from './webgl_types';
import { DIFFUSE_MAP } from './color_map';

export class WebGLRenderer extends EventEmitter {
  // Rendering context.
  #gl;

  // Shader programs with uniforms, locatins and program handlers.
  #programs;

  // Framebuffer objects.
  #fbo;

  // Texture name-object key-value of registered textures.
  #textures;

  // Currently bound shader program.
  #boundProgram;

  // Currently bound texture.
  #boundTexture;

  // Currently bound FBO.
  #boundFbo;

  // Is blending enabled, `true` if enabled, otherwise `false`.
  #blending;

  // FPS threshold (1-60 FPS) for rendering.
  #fpsThreshold;

  // Width, height.
  #viewport;

  // Bound canvas.
  #canvas;

  constructor({ canvas, fpsThreshold = 60 }) {
    super();

    this.#canvas = canvas;
    this.#gl = canvas.getContext('webgl', {
      preserveDrawingBuffer: false,
      premultipliedAlpha: false,
      alpha: true,
      antialias: false
    });
    this.#blending = false;
    this.#boundProgram = null;
    this.#boundTexture = null;
    this.#boundFbo = null;
    this.#programs = {};
    this.#textures = {};
    this.#fbo = {};
    this.#fpsThreshold = fpsThreshold;
    this.#viewport = { width: 1, height: 1 };

    // tbd @andytyurin re-write framebuffer texture & completely remove target switching.
  }

  draw(numOfVertices) {
    // Target can be the whole canvas, framebuffer, or rendering buffer (last of is not implemented yet).
    // if (targetType === FRAMEBUFFER_TARGET) {
    // Bind framebuffer, bind texture, write to texture, set aspect for camera projection.
    // this.draw({ numOfVertices, targetType: CANVAS_TARGET })
    // }

    // Bind texture, write to texture.

    this.#gl.drawArrays(this.#gl.TRIANGLE_STRIP, 0, numOfVertices);
  }

  enableBlending() {
    this.#blending = true;

    this.#gl.enable(this.#gl.BLEND);
  }

  disableBlending() {
    this.#blending = false;

    this.#gl.disable(this.#gl.BLEND);
  }

  setTransparentBlending() {
    if (!this.#blending) {
      this.enableBlending();
    }

    this.#gl.blendFunc(this.#gl.SRC_ALPHA, this.#gl.ONE_MINUS_SRC_ALPHA);
  }

  registerProgram({ uuid, vSource, fSource, attributes, uniforms }) {
    this._setProgram(uuid, {
      vSource,
      fSource,
      attributes,
      uniforms
    });
  }

  _setProgram(uuid, program) {
    this.#programs[uuid] = { ...(this.#programs[uuid] || {}), ...program };
  }

  _setProgramAttribute(uuid, name, data) {
    const attr = this.#programs[uuid].attributes[name];
    this.#programs[uuid].attributes[name] = { ...attr, ...data };
  }

  _setProgramUniform(uuid, name, data) {
    const uniform = this.#programs[uuid].uniforms[name];
    this.#programs[uuid].uniforms[name] = { ...uniform, ...data };
  }

  _getProgram(uuid) {
    return this.#programs[uuid];
  }

  loadFramebuffer(uuid, textureUuid) {
    if (this._hasFramebuffer(uuid)) {
      const framebuffer = this._getFramebuffer(uuid);

      framebuffer.glFramebuffer = this.#gl.createFramebuffer();

      this.bindFramebuffer(uuid);

      // tbd @andytyurin temporary hardcoded diffuse map only.
      this.#gl.framebufferTexture2D(
        this.#gl.FRAMEBUFFER,
        this.#gl.COLOR_ATTACHMENT0,
        this.#gl.TEXTURE_2D,
        this._getTexture(textureUuid).baseTexture.glTexture,
        0
      );

      this.unbindFramebuffer(uuid);
    }
  }

  registerFramebuffer(framebuffer) {
    if (!this._hasFramebuffer(framebuffer.uuid)) {
      this._setFramebuffer(framebuffer.uuid, framebuffer);
    }
  }

  deregisterFramebuffer(uuid) {
    if (this._hasFramebuffer(uuid)) {
      const { glFramebuffer } = this._getFramebuffer(uuid);

      this.#gl.deleteFramebuffer(glFramebuffer);

      this._removeFramebuffer(uuid);
    }
  }

  bindFramebuffer(uuid) {
    if (this._hasFramebuffer(uuid)) {
      if (this._isFramebufferBound(uuid)) return;

      const framebuffer = this._getFramebuffer(uuid);

      this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, framebuffer.glFramebuffer);

      this.#boundFbo = framebuffer;
    }
  }

  unbindFramebuffer() {
    if (this.#boundFbo) {
      this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
      this.#boundFbo = null;
    }
  }

  _setFramebuffer(uuid, framebuffer) {
    this.#fbo[uuid] = framebuffer;
  }

  _getFramebuffer(uuid) {
    return this.#fbo[uuid];
  }

  _removeFramebuffer(uuid) {
    delete this.#fbo[uuid];
  }

  _hasFramebuffer(uuid) {
    return !!this._getFramebuffer(uuid);
  }

  _isFramebufferLoaded(uuid) {
    return !!(this._hasFramebuffer(uuid) && this._getFramebuffer(uuid).glFramebuffer);
  }

  _isFramebufferBound(uuid) {
    return this._isFramebufferLoaded(uuid) && this._getFramebuffer(uuid) === this.#boundFbo;
  }

  loadAllPrograms() {
    Object.keys(this.#programs).forEach(p => this.loadProgram(p.uuid));
  }

  loadProgram(uuid) {
    // tbd add loading by reading program UUID with new attributes & uniforms approach.
    const program = this._getProgram(uuid);
    const { vSource, fSource, attributes, uniforms } = program;
    const attributeKeys = Object.keys(attributes);
    const uniformKeys = Object.keys(uniforms);
    const glProgram = this.#gl.createProgram();

    [[vSource, this.#gl.VERTEX_SHADER], [fSource, this.#gl.FRAGMENT_SHADER]].forEach(
      shaderDataSet => {
        const glShader = this.#gl.createShader(shaderDataSet[1]);

        this.#gl.shaderSource(glShader, shaderDataSet[0]);
        this.#gl.compileShader(glShader);

        if (!this.#gl.getShaderParameter(glShader, this.#gl.COMPILE_STATUS)) {
          throw new Error('Could not compile shader');
        }

        this.#gl.attachShader(glProgram, glShader);
      }
    );

    // Define buffers and locations for attributes.
    attributeKeys.forEach(name => {
      const { location, type } = attributes[name];

      if ([FLOAT_ARRAY_1, FLOAT_ARRAY_2, FLOAT_ARRAY_3, FLOAT_ARRAY_4].includes(type)) {
        this._setProgramAttribute(uuid, name, { glBuffer: this.#gl.createBuffer() });
      }

      if (location) {
        this.#gl.bindAttribLocation(glProgram, location, name);
      }
    });

    this.#gl.linkProgram(glProgram);

    if (!this.#gl.getProgramParameter(glProgram, this.#gl.LINK_STATUS)) {
      throw new Error(
        `Could not compile WebGL program. \n\n ${this.#gl.getProgramInfoLog(glProgram)}`
      );
    }

    // tbd better to make setter.
    // Keep the WebGL program.
    program.glProgram = glProgram;

    this._useProgram(uuid);

    // Keep attributes locations.
    attributeKeys.forEach(name => {
      const { location } = program.attributes[name];

      this._setProgramAttribute(uuid, name, {
        location: location || this.#gl.getAttribLocation(glProgram, name)
      });
    });

    // Keep uniforms locations.
    uniformKeys.forEach(name => {
      this._setProgramUniform(uuid, name, {
        location: this.#gl.getUniformLocation(glProgram, name)
      });
    });

    this._useProgram(null);
  }

  _setTexture(uuid, texture) {
    this.#textures[uuid] = texture;
  }

  _getTexture(uuid) {
    return this.#textures[uuid];
  }

  _removeTexture(uuid) {
    delete this.#textures[uuid];
  }

  _hasTexture(uuid) {
    return !!this._getTexture(uuid);
  }

  _isTextureLoaded(uuid) {
    return !!(this._hasTexture(uuid) && this._getTexture(uuid).baseTexture.glTexture);
  }

  _isTextureBound(uuid) {
    return this._isTextureLoaded(uuid) && this._getTexture(uuid) === this.#boundTexture;
  }

  registerTexture(texture) {
    if (!this._hasTexture(texture.uuid)) {
      this._setTexture(texture.uuid, texture);
    }
  }

  deregisterTexture(uuid) {
    if (this._hasTexture(uuid)) {
      const { glTexture } = this._getTexture(uuid);

      this.#gl.deleteTexture(glTexture);

      this._removeTexture(uuid);
    }
  }

  _loadFramebufferTexture(texture) {
    const gl = this.#gl;
    const { width, height } = texture.baseTexture;

    this.bindTexture(texture.uuid);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.unbindTexture();
  }

  _loadTexture(texture) {
    const {
      uuid,
      baseTexture: { image }
    } = texture;
    const gl = this.#gl;

    this.bindTexture(uuid);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    this.unbindTexture();
  }

  loadTexture(uuid) {
    const texture = this._hasTexture(uuid) && this._getTexture(uuid);

    // Check is texture was found (registered).
    if (!texture) {
      throw new Error(`Texture with uuid:${uuid} is not registered`);
    }

    // Do not load texture twice.
    if (this._isTextureLoaded(uuid)) return;

    texture.baseTexture.glTexture = this.#gl.createTexture();

    if (textureUtils.isFramebufferTexture(texture)) {
      this._loadFramebufferTexture(texture);
      return;
    }

    if (textureUtils.isTexture(texture)) {
      this._loadTexture(texture);
    }
  }

  loadAllTextures() {
    Object.keys(this.#textures).forEach(t => this.loadTexture(t));
  }

  setAttributeValue(programUuid, name, value) {
    const program = this._getProgram(programUuid);
    program.attributes[name].value = value;
  }

  setUniformValue(programUuid, name, value) {
    const program = this._getProgram(programUuid);
    program.uniforms[name].value = value;
  }

  _bindAttribute(name, attribute) {
    const { location, value, type, glBuffer } = attribute;
    let attrSize = 0;

    switch (type) {
      case FLOAT_1:
        this.#gl.vertexAttrib1f(location, (Array.isArray(value) && value[0]) || value);
        break;
      case FLOAT_2:
        this.#gl.vertexAttrib2f(location, value[0], value[1]);
        break;
      case FLOAT_3:
        this.#gl.vertexAttrib3f(location, value[0], value[1], value[2]);
        break;
      case FLOAT_4:
        this.#gl.vertexAttrib4f(location, value[0], value[1], value[2], value[3]);
        break;
      case FLOAT_ARRAY_1:
        attrSize = 1;
        break;
      case FLOAT_ARRAY_2:
        attrSize = 2;
        break;
      case FLOAT_ARRAY_3:
        attrSize = 3;
        break;
      case FLOAT_ARRAY_4:
        attrSize = 4;
        break;
      default:
    }

    if (attrSize) {
      if (!glBuffer) throw new Error(`WebGL Buffer is missed for attribute "${name}"`);

      this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, glBuffer);
      this.#gl.vertexAttribPointer(location, attrSize, this.#gl.FLOAT, false, 0, 0);
      this.#gl.enableVertexAttribArray(location);
      this.#gl.bufferData(this.#gl.ARRAY_BUFFER, value, this.#gl.STATIC_DRAW);
      this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, null);
    }
  }

  _bindUniform(name, uniform) {
    const { location, value, type } = uniform;

    switch (type) {
      case FLOAT_1:
        this.#gl.uniform1f(location, value[0]);
        break;
      case FLOAT_2:
        this.#gl.uniform2f(location, value[0], value[1]);
        break;
      case FLOAT_3:
        this.#gl.uniform3f(location, value[0], value[1], value[2]);
        break;
      case FLOAT_4:
        this.#gl.uniform4f(location, value[0], value[1], value[2], value[3]);
        break;
      case FLOAT_ARRAY_1:
        this.#gl.uniform1fv(location, value);
        break;
      case FLOAT_ARRAY_2:
        this.#gl.uniform2fv(location, value);
        break;
      case FLOAT_ARRAY_3:
        this.#gl.uniform3fv(location, value);
        break;
      case FLOAT_ARRAY_4:
        this.#gl.uniform4fv(location, value);
        break;
      case MAT_2:
        this.#gl.uniformMatrix2fv(location, false, value);
        break;
      case MAT_3:
        this.#gl.uniformMatrix3fv(location, false, value);
        break;
      case INT_1:
        this.#gl.uniform1i(location, value);
        break;
      default:
    }
  }

  _isProgramRegistered(uuid) {
    return !!this._getProgram(uuid);
  }

  _isProgramLoaded(uuid) {
    const { glProgram } = this._getProgram(uuid) || {};

    return !!glProgram;
  }

  _isProgramBound(uuid) {
    return this._getProgram(uuid) === this.#boundProgram;
  }

  bindProgram(uuid) {
    if (this._isProgramRegistered(uuid)) {
      const program = this._getProgram(uuid);
      const { attributes, uniforms, prevAttributes = {}, prevUniforms = {} } = program;

      if (!this._isProgramBound(uuid)) {
        this._useProgram(uuid);

        this.#boundProgram = program;
        this.#boundProgram.prevAttributes = {};
        this.#boundProgram.prevUniforms = {};
      }

      Object.keys(attributes).forEach(name => {
        const currentAttribute = attributes[name];
        const prevAttribute = prevAttributes[name];
        const attributesDefined = !!(currentAttribute && prevAttribute);

        // Bind attribute if value has been changed.
        if (!attributesDefined || currentAttribute.value !== prevAttribute.value) {
          this._bindAttribute(name, currentAttribute);
          this.#boundProgram.prevAttributes[name] = { ...currentAttribute };
        }
      });

      Object.keys(uniforms).forEach(name => {
        const currentUniform = uniforms[name];
        const prevUniform = prevUniforms[name];
        const uniformsDefined = !!(currentUniform && prevUniform);

        // Bind uniform if value has been changed.
        if (!uniformsDefined || currentUniform.value !== prevUniform.value) {
          this._bindUniform(name, currentUniform);
          this.#boundProgram.prevUniforms[name] = { ...currentUniform };
        }
      });
    }
  }

  _useProgram(uuid) {
    const { glProgram = null } = this._getProgram(uuid) || {};
    this.#gl.useProgram(glProgram);
  }

  unbindProgram() {
    if (this.#boundProgram) {
      this._useProgram(null);
      this.#boundProgram = null;
    }
  }

  bindTexture(uuid, type = DIFFUSE_MAP) {
    if (this._hasTexture(uuid)) {
      if (this._isTextureBound(uuid)) return;

      const texture = this._getTexture(uuid);
      const {
        baseTexture: { glTexture }
      } = texture;

      const textureIntMap = {
        [DIFFUSE_MAP]: this.#gl.TEXTURE0
      };

      this.#gl.activeTexture(textureIntMap[type]);
      this.#gl.bindTexture(this.#gl.TEXTURE_2D, glTexture);

      this.#boundTexture = texture;
    }
  }

  unbindTexture() {
    if (this.#boundTexture) {
      this.#gl.bindTexture(this.#gl.TEXTURE_2D, null);
      this.#boundTexture = null;
    }
  }

  get fpsThreshold() {
    return this.#fpsThreshold;
  }

  set viewport({ width, height }) {
    this.#viewport = { width, height };

    this.#gl.viewport(0, 0, width, height);
  }

  get viewport() {
    return this.#viewport;
  }

  get canvas() {
    return this.#canvas;
  }
}

export default WebGLRenderer;
