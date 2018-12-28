import {
  FLOAT_ARRAY_1,
  FLOAT_ARRAY_2,
  FLOAT_ARRAY_3,
  FLOAT_ARRAY_4,
  FLOAT_1,
  FLOAT_2,
  FLOAT_3,
  FLOAT_4,
  MAT_2,
  MAT_3,
  INT_1
} from './qualifier_types';

export class ShaderProgram {
  #vShader;

  #fShader;

  #attributes;

  #uniforms;

  #glProgram;

  constructor(vShader, fShader, attributes = {}, uniforms = {}) {
    this.#vShader = vShader;
    this.#fShader = fShader;
    this.#attributes = attributes;
    this.#uniforms = uniforms;
  }

  prepare(gl) {
    this.#glProgram = gl.createProgram();

    // Attach vertex & fragment shaders.
    gl.attachShader(this.#glProgram, this.#vShader.prepare(gl, gl.VERTEX_SHADER));
    gl.attachShader(this.#glProgram, this.#fShader.prepare(gl, gl.FRAGMENT_SHADER));

    // Create buffers and pre-set locations for attributes.
    Object.keys(this.#attributes).forEach(name => {
      const { location, type } = this.#attributes[name];

      if ([FLOAT_ARRAY_1, FLOAT_ARRAY_2, FLOAT_ARRAY_3, FLOAT_ARRAY_4].includes(type)) {
        this.#attributes[name].glBuffer = gl.createBuffer();
      }

      if (location) {
        gl.bindAttribLocation(this.#glProgram, location, name);
      }
    });

    gl.linkProgram(this.#glProgram);

    if (!gl.getProgramParameter(this.#glProgram, gl.LINK_STATUS)) {
      throw new Error(
        `Could not compile WebGL program. \n\n ${gl.getProgramInfoLog(this.#glProgram)}`
      );
    }

    gl.useProgram(this.#glProgram);

    // Keep generated attributes locations.
    Object.keys(this.#attributes).forEach(name => {
      const { location } = this.#attributes[name];

      if (typeof location === 'undefined') {
        this.#attributes[name].location = gl.getAttribLocation(this.#glProgram, name);
      }
    });

    // Keep generated uniforms locations.
    Object.keys(this.#uniforms).forEach(name => {
      this.#uniforms[name].location = gl.getUniformLocation(this.#glProgram, name);
    });

    gl.useProgram(null);
  }

  update(gl, attributes = {}, uniforms = {}) {
    Object.keys(attributes).forEach(name => {
      const value = attributes[name];
      const { value: prevValue, location, type, glBuffer } = this.#attributes[name];

      if (prevValue !== value) {
        this.#attributes[name].value = value;

        let attrSize = 0;

        switch (type) {
          case FLOAT_1:
            gl.vertexAttrib1f(location, (Array.isArray(value) && value[0]) || value);
            break;
          case FLOAT_2:
            gl.vertexAttrib2f(location, value[0], value[1]);
            break;
          case FLOAT_3:
            gl.vertexAttrib3f(location, value[0], value[1], value[2]);
            break;
          case FLOAT_4:
            gl.vertexAttrib4f(location, value[0], value[1], value[2], value[3]);
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

          gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
          gl.vertexAttribPointer(location, attrSize, gl.FLOAT, false, 0, 0);
          gl.enableVertexAttribArray(location);
          gl.bufferData(gl.ARRAY_BUFFER, value, gl.STATIC_DRAW);
          gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
      }
    });

    Object.keys(uniforms).forEach(name => {
      const value = uniforms[name];
      const { value: prevValue, location, type } = this.#uniforms[name];

      if (prevValue !== value) {
        this.#uniforms[name].value = value;

        switch (type) {
          case FLOAT_1:
            gl.uniform1f(location, value[0]);
            break;
          case FLOAT_2:
            gl.uniform2f(location, value[0], value[1]);
            break;
          case FLOAT_3:
            gl.uniform3f(location, value[0], value[1], value[2]);
            break;
          case FLOAT_4:
            gl.uniform4f(location, value[0], value[1], value[2], value[3]);
            break;
          case FLOAT_ARRAY_1:
            gl.uniform1fv(location, value);
            break;
          case FLOAT_ARRAY_2:
            gl.uniform2fv(location, value);
            break;
          case FLOAT_ARRAY_3:
            gl.uniform3fv(location, value);
            break;
          case FLOAT_ARRAY_4:
            gl.uniform4fv(location, value);
            break;
          case MAT_2:
            gl.uniformMatrix2fv(location, false, value);
            break;
          case MAT_3:
            gl.uniformMatrix3fv(location, false, value);
            break;
          case INT_1:
            gl.uniform1i(location, value);
            break;
          default:
        }
      }
    });

    // gl.useProgram(null);
  }

  get glProgram() {
    return this.#glProgram;
  }
}

export default ShaderProgram;
