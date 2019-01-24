import { EventEmitter } from 'fbemitter';

import { createRenderingContext } from './webgl';

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

export const COLOR_MAP = 'color_map';

export const DEFAULT_SP_NAME = '_default';

export class Scene {
  #children;

  constructor() {
    this.#children = [];
  }

  add(child) {
    this.#children.push(child);
  }

  get children() {
    return this.#children;
  }
}

export class WebGLRenderer extends EventEmitter {
  #gl;

  #programs;

  #boundProgramName;

  #boundTextureName;

  #blending;

  constructor({ canvas }) {
    super();
    this.#gl = createRenderingContext(canvas);
    this.#blending = false;
    this.#boundProgramName = null;
    this.#boundTextureName = null;
    this.#programs = {};
    this.#textures = {};
  }

  draw(numOfVertices) {
    this.#gl.drawArrays(this.#gl.TRIANGLE_STRIP, 0, numOfVertices);
  }

  enableBlending() {
    this.#blending = true;
  }

  disableBlending() {
    this.#blending = false;
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
    Object.keys(this.#programs).forEach(this.loadProgram);
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
    attributes.forEach(({ name, location, type }) => {
      if ([FLOAT_ARRAY_1, FLOAT_ARRAY_2, FLOAT_ARRAY_3, FLOAT_ARRAY_4].includes(type)) {
        this.#programs[programName].attributes[name].glBuffer = this.#gl.createBuffer();
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
    attributes.forEach(({ name, location }) => {
      if (typeof location === 'undefined') {
        this.#programs[programName].attributes[name].location = this.#gl.getAttribLocation(
          glProgram,
          name
        );
      }
    });

    // Keep uniforms locations.
    uniforms.forEach(({ name }) => {
      this.#programs[programName].uniforms[name].location = this.#gl.getUniformLocation(
        glProgram,
        name
      );
    });

    this.useProgram(null);
  }

  registerTexture({ name, image, type }) {
    this.#textures[name] = {
      image,
      type
    };
  }

  loadTexture(textureName) {
    const { image } = this.#textures[textureName];
    const glTexture = this.#gl.createTexture();

    this.#textures[textureName].glTexture = glTexture;

    this.useTexture(textureName);

    this.#gl.pixelStorei(this.#gl.UNPACK_FLIP_Y_WEBGL, 1);
    this.#gl.texImage2D(
      this.#gl.TEXTURE_2D,
      0,
      this.#gl.RGBA,
      this.#gl.RGBA,
      this.#gl.UNSIGNED_BYTE,
      image
    );
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_S, this.#gl.CLAMP_TO_EDGE);
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_T, this.#gl.CLAMP_TO_EDGE);
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MAG_FILTER, this.#gl.LINEAR);
    this.#gl.texParameteri(
      this.#gl.TEXTURE_2D,
      this.#gl.TEXTURE_MIN_FILTER,
      this.#gl.LINEAR_MIPMAP_NEAREST
    );

    this.#gl.generateMipmap(this.#gl.TEXTURE_2D);

    this.useTexture(null);
  }

  loadAllTextures() {
    Object.keys(this.#textures).forEach(this.loadTexture);
  }

  setAttributeValue(name, value) {
    this.#programs[this.#boundProgramName].attributes[name].value = value;
  }

  setUniformValue(name, value) {
    this.#programs[this.#boundProgramName].uniforms[name].value = value;
  }

  bindProgramAttributes() {
    const program = this.#programs[this.#boundProgramName];

    Object.keys(program.attributes).forEach(name => {
      const { location, value, type, glBuffer } = program.attributes[name];

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
        this.#gl.bufferData(this.#gl.ARRAY_BUFFER, Float32Array.from(value), this.#gl.STATIC_DRAW);
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

  useProgram(programName) {
    if (programName) {
      if (this.#boundProgramName === programName) return;

      this.#gl.useProgram(this.#programs[programName].glProgram);
    } else {
      this.#gl.useProgram(null);
    }
  }

  useTexture(textureName) {
    if (textureName) {
      if (this.#boundTextureName === textureName) return;

      const { glTexture, type } = this.#textures[textureName];

      const textureTypeIds = {
        [COLOR_MAP]: this.#gl.TEXTURE0
      };

      this.#gl.activeTexture(textureTypeIds[type]);

      this.#gl.bindTexture(this.#gl.TEXTURE_2D, glTexture);
    } else {
      this.#gl.bindTexture(this.#gl.TEXTURE_2D, null);
    }
  }
}
