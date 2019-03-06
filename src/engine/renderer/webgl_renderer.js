import { EventEmitter } from 'fbemitter';

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
import { COLOR_MAP } from './texture_map';
import { CANVAS_DRAWING_TARGET, TEXTURE_DRAWING_TARGET } from './drawing_target';

export class WebGLRenderer extends EventEmitter {
  // Rendering context.
  #gl;

  // Shader programs with uniforms, locatins and program handlers.
  #programs;

  // Currently bound shader program.
  #boundProgramName;

  // Currently bound texture.
  #boundTextureName;

  // Currently bound rendering target.
  #drawingTarget;

  // Is blending enabled, `true` if enabled, otherwise `false`.
  #blending;

  // Texture name-object key-value of registered textures.
  #textures;

  // FPS threshold (1-60 FPS) for rendering.
  #fpsThreshold;

  // Width, height.
  #viewport;

  // Attached rendering targets.
  #targets;

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
    this.#boundProgramName = null;
    this.#boundTextureName = null;
    this.#drawingTarget = CANVAS_DRAWING_TARGET;
    this.#programs = {};
    this.#textures = {};
    this.#fpsThreshold = fpsThreshold;
    this.#viewport = { width: 1, height: 1 };
    this.#targets = {
      _default: { type: CANVAS_DRAWING_TARGET }
    };
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

  registerProgram({ name, vSource, fSource, attributes, uniforms }) {
    this.#programs[name] = {
      vSource,
      fSource,
      attributes,
      uniforms
    };
  }

  loadAllPrograms() {
    Object.keys(this.#programs).forEach(p => this.loadProgram(p));
  }

  loadProgram(programName) {
    const { vSource, fSource, attributes, uniforms } = this.#programs[programName];

    const glProgram = this.#gl.createProgram();

    this.#programs[programName].glProgram = glProgram;

    // Load shaders.
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
    attributes.forEach(({ name, location, type }, idx) => {
      if ([FLOAT_ARRAY_1, FLOAT_ARRAY_2, FLOAT_ARRAY_3, FLOAT_ARRAY_4].includes(type)) {
        this.#programs[programName].attributes[idx].glBuffer = this.#gl.createBuffer();
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

    this.useProgram(programName);

    // Keep attributes locations.
    attributes.forEach(({ name, location }, idx) => {
      if (typeof location === 'undefined') {
        this.#programs[programName].attributes[idx].location = this.#gl.getAttribLocation(
          glProgram,
          name
        );
      }
    });

    // Keep uniforms locations.
    uniforms.forEach(({ name }, idx) => {
      this.#programs[programName].uniforms[idx].location = this.#gl.getUniformLocation(
        glProgram,
        name
      );
    });

    this.useProgram(null);
  }

  registerTarget({ type, name }) {
    this.#targets[name] = {
      type
    };
  }

  loadAllTargets() {
    Object.keys(this.#targets).forEach(t => this.loadTarget(t));
  }

  loadTarget(targetName) {
    const { type } = this.#targets[targetName];

    if (type === TEXTURE_DRAWING_TARGET) {
      const framebuffer = this.#gl.createFramebuffer();
      this.#targets[targetName].glFramebuffer = framebuffer;
    }
  }

  registerTexture({ name, image, type, textureAtlas }) {
    const textureName = (textureAtlas && textureAtlas.name) || name;

    // In a case if this is sub-texture or texture atlas,
    // then texture atlas should be registered first,
    // but only once.
    if (textureAtlas && !this._isTextureRegistered(textureName)) {
      this.registerTexture(textureAtlas);
    }

    // Register texture, but in a case if this is a sub-texture,
    // then we need to set `textureAtlas` property as well,
    // but should be careful that we are propagating link
    // to already registered texture (texture atlas).
    this.#textures[name] = {
      image,
      type,
      textureAtlas: textureAtlas && this._getTexture(textureName),
      name
    };
  }

  loadTexture(textureName) {
    const { image, name } = this._getBaseTexture(textureName);

    // Load texture if it was not loaded before.
    if (!this._isBaseTextureLoaded(name)) {
      const glTexture = this.#gl.createTexture();

      this.#textures[name].glTexture = glTexture;

      // We don't need to set up texture without image.
      // We don't need image in a case of framebuffer definition.
      if (image) {
        this.useTexture(name);

        this.#gl.pixelStorei(this.#gl.UNPACK_FLIP_Y_WEBGL, 1);
        this.#gl.texImage2D(
          this.#gl.TEXTURE_2D,
          0,
          this.#gl.RGBA,
          this.#gl.RGBA,
          this.#gl.UNSIGNED_BYTE,
          image
        );
        this.#gl.texParameteri(
          this.#gl.TEXTURE_2D,
          this.#gl.TEXTURE_WRAP_S,
          this.#gl.CLAMP_TO_EDGE
        );
        this.#gl.texParameteri(
          this.#gl.TEXTURE_2D,
          this.#gl.TEXTURE_WRAP_T,
          this.#gl.CLAMP_TO_EDGE
        );
        this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MAG_FILTER, this.#gl.LINEAR);
        this.#gl.texParameteri(
          this.#gl.TEXTURE_2D,
          this.#gl.TEXTURE_MIN_FILTER,
          this.#gl.LINEAR_MIPMAP_NEAREST
        );

        this.#gl.generateMipmap(this.#gl.TEXTURE_2D);

        this.useTexture(null);
      }
    }
  }

  loadAllTextures() {
    Object.keys(this.#textures).forEach(t => this.loadTexture(t));
  }

  setAttributeValue(name, value) {
    const idx = this.#programs[this.#boundProgramName].attributes.findIndex(
      attr => attr.name === name
    );
    this.#programs[this.#boundProgramName].attributes[idx].value = value;
  }

  setUniformValue(name, value) {
    const idx = this.#programs[this.#boundProgramName].uniforms.findIndex(
      uniform => uniform.name === name
    );
    this.#programs[this.#boundProgramName].uniforms[idx].value = value;
  }

  bindProgramAttributes() {
    const { attributes } = this.#programs[this.#boundProgramName];

    attributes.forEach(({ name, location, value, type, glBuffer }) => {
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
    });
  }

  bindProgramUniforms() {
    const program = this.#programs[this.#boundProgramName];

    Object.keys(program.uniforms).forEach(name => {
      const { location, value, type } = program.uniforms[name];

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
    });
  }

  bindTarget(name) {
    const target = this.#targets[name];

    if (target) {
      const { glFramebuffer } = target;
      this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, glFramebuffer);
      this.#drawingTarget = name;
    } else {
      this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
      this.#drawingTarget = '_default';
    }
  }

  useProgram(programName) {
    if (programName) {
      if (this.#boundProgramName === programName) return;

      this.#gl.useProgram(this.#programs[programName].glProgram);

      this.#boundProgramName = programName;
    } else {
      this.#gl.useProgram(null);

      this.#boundProgramName = null;
    }
  }

  useTexture(textureName) {
    if (textureName) {
      if (this.#boundTextureName === textureName) return;

      const { glTexture, type, name } = this._getBaseTexture(textureName);

      const textureTypeIds = {
        [COLOR_MAP]: this.#gl.TEXTURE0
      };

      this.#gl.activeTexture(textureTypeIds[type]);
      this.#gl.bindTexture(this.#gl.TEXTURE_2D, glTexture);

      this.#boundTextureName = name;
    } else {
      this.#gl.bindTexture(this.#gl.TEXTURE_2D, null);

      this.#boundTextureName = null;
    }
  }

  // useFramebufferTexture(textureName) {
  // if (textureName) {
  //   if (this.#boundTextureName === textureName) return;
  //   const { glFramebuffer } = this._getBaseTexture(textureName);
  //   this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, glFramebuffer);
  //   this.useTexture(textureName);
  // } else {
  //   this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
  // }
  // }

  /**
   * Get base texture from registered textures.
   *
   * Base texture is original texture with attached image.
   * Main difference between texture and base texture, that
   * first one could be sub-texture of texture atlas, so
   * for example if we need to load the original texture with image,
   * then we need to get reference of texture atlas, which actually
   * our base texture.
   */
  _getBaseTexture(name) {
    const t = this.#textures[name];
    return (t && t.textureAtlas) || t;
  }

  _getTexture(name) {
    return this.#textures[name];
  }

  _isBaseTextureLoaded(name) {
    const t = this._getBaseTexture(name);
    return !!(t && t.glTexture);
  }

  _isTextureRegistered(name) {
    return !!this._getTexture(name);
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

  get drawingTarget() {
    return this.#drawingTarget;
  }

  get drawingTargetType() {
    return this.#targets[this.#drawingTarget].type;
  }

  get canvas() {
    return this.#canvas;
  }
}

export default WebGLRenderer;
